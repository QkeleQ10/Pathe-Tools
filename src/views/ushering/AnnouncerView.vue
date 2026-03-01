<script setup lang="ts">
import { ref, inject, useTemplateRef, onMounted, onBeforeUnmount, Ref, watch, onBeforeMount } from 'vue';
import { useDropZone, useStorage } from '@vueuse/core';
import { Announcement, AnnouncementRule, Show } from '@/scripts/types.ts';
import { voices, getSoundInfo, Voice, defaultVoice, defaultVoiceKey } from '@/scripts/voices';
import { assembleAudioClient } from '@/scripts/assembleAudio';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue';
import AnnouncementBuilder from '@features/ushering/announcer/AnnouncementBuilder.vue';
import ScheduledAnnouncement from '@features/ushering/announcer/ScheduledAnnouncement.vue';
import Settings, { presetRulesDefault } from '@/components/features/ushering/announcer/Settings.vue';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const store = useTmsScheduleStore()
const now = inject<Ref<Date>>('now');

const userHasInteracted = inject<Ref<boolean>>('userHasInteracted');

const main = useTemplateRef('main');

const presetRules = inject<Ref<AnnouncementRule[]>>('presetRules', ref(presetRulesDefault));
const customRules = useStorage<AnnouncementRule[]>('custom-rules', [], localStorage, { mergeDefaults: true });

const preferredVoices = useStorage<(keyof typeof voices)[]>('preferred-voices', [defaultVoiceKey], localStorage, { mergeDefaults: true });

const chimeSound = useStorage('chime-sound', 0, localStorage); // which chime sound to use before announcements

const customAnnouncementSegments = ref<{ spriteName: string; offset: number }[]>([]);
const customAnnouncementDate = ref<Date>(new Date());

const scheduledAnnouncements = ref<Announcement[]>([])
store.$subscribe(() => scheduleAnnouncements(), { deep: true })

let interval: NodeJS.Timeout | null = null;

onBeforeMount(() => {
    for (const key of preferredVoices.value) {
        if (!voices[key]) {
            preferredVoices.value = preferredVoices.value.filter(k => k !== key);
        }
    }
    if (preferredVoices.value.length === 0) {
        preferredVoices.value = [defaultVoiceKey];
    }
})

onMounted(() => {
    scheduleAnnouncements();
    interval = setInterval(() => generateAndEnqueue(), 10000);
})

onBeforeUnmount(() => {
    if (interval) clearInterval(interval);
    cleanupAnnouncements();
})

/**
 * Clean up all scheduled announcements and audio elements
 */
function cleanupAnnouncements() {
    for (const announcement of scheduledAnnouncements.value) {
        // Clear any pending timeouts
        if (announcement.scheduled) {
            clearTimeout(announcement.scheduled);
            announcement.scheduled = null;
        }
        // Remove audio elements from DOM
        if (announcement.audio) {
            announcement.audio.pause();
            announcement.audio.remove();
            announcement.audio = null;
        }
    }
}

/**
 * Schedule all announcements based on the rules and the imported timetable
 */
async function scheduleAnnouncements(debug: boolean = false) {
    // Clean up previously scheduled announcements before creating new ones
    cleanupAnnouncements();

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
                if (debug || announcement.time.getTime() > Date.now()) {
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

    scheduledAnnouncements.value = array.sort((a, b) => a.time.getTime() - b.time.getTime());

    if (debug) console.log(scheduledAnnouncements.value);

    generateAndEnqueue();
}

async function regenerate() {
    for (const announcement of scheduledAnnouncements.value.filter(announcement => announcement.audio)) {
        announcement.audio?.remove();
        announcement.audio = null;
    }
    generateAndEnqueue();
}

/**
 * Generate and enqueue all announcements in the next 30 seconds
 */
async function generateAndEnqueue() {
    for (const announcement of scheduledAnnouncements.value.filter(announcement => {
        const timeUntilAnnouncement = announcement.time.getTime() - Date.now() - 1000;
        return timeUntilAnnouncement > -10000 && timeUntilAnnouncement < 30000 && !announcement.scheduled;
    })) {
        await generateAudio(announcement);
        await enqueueAnnouncement(announcement);
    }
}

async function generateAudio(announcement: Announcement) {
    if (announcement.audio) return;
    const segmentsWithVoices = prepareSegments(announcement.segments, preferredVoices.value.map(s => voices[s]));
    announcement.audio = await assembleAudio(segmentsWithVoices);
}

async function enqueueAnnouncement(announcement: Announcement) {
    if (announcement.scheduled) return;
    const timeUntilAnnouncement = announcement.time.getTime() - Date.now() - 1000;

    const timeout = setTimeout(() => {
        if (!announcement.audio) return;
        console.debug("Playing announcement: ", announcement);
        announcement.audio.play();
        announcement.audio.addEventListener('ended', () => {
            announcement.audio?.remove();
            announcement.audio = null; // Clear the audio reference after playing
        }, { once: true });
    }, Math.max(0, timeUntilAnnouncement));

    announcement.scheduled = timeout; // Mark the announcement as scheduled
}

async function playAnnouncement(announcement: Announcement) {
    await generateAudio(announcement);
    if (announcement.audio) {
        announcement.audio.play();
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

/**
 * Add an optional chime sound to the segments and assign voices to each segment
 * @param segments The segments without voice assigned
 * @param selectedVoices The preferred voices to use
 */
function prepareSegments(
    segments: { spriteName: string; offset: number }[],
    selectedVoices: Voice[],
    includeChime: boolean = true
): { voice: Voice; spriteName: string; offset: number }[] {

    const preferredVoices = selectedVoices.sort(() => 0.5 - Math.random());
    const allVoices = Object.values(voices);

    let preparedSegments: { voice: Voice; spriteName: string; offset: number }[] = [];

    if (includeChime && chimeSound.value !== -1) preparedSegments.push({
        voice: voices.chimes,
        spriteName: `chime${chimeSound.value}`,
        offset: -1600
    });

    // Loop through the preferred voices in random order to find one that has all the required sprites
    for (const voice of preferredVoices) {
        // Check if the voice has all the required sprites
        if (segments.every(segment => segment.spriteName.startsWith('chime') || voice.sprite[segment.spriteName])) {
            preparedSegments.push(...segments.map(segment => ({
                ...segment,
                voice: segment.spriteName.startsWith('chime') ? voices.chimes : voice
            })));

            return preparedSegments;
        }
    }

    // If no voice has all the required sprites, use a mix of voices (prefferred voices first)
    preparedSegments.push(...segments.map(segment => {
        const voice = [...preferredVoices, ...allVoices].find(v => v.sprite[segment.spriteName]);
        return {
            ...segment,
            voice: (segment.spriteName.startsWith('chime') ? voices.chimes : voice) || defaultVoice
        };
    }));

    return preparedSegments;
}

function assembleAudio(segments: { voice: Voice; spriteName: string; offset: number }[]) {
    return new Promise<HTMLAudioElement>(async (resolve) => {
        const url = await assembleAudioClient(segments);
        const audio = new Audio(url);
        resolve(audio);
    })
}

async function previewAnnouncement(
    segments: { spriteName: string; offset: number }[],
    selectedVoices: Voice[] = preferredVoices.value.map(s => voices[s]),
    includeChime: boolean = true
) {
    const preparedSegments = prepareSegments(segments, selectedVoices, includeChime);
    const audio = await assembleAudio(preparedSegments);
    audio.play();
}

const { isOverDropZone } = useDropZone(main, {
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
})
</script>

<template>
    <div ref="main" class="content">
        <div class="layout">
            <main>
                <h1>Omroepen</h1>
                <template v-if="store.table.length < 1">
                    <p>
                        <template
                            v-if="scheduledAnnouncements.filter(announcement => now.getTime() - announcement.time.getTime() < 10000).length < 1">Er
                            zijn geen omroepen gepland. <br></template>
                        Upload eerst een <b>TSV</b>-bestand uit RosettaBridge (optie <b>Dates - ISO</b>) door hem naar
                        deze pagina te slepen. <br>
                        Je kunt ook handmatig omroepen inplannen.
                    </p>
                </template>
                <template
                    v-else-if="scheduledAnnouncements.filter(announcement => now.getTime() - announcement.time.getTime() < 10000).length < 1">
                    <p>
                        Er zijn geen omroepen gepland. <br>
                        Het geüploade bestand bevat voorstellingen van {{
                            format(store.table[0].endTime, 'PPPP', {
                                locale: nl
                            }) }}. <br>
                        Upload eventueel een recenter bestand of plan handmatig omroepen in.
                    </p>
                </template>
                <ul id="upcoming-announcements" class="scrollable-list" style="max-height: none;">
                    <TransitionGroup name="list">
                        <ScheduledAnnouncement
                            v-for="announcement in [...scheduledAnnouncements].sort((a, b) => a.time.getTime() - b.time.getTime())"
                            :announcement="announcement"
                            :key="announcement.time.getTime() + announcement.segments.map(s => s.spriteName).join(',')"
                            @preview="playAnnouncement(announcement)"
                            @delete="scheduledAnnouncements.splice(scheduledAnnouncements.indexOf(announcement), 1)" />
                    </TransitionGroup>
                </ul>
            </main>

            <SidePanel>
                <div class="flex" style="flex-direction: column;">

                    <TimetableUploadSection />

                    <AnnouncementBuilder v-model="customAnnouncementSegments">
                        <Icon>add</Icon>
                        <span>Nieuwe omroep</span>
                        <template #footer>
                            <h3>Afspeelopties</h3>
                            <div class="flex buttons">
                                <InputDate identifier="customAnnouncementDate" v-model="customAnnouncementDate"
                                    style="height: 48px">
                                    Inplannen voor</InputDate>
                                <Button class="primary"
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

                    <Button class="secondary full left" @click="scheduleAnnouncements()"
                        @contextmenu="scheduleAnnouncements(true)">
                        <Icon>refresh</Icon>
                        <span>Omroepen vernieuwen</span>
                    </Button>

                    <Settings @regenerate="regenerate" @previewAnnouncement="previewAnnouncement"
                        @scheduleAnnouncements="scheduleAnnouncements" />

                </div>
            </SidePanel>
        </div>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>

        <Transition>
            <div class="snackbar warning" v-if="!userHasInteracted">
                <h3>Let op: klik om geluid te activeren</h3>
                <p>
                    De browser blokkeert geluiden tot er op de pagina is geklikt.
                </p>
            </div>
        </Transition>
    </div>
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
        font: 18px/34px "Special Gothic Condensed One", Arial, Helvetica, sans-serif;
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
            background-color: var(--yellow1);
            color: #000;
        }

        .icon {
            justify-self: center;
            opacity: 0.5;
        }
    }
}
</style>
