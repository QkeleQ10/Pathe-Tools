<script setup lang="ts">
import { ref, inject, useTemplateRef, onMounted, onBeforeUnmount, Ref, watch, h } from 'vue';
import { useDropZone, useStorage } from '@vueuse/core';
import { format } from 'date-fns';
import { Announcement, AnnouncementRule, Show } from '@/scripts/types.ts';
import { voices, getSoundInfo, Voice } from '@/scripts/voices';
import { assembleAudioClient } from '@/scripts/assembleAudio';
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { showDialog } from '@/scripts/dialogManager';
import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue';
import AnnouncementBuilder from '@features/ushering/announcer/AnnouncementBuilder.vue';
import RuleList from '@features/ushering/announcer/RuleList.vue';
import ScheduledAnnouncement from '@features/ushering/announcer/ScheduledAnnouncement.vue';
import VoicesSelector from '@features/ushering/announcer/VoicesSelector.vue';

const store = useTmsScheduleStore()
const now = inject<Ref<Date>>('now');

const main = useTemplateRef('main');

const showRuleEditor = ref(false);
const optionsChanged = ref(false);

const presetRulesDefault: AnnouncementRule[] = [
    {
        id: 'plfStart',
        name: '4DX-inloop',
        segments: [
            { spriteName: 'chimea', offset: -1600 },
            { spriteName: 'start', offset: 0 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        enabled: true,
        trigger: {
            property: 'scheduledTime',
            preponeMinutes: 15,
        },
        filter: {
            plfOnly: true,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'start',
        name: 'Start',
        segments: [
            { spriteName: 'chimea', offset: -1600 },
            { spriteName: 'start', offset: 0 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        enabled: false,
        trigger: {
            property: 'scheduledTime',
            preponeMinutes: 0,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'mainShow',
        name: 'Start hoofdfilm',
        segments: [
            { spriteName: 'chimea', offset: -1600 },
            { spriteName: 'mainshow', offset: 0 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        enabled: false,
        trigger: {
            property: 'mainShowTime',
            preponeMinutes: 0,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'intermission',
        name: 'Pauze',
        segments: [
            { spriteName: 'chimea', offset: -1600 },
            { spriteName: 'intermission', offset: 0 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        enabled: true,
        trigger: {
            property: 'intermissionTime',
            preponeMinutes: 1,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'credits',
        name: 'Aftiteling',
        segments: [
            { spriteName: 'chimeb', offset: -1600 },
            { spriteName: 'credits', offset: 0 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        enabled: true,
        trigger: {
            property: 'creditsTime',
            preponeMinutes: 1,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'end',
        name: 'Einde voorstelling',
        segments: [
            { spriteName: 'chimea', offset: -1600 },
            { spriteName: 'end', offset: 0 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        enabled: false,
        trigger: {
            property: 'endTime',
            preponeMinutes: 0,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'finalMainShowStart',
        name: 'Start laatste hoofdfilm',
        segments: [
            { spriteName: 'chimea', offset: -1600 },
            { spriteName: 'finalshow', offset: 0 }
        ],
        enabled: false,
        trigger: {
            property: 'mainShowTime',
            preponeMinutes: 0,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: true,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
] as const;

const presetRulesOverrides = useStorage<{ [key: string]: boolean }>('announcement-rules-overrides', {}, localStorage, { mergeDefaults: true });
const presetRules = ref<AnnouncementRule[]>(
    presetRulesDefault.map(rule => ({
        ...rule,
        enabled: presetRulesOverrides.value[rule.id] ?? rule.enabled,
    }))
);
watch(presetRules, () => {
    presetRulesOverrides.value = Object.fromEntries(
        presetRules.value
            .filter(rule => rule.enabled !== presetRulesDefault.find(r => r.id === rule.id)?.enabled)
            .map(rule => [rule.id, rule.enabled])
    );
}, { deep: true });

const customRules = useStorage<AnnouncementRule[]>('custom-rules', [], localStorage, { mergeDefaults: true });

const chimeAReplacement = useStorage('chimea-replacement', 7);
const chimeBReplacement = useStorage('chimeb-replacement', 7);

const preferredVoices = useStorage('preferred-voices', ['default'], localStorage, { mergeDefaults: true });
const voiceBehaviour = useStorage('voice-behaviour', 'roundrobin', localStorage);

const customAnnouncementSegments = ref<{ spriteName: string; offset: number }[]>([{ spriteName: 'chimea', offset: -1600 },]);
const customAnnouncementDate = ref<Date>(new Date());

const scheduledAnnouncements = ref<Announcement[]>([])
store.$subscribe(scheduleAnnouncements, { deep: true })

let intervalId: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
    scheduleAnnouncements();
    intervalId = setInterval(enqueueProximateAnnouncements, 10000);
})

onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId);
})

/**
 * Schedule all announcements based on the rules and the imported timetable
 */
async function scheduleAnnouncements() {
    optionsChanged.value = false;
    let array: Announcement[] = [];

    for (const rule of [...presetRules.value, ...customRules.value]) {
        if (!rule.enabled) continue;

        let arr: Announcement[] = [];

        store.table.forEach((show, index) => {
            if (showMatchesFilter(show, index, rule)) {
                const announcement = {
                    time: new Date(show[rule.trigger.property].getTime() - (rule.trigger.preponeMinutes || 0) * 60000 - 5000),
                    show: show,
                    segments: rule.segments.map(segment => ({
                        ...segment,
                        spriteName: segment.spriteName.replace('#', `${String(show.auditoriumNumber).padStart(2, '0')}`),
                    })),
                    audio: null,
                };
                if (announcement.time.getTime() > Date.now()) {
                    arr.push(announcement);
                }
            }
        })

        arr.sort((a, b) => a.time.getTime() - b.time.getTime());

        if (rule.filter.firstShowOnly)
            arr = arr.slice(0, 1); // keep only the first element of the announcementsForRule array
        if (rule.filter.lastShowOnly)
            arr = arr.slice(-1); // keep only the last element of the announcementsForRule array

        array.push(...arr);
    }

    scheduledAnnouncements.value = array;

    for (const announcement of [...scheduledAnnouncements.value].sort((a, b) => a.time.getTime() - b.time.getTime())) {
        const segmentsWithVoices = selectVoices(announcement.segments.map(segment => {
            if (segment.spriteName === 'chimea') {
                return { offset: chimeAReplacement.value === 0 ? segment.offset + 800 : segment.offset, spriteName: `chime${chimeAReplacement.value}` };
            }
            if (segment.spriteName === 'chimeb') {
                return { offset: chimeBReplacement.value === 0 ? segment.offset + 800 : segment.offset, spriteName: `chime${chimeBReplacement.value}` };
            }
            return segment;
        }), preferredVoices.value.map(s => voices[s]));
        announcement.audio = await assembleAudio(segmentsWithVoices);
    }

    enqueueProximateAnnouncements();
}

/**
 * Queue all announcements that are scheduled to play in the next 10 seconds
 */
async function enqueueProximateAnnouncements() {
    for (const announcement of scheduledAnnouncements.value) {
        const timeUntilAnnouncement = announcement.time.getTime() - Date.now() - 1000;
        if (timeUntilAnnouncement > -60000 && timeUntilAnnouncement < 10000 && !announcement.scheduled) {
            if (!announcement.audio) {
                const segmentsWithVoices = selectVoices(announcement.segments.map(segment => {
                    if (segment.spriteName === 'chimea') {
                        return { offset: chimeAReplacement.value === 0 ? segment.offset + 800 : segment.offset, spriteName: `chime${chimeAReplacement.value}` };
                    }
                    if (segment.spriteName === 'chimeb') {
                        return { offset: chimeBReplacement.value === 0 ? segment.offset + 800 : segment.offset, spriteName: `chime${chimeBReplacement.value}` };
                    }
                    return segment;
                }), preferredVoices.value.map(s => voices[s]));
                announcement.audio = await assembleAudio(segmentsWithVoices);
            }

            setTimeout(() => {
                waitForOtherAnnouncementsToFinish(() => {
                    if (!announcement.audio) return;
                    announcement.audio.play();
                    announcement.audio.addEventListener('ended', () => {
                        announcement.audio.remove();
                        announcement.audio = null; // Clear the audio reference after playing
                    }, { once: true });
                });
            }, Math.max(0, timeUntilAnnouncement));

            announcement.scheduled = true; // Mark the announcement as scheduled

            // TODO: this is broken lol
            function waitForOtherAnnouncementsToFinish(callback: () => void) {
                // Check if there is any other announcements playing. If so, wait for it to finish before calling callback().
                if (!scheduledAnnouncements.value.some(a => a.audio && !a.audio.paused)) {
                    callback();
                } else {
                    setTimeout(() => waitForOtherAnnouncementsToFinish(callback), 500);
                }
            }
        }
    }
}

function showMatchesFilter(show: Show, index: number, rule: AnnouncementRule) {
    let matches = true;

    if (!show[rule.trigger.property] || !show[rule.trigger.property].getTime()) return false;

    if (rule.filter.plfOnly && !show.auditorium.includes('4DX')) matches = false;
    if (rule.filter.playlistTitleIncludes && !show.title.toLowerCase().includes(rule.filter.playlistTitleIncludes.toLowerCase())) matches = false;
    if (rule.filter.playlistTitleExcludes && show.title.toLowerCase().includes(rule.filter.playlistTitleExcludes.toLowerCase())) matches = false;

    return matches;
}

function selectVoices(segments: { spriteName: string; offset: number }[], selectedVoices: Voice[]): { voice: Voice; spriteName: string; offset: number }[] {
    const preferredVoices = selectedVoices.sort(() => 0.5 - Math.random());
    const allVoices = Object.values(voices);

    // Loop through the preferred voices in random order to find one that has all the required sprites
    for (const voice of preferredVoices) {
        // Check if the voice has all the required sprites
        if (segments.every(segment => segment.spriteName === 'chime' || voice.sprite[segment.spriteName])) {
            return segments.map(segment => ({
                ...segment,
                voice: segment.spriteName === 'chime' ? voices.default : voice
            }));
        }
    }

    // If no voice has all the required sprites, use a mix of voices (prefferred voices first)
    return segments.map(segment => {
        const voice = [...preferredVoices, ...allVoices].find(v => v.sprite[segment.spriteName]);
        return {
            ...segment,
            voice: (segment.spriteName === 'chime' ? voices.default : voice) || voices.default
        };
    });
}

function assembleAudio(segments: { voice: Voice; spriteName: string; offset: number }[]) {
    return new Promise<HTMLAudioElement>(async (resolve) => {
        const url = await assembleAudioClient(segments);
        const audio = new Audio(url);
        resolve(audio);
    })
}

async function previewAnnouncement(segments: { spriteName: string; offset: number }[], selectedVoices: Voice[] = preferredVoices.value.map(s => voices[s])) {
    segments = segments.map(segment => {
        if (segment.spriteName === 'chimea') {
            return { offset: chimeAReplacement.value === 0 ? segment.offset + 800 : segment.offset, spriteName: `chime${chimeAReplacement.value}` };
        }
        if (segment.spriteName === 'chimeb') {
            return { offset: chimeBReplacement.value === 0 ? segment.offset + 800 : segment.offset, spriteName: `chime${chimeBReplacement.value}` };
        }
        return segment;
    });
    const segmentsWithVoices = selectVoices(segments, selectedVoices);
    const audio = await assembleAudio(segmentsWithVoices);
    audio.play();
}

const { isOverDropZone } = useDropZone(main, {
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
})

function showFeedbackDialog() {
    const dialog = showDialog([
        h('h3', "Ik heb feedback nodig!"),
        h('p', [
            "Het geluid dat Pathé al jaren in Rosetta gebruikt blijkt ", h('a', { href: 'https://www.youtube.com/watch?v=6HNvZ93dYHg&list=PLbpXvhGLBsTgPyl_yDHlqT7QW10Rz6-dg&index=1', target: '_blank', style: 'color: #feb91e' }, "afkomstig te zijn van Российские железные дороги — de Russische spoorwegmaatschappij"), ". Daarom wil ik een ander geluid vinden. Maar dat blijkt niet zo makkelijk te zijn. ",
            h('br'),
            h('br'),
            "Ik heb een aantal nieuwe geluiden geüpload. Je kunt die rechtsonderin bij 'Handmatige omroep' beluisteren.",
            h('br'),
            h('br'),
            "Beluister ze eens op de portofoon en beslis samen welke het fijnste is. Is het geluid niet te hoog of luid? Is het lang genoeg om de portofoon te activeren?",
            h('br'),
            h('br'),
            "Kies daarna bij 'Regels' welke geluiden het beste werken. Laat mij ook even weten wat prettig is en wat er beter kan.",
            h('br'),
            h('br'),
            "Bedankt, ", h('br'), "Quinten"
        ])
    ])
}
</script>

<template>
    <main ref="main">
        <TimetableUploadSection />
        <section>
            <div class="section-content flex" style="flex-wrap: wrap-reverse;">
                <div style="flex: 50% 1 1;">
                    <div class="flex" style="justify-content: space-between; align-items: center">
                        <h2>Geplande omroepen</h2>
                        <AnnouncementBuilder v-model="customAnnouncementSegments">
                            <Icon>add</Icon>
                            <span>Nieuwe omroep</span>
                            <template #footer>
                                <h3>Afspeelopties</h3>
                                <div class="flex buttons">
                                    <InputDate identifier="customAnnouncementDate" v-model="customAnnouncementDate"
                                        style="height: 48px">
                                        Inplannen voor</InputDate>
                                    <Button
                                        @click="scheduledAnnouncements.push({ time: new Date(customAnnouncementDate), segments: customAnnouncementSegments.map(segment => ({ ...segment })), audio: null })">
                                        <Icon>timer</Icon>
                                        Omroep inplannen
                                    </Button>
                                    <Button class="secondary add-rule"
                                        @click="previewAnnouncement(customAnnouncementSegments)">
                                        <Icon>play_arrow</Icon>
                                        Nu afspelen
                                    </Button>
                                </div>
                            </template>
                        </AnnouncementBuilder>
                    </div>
                    <Transition name="list">
                        <div class="banner" v-if="optionsChanged" key="optionsChangedWarning"
                            style="background-color: #d53232; padding: 4px 16px; border-radius: 5px; margin-bottom: 16px;">
                            <h3 style="margin-bottom: 0;">Let op: opties gewijzigd</h3>
                            <p style="margin-top: 4px;">Bereid de omroepen opnieuw voor om de wijzigingen toe te passen.
                            </p>
                        </div>
                    </Transition>
                    <ul id="upcoming-announcements" class="scrollable-list" style="max-height: 700px;">
                        <TransitionGroup name="list">
                            <ScheduledAnnouncement
                                v-for="announcement in [...scheduledAnnouncements].sort((a, b) => a.time.getTime() - b.time.getTime())"
                                :announcement="announcement" :key="announcement.time.getTime()"
                                @preview="previewAnnouncement"
                                @delete="scheduledAnnouncements.splice(scheduledAnnouncements.indexOf(announcement), 1)" />
                            <p v-if="scheduledAnnouncements.filter(announcement => now.getTime() - announcement.time.getTime() < 10000).length < 1"
                                key="0">Er zijn geen omroepen gepland.</p>
                            <p v-if="store.table.length < 1">Upload eerst een bestand.</p>
                        </TransitionGroup>
                    </ul>
                </div>

                <SidePanel style="flex: 35% 1 1;">
                    <h2>Opties</h2>

                    <fieldset>
                        <legend>Algemeen</legend>
                        <div class="flex buttons">
                            <Button class="full" @click="scheduleAnnouncements">
                                <Icon>refresh</Icon>
                                <span>Omroepen voorbereiden</span>
                            </Button>
                            <Button class="secondary full" @click="showRuleEditor = true; optionsChanged = true">
                                <Icon>edit</Icon>
                                <span>Regels bewerken
                                    <small v-if="customRules.filter(r => r.enabled).length">(eigen regels:
                                        {{customRules.filter(r =>
                                            r.enabled).length}} actief)</small>
                                </span>
                            </Button>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Stem</legend>
                        <VoicesSelector v-model="preferredVoices" @click="optionsChanged = true" />
                        <!-- <InputGroup type="select" id="voiceBehaviour" v-model="voiceBehaviour">
                            <template #label>Gedrag bij meerdere stemmen</template>
                            <template #input>
                                <option value="roundrobin">Willekeurig kiezen</option>
                            </template>
                        </InputGroup> -->
                    </fieldset>

                    <fieldset style="position: relative;">
                        <legend>Handmatige omroep</legend>
                        <div class="manual-sounds-list" v-for="ids in [
                            voices.chimes.sounds,
                            voices.default.sounds.filter(id => !id.startsWith('auditorium')),
                            voices.default.sounds.filter(id => id.startsWith('auditorium')),
                            ...preferredVoices.map(e => voices[e.toLowerCase()]?.additionalSounds)
                        ]" v-show="ids?.length > 0">
                            <Button class="secondary manual-sound-button" v-for="id of ids"
                                @click="previewAnnouncement([{ spriteName: id, offset: 0 }])"
                                :class="{ translucent: !id.startsWith('chime') && !preferredVoices.some(e => voices[e].sounds.includes(id)) }">
                                <span>
                                    {{ getSoundInfo(id).name }}
                                </span>
                            </Button>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Geluiden</legend>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;"
                            @click="optionsChanged = true">
                            <InputGroup type="select" id="chime2Replacement" v-model="chimeBReplacement">
                                <template #label>Aftiteling</template>
                                <template #input>
                                    <option :value="1">♪ 1a</option>
                                    <option :value="2">♪ 1b</option>
                                    <option :value="3">♪ 2a</option>
                                    <option :value="4">♪ 2b</option>
                                    <option :value="5">♪ 3a</option>
                                    <option :value="6">♪ 3b</option>
                                    <option :value="7">♪ 4</option>
                                    <option :value="8">♪ 5</option>
                                </template>
                            </InputGroup>
                            <InputGroup type="select" id="chime1Replacement" v-model="chimeAReplacement">
                                <template #label>Overige gebeurtenissen</template>
                                <template #input>
                                    <option :value="1">♪ 1a</option>
                                    <option :value="2">♪ 1b</option>
                                    <option :value="3">♪ 2a</option>
                                    <option :value="4">♪ 2b</option>
                                    <option :value="5">♪ 3a</option>
                                    <option :value="6">♪ 3b</option>
                                    <option :value="7">♪ 4</option>
                                    <option :value="8">♪ 5</option>
                                </template>
                            </InputGroup>
                        </div>
                        <a @click="showFeedbackDialog" style="text-decoration: underline; cursor: pointer;">Klik hier
                            voor informatie</a>
                    </fieldset>
                </SidePanel>
            </div>
        </section>

        <Transition>
            <ModalDialog v-if="showRuleEditor" @dismiss="showRuleEditor = false">
                <Tabs>
                    <Tab value="Standaardregels">
                        <RuleList v-model="presetRules" :toggleOnly="true" />
                    </Tab>
                    <Tab value="Eigen regels">
                        <RuleList v-model="customRules" :toggleOnly="false" />
                    </Tab>
                </Tabs>
            </ModalDialog>
        </Transition>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </main>
</template>

<style scoped>
#upcoming-announcements {
    list-style: none;
    padding: 0;
    margin: 0;
    position: relative;
}

.film {
    display: grid;
    grid-template-columns: 64px 1fr;
    grid-template-rows: auto auto auto;
    position: relative;
    width: 100%;
    min-height: 72px;
    margin-bottom: 8px;

    border-radius: 5px;
    background-color: #ffffff14;
    color: #fff;
    font-size: 14px;
    overflow: hidden;

    &.announcing {
        background-color: #ffffff96;
        color: #000;
    }

    .room {
        grid-column: 1;
        grid-row: 1 / -1;
        padding-left: 8px;
        padding-right: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        overflow: hidden;
        font: 18px/34px "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    }

    .title {
        font-weight: 600;
        margin-top: 6px;
    }

    .time {
        opacity: 0.5;
        margin-bottom: 6px;
    }

    .chips {
        position: absolute;
        top: 8px;
        right: 8px;
        gap: 4px;
    }

    .announcement {
        grid-column: 1 / -1;
        grid-row: -1;
        padding-top: 6px;
        padding-bottom: 6px;
        background-color: #ffffff14;

        .word.announcing {
            background-color: #ffc426;
            color: #000;
        }

        .icon {
            justify-self: center;
            opacity: 0.5;
        }
    }
}

.queue>div {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    padding: 8px;
    border-radius: 5px;
    background-color: #ffffff14;
    margin-top: 6px;

    &.announcing {
        background-color: #ffffff96;
        color: #000;
    }
}

.parameters-warning {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    padding: 16px;
    padding-top: 22px;
    border-radius: 5px;
    background-color: #22222288;
    backdrop-filter: blur(5px);
    z-index: 10;
}

.manual-sounds-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;

    .manual-sound-button {
        height: 22px;
        min-width: 0;
        padding-left: 6px;
        padding-right: 6px;
        font-size: 13px;
        font-weight: normal;
        overflow: hidden;
        border-radius: 4px;
    }
}

.pulsate {
    animation: pulsate 1000ms infinite;
}

@keyframes pulsate {
    from {
        opacity: 1;
    }

    50% {
        opacity: 0.15;
    }

    to {
        opacity: 1;
    }
}
</style>
