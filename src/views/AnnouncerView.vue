<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useDropZone, useStorage } from '@vueuse/core';
import { ReturnedValue, useSound } from '@vueuse/sound';
import { voices, getSoundInfo } from '@/voices.ts';
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { Announcement, AnnouncementTypes, Show } from '@/classes/classes';
import { format } from 'date-fns';

const store = useTmsScheduleStore()

const main = ref<HTMLElement>(null)

const warningShown = ref(true)

const now = ref(new Date())
setInterval(updateNowValue, 1000)
updateNowValue()
function updateNowValue() {
    now.value = new Date()
}

const options = useStorage('announcer-options', {
    plfStart: {
        enabled: true,
        minutesBeforeStartTime: 15,
        announcement: ['chime', 'start', 'auditorium#']
    },
    start: {
        enabled: false,
        announcement: ['chime', 'start', 'auditorium#']
    },
    mainShow: {
        enabled: false,
        announcement: ['chime', 'mainshow', 'auditorium#']
    },
    credits: {
        enabled: true,
        secondsBeforeCreditsTime: 60,
        announcement: ['chime', 'credits', 'auditorium#']
    },
    end: {
        enabled: false,
        announcement: ['chime', 'end', 'auditorium#']
    },
    finalMainShowStart: {
        enabled: false,
        announcement: ['chime', 'finalshow']
    },
    selectedVoices: ['default']
}, localStorage, { mergeDefaults: true })

const minecraftTimestamp = useStorage('minecraft-timestamp', 65); // 1h 05min
const minecraftEnabled = useStorage('minecraft-enabled', true);
const minecraftAnnouncement = useStorage('minecraft-announcement', ['chime', 'chickenhurt1', 'letop', 'zaalcontrole', 'auditorium#', 'chickenidle1']);

const howls = reactive<{ [key: string]: ReturnedValue }>({});
Object.entries(voices).forEach(([voice, { file, sprite }]) => {
    howls[voice] = useSound(file, {
        sprite,
        preload: true,
        onplay: (id) => document.dispatchEvent(new CustomEvent('announcerSoundPlay', { detail: id })),
        onend: (id) => document.dispatchEvent(new CustomEvent('announcerSoundEnd', { detail: id })),
    });
});

let soundQueue = reactive<{ id: string; key?: string }[]>([]);
watch(soundQueue, async () => {
    if (Object.values(howls).some((howl: any) => howl.isPlaying)) return;

    let currentVoice = options.value.selectedVoices[Math.floor(Math.random() * options.value.selectedVoices.length)]; // Randomize voice

    while (soundQueue.length > 0) {
        if (soundQueue[0].id === 'chime') {
            currentVoice = options.value.selectedVoices[Math.floor(Math.random() * options.value.selectedVoices.length)]; // Randomize voice when a chime is played
        }

        let { voice: usedVoice, duration = 0 } = playSound(currentVoice, soundQueue[0]);
        if (options.value.selectedVoices.includes(usedVoice)) currentVoice = usedVoice;

        // Promise is now determined by sprite length (more flexible)
        await new Promise(resolve => setTimeout(resolve,
            soundQueue[0].id === 'chime'
                ? 2700
                : duration + 200
        ));
        // await new Promise(resolve => document.addEventListener('announcerSoundEnd', resolve, { once: true }))

        soundQueue.shift();
    }
}, { deep: true })

function playSound(preferredVoice: string, sound: { id: string }): { voice: string; duration: number; } {
    if (voices[preferredVoice]?.sprite[sound.id]) {
        // @ts-expect-error Typing mistake in PlayOptions.id in @vueuse/sound: should be of type string
        howls[preferredVoice].play(sound)
        return { voice: preferredVoice, duration: voices[preferredVoice].sprite[sound.id][1] };
    }

    for (const voice of options.value.selectedVoices) {
        if (voices[voice]?.sprite[sound.id]) {
            // @ts-expect-error Typing mistake in PlayOptions.id in @vueuse/sound: should be of type string
            howls[voice].play(sound)
            return { voice, duration: voices[voice].sprite[sound.id][1] };
        }
    }

    for (const voice in voices) {
        if (voices[voice]?.sprite[sound.id]) {
            // @ts-expect-error Typing mistake in PlayOptions.id in @vueuse/sound: should be of type string
            howls[voice].play(sound);
            return { voice, duration: voices[voice].sprite[sound.id][1] };
        }
    }

    soundQueue.shift();
    return { voice: null, duration: 0 };
}

const announcementsToMake = ref<Announcement[]>([])
store.$subscribe(compileListOfAnnouncements, { deep: true })
watch(options, compileListOfAnnouncements, { deep: true })
compileListOfAnnouncements()
function compileListOfAnnouncements() {
    let array: Announcement[] = []
    const announcementTypes = Object.values(AnnouncementTypes);
    store.table.forEach((show: Show, i: number) => {
        if (!show.scheduledTime) return;
        announcementTypes.forEach(announcementType => {
            if (options.value[announcementType] && !options.value[announcementType].enabled) return;
            let announcementTime: Date;
            let announcementContent: string[] = options.value[announcementType]
                ? options.value[announcementType].announcement.map((e: string) => e.replace('#', parseAuditorium(show.auditorium)))
                : [];

            switch (announcementType) {
                case AnnouncementTypes.Start:
                    announcementTime = show.scheduledTime;
                    break;
                case AnnouncementTypes.PlfStart:
                    if (!show.auditorium?.includes('4DX')) return;
                    announcementTime = new Date(show.scheduledTime.getTime() - (options.value.plfStart.minutesBeforeStartTime * 60000));
                    break;
                case AnnouncementTypes.MainShow:
                    announcementTime = show.mainShowTime;
                    break;
                case AnnouncementTypes.Credits:
                    announcementTime = new Date(show.creditsTime.getTime() - (options.value.credits.secondsBeforeCreditsTime * 1000));
                    break;
                case AnnouncementTypes.End:
                    announcementTime = show.endTime;
                    break;
                case AnnouncementTypes.FinalMainShowStart:
                    if (i !== store.table.length - 1) return;
                    announcementTime = show.mainShowTime;
                    break;
                case AnnouncementTypes.Minecraft:
                    if (!minecraftEnabled.value) return;
                    if (!show.playlist.includes('Minecraft')) return;
                    announcementTime = new Date(show.mainShowTime.getTime() + (minecraftTimestamp.value * 60000));
                    announcementContent = minecraftAnnouncement.value.map((e: string) => e.replace('#', parseAuditorium(show.auditorium)));
                    break;
            }
            if (announcementTime) {
                array.push(new Announcement({
                    time: announcementTime,
                    type: announcementType,
                    announcement: announcementContent,
                    status: 'unscheduled',
                    key: announcementTime + announcementContent.join(),
                    scheduleItem: show,
                }))
            }
        });
    });

    announcementsToMake.value.filter((a) => a.status === 'scheduled').forEach((a) => {
        const newElement = array.findIndex((b) => a.time === b.time && a.announcement.join() === b.announcement.join())
        if (newElement) array.splice(newElement, 1)
        array.push(a)
    })

    announcementsToMake.value = [
        ...array.filter((a) => Date.now() - a.time.getTime() < 10000).sort((a, b) => a.time.getTime() - b.time.getTime())
    ]

    updateNowValue()
}

setInterval(scheduleAnnouncements, 30000)
watch(announcementsToMake, scheduleAnnouncements)
scheduleAnnouncements()
function scheduleAnnouncements() {
    announcementsToMake.value
        .filter((obj: Announcement) => obj.time.getTime() - Date.now() < 60000 && obj.status === 'unscheduled')
        .forEach((obj: Announcement) => {
            if (obj.status === 'scheduled') return
            obj.status = 'scheduled'
            setTimeout(() => {
                if (obj.status !== 'scheduled') return
                obj.status = 'announcing'
                obj.announcement.forEach((id: string) => { soundQueue.push({ id, key: new Date().getTime() + id }) })
            }, Math.max(obj.time.getTime() - Date.now() - 5000, 0))
        })
}

function formatTimeLeft(timeInMs: number) {
    if (timeInMs < 60000) {
        return Math.floor(timeInMs / 1000) + ' s'
    } else if (timeInMs < 600000) {
        return Math.floor(timeInMs / 60000) + ':' + String(Math.floor((timeInMs % 60000) / 1000)).padStart(2, '0') + ' min'
    } else if (timeInMs < 3600000) {
        return Math.floor(timeInMs / 60000) + ' min'
    } else {
        return Math.floor(timeInMs / 3600000) + ':' + String(Math.floor((timeInMs % 3600000) / 60000)).padStart(2, '0') + ' h'
    }
}

function sentenceCase(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function parseAuditorium(auditorium: string) {
    if (auditorium?.toLowerCase().includes('rooftop')) return '10'
    else return String(auditorium?.match(/\d+/)).padStart(2, '0')
}

const { isOverDropZone } = useDropZone(main, {
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
})
</script>

<template>
    <main ref="main">
        <HeroImage />
        <TimetableUploadSection />
        <section>
            <div class="flex" style="flex-wrap: wrap-reverse;">
                <div style="flex: 50% 1 1;">
                    <h2>Geplande omroepen</h2>
                    <div id="upcoming-announcements">
                        <TransitionGroup name="list">
                            <div v-for="announcement in announcementsToMake"
                                v-show="now.getTime() - announcement.time.getTime() < 10000" class="film"
                                :key="announcement.key" :class="{ 'announcing': announcement.status === 'announcing' }">
                                <div class="room">
                                    {{ (announcement.show.auditorium === 'PULR 8' || announcement.show.auditorium
                                        ===
                                        'Rooftop') ? 'RT' :
                                        announcement.show.auditoriumNumber }}
                                </div>
                                <div class="title">{{ announcement.show.title }}</div>
                                <div class="time">
                                    {{ format(announcement.show.scheduledTime, 'HH:mm') }} –
                                    {{ format(announcement.show.endTime, 'HH:mm:ss') }}</div>
                                <div class="flex chips">
                                    <Chip v-for="extra in announcement.show.extras"
                                        :class="{ 'translucent-white': !(announcement.type === AnnouncementTypes.PlfStart && extra === '4DX') }">
                                        {{ extra }}
                                    </Chip>
                                </div>
                                <div class="announcement" :class="announcement.announcement"
                                    @dblclick="announcement.announcement.forEach(id => { soundQueue.push({ id, key: new Date().getTime() + id }) })"
                                    style="display: grid; grid-template-columns: 64px 130px 1fr;">

                                    <Icon v-if="announcement.type === AnnouncementTypes.PlfStart"
                                        :class="{ pulsate: announcement.status === 'scheduled' }">line_start_diamond
                                    </Icon>
                                    <Icon v-else-if="announcement.type === AnnouncementTypes.Start"
                                        :class="{ pulsate: announcement.status === 'scheduled' }">line_start_square
                                    </Icon>
                                    <Icon v-else-if="announcement.type === AnnouncementTypes.MainShow"
                                        :class="{ pulsate: announcement.status === 'scheduled' }">line_start_circle
                                    </Icon>
                                    <Icon v-else-if="announcement.type === AnnouncementTypes.Credits"
                                        :class="{ pulsate: announcement.status === 'scheduled' }">line_end_circle
                                    </Icon>
                                    <Icon v-else-if="announcement.type === AnnouncementTypes.End"
                                        :class="{ pulsate: announcement.status === 'scheduled' }">line_end_square
                                    </Icon>
                                    <Icon v-else-if="announcement.type === AnnouncementTypes.FinalMainShowStart"
                                        :class="{ pulsate: announcement.status === 'scheduled' }">line_start_circle
                                    </Icon>
                                    <Icon v-else>schedule</Icon>
                                    <div>
                                        {{ format(announcement.time, 'HH:mm:ss') }}
                                        ({{ formatTimeLeft(announcement.time.getTime() - now.getTime()) }})
                                    </div>
                                    <div :style="{ opacity: announcement.status === 'announcing' ? 1 : 0.35 }">
                                        '<span v-for="(id, i) in announcement.announcement" v-show="id !== 'chime'"
                                            class="word"
                                            :class="{ announcing: announcement.time <= now && soundQueue[0]?.id === id }">
                                            {{ getSoundInfo(id).name }}{{ i < announcement.announcement.length - 1
                                                ? '&nbsp;' : '' }} </span>'
                                    </div>
                                </div>
                            </div>
                            <p v-if="announcementsToMake.filter(announcement => now.getTime() - announcement.time.getTime() < 10000).length < 1"
                                key="0">Er zijn geen omroepen gepland.</p>
                            <p v-if="store.table.length < 1">Upload eerst een bestand.</p>
                        </TransitionGroup>
                    </div>
                </div>

                <SidePanel style="flex-basis: 229px;">
                    <Tabs>
                        <Tab value="Opties">
                            <fieldset>
                                <legend>Stemmen</legend>
                                <VoicesSelector v-model="options.selectedVoices" />
                            </fieldset>

                            <fieldset style="position: relative;">
                                <legend>Handmatig afspelen</legend>
                                <div class="manual-sounds-list" v-for="ids in [
                                    voices.default.sounds.filter(id => !id.startsWith('auditorium')),
                                    voices.default.sounds.filter(id => id.startsWith('auditorium')),
                                    ...options.selectedVoices.map(e => voices[e.toLowerCase()]?.additionalSounds)
                                ]" v-show="ids?.length > 0">
                                    <button v-for="id of ids"
                                        @click="soundQueue.push({ id, key: new Date().getTime() + id })"
                                        :class="{ translucent: id !== 'chime' && !options.selectedVoices.some(e => voices[e].sounds.includes(id)) }">
                                        <Icon v-if="id === 'chime'" :fill="true"
                                            style="--size: 14px; vertical-align: middle;">
                                            music_note</Icon>
                                        <span v-else>
                                            {{ getSoundInfo(id).name }}
                                        </span>
                                    </button>
                                </div>
                            </fieldset>

                            <fieldset>
                                <legend>Nu afgespeeld</legend>
                                <div class="queue">
                                    <TransitionGroup name="list">
                                        <div v-for="(element, i) in soundQueue" @click="soundQueue.splice(i, 1)"
                                            :key="element.key" :class="{ 'announcing': i === 0 }">
                                            <Icon :fill="true">graphic_eq</Icon>
                                            {{ sentenceCase(getSoundInfo(element.id).name) }}
                                        </div>
                                        <p v-if="soundQueue.length < 1" key="0">Er wordt momenteel geen omroep
                                            afgespeeld.</p>
                                    </TransitionGroup>
                                </div>
                            </fieldset>
                        </Tab>
                        <Tab value="Regels">
                            <div v-if="warningShown" @click="warningShown = false" class="parameters-warning">
                                <Icon fill style="--size: 48px;">warning</Icon>
                                <p>
                                    Het is afgeraden deze opties aan te passen.<br>
                                    <br>
                                    De standaardinstellingen zijn samengesteld op basis van wat het beste lijkt te
                                    werken volgens de medewerkers.<br>
                                    <br>
                                    Als je deze instellingen aanpast, dan hebben medewerkers mogelijk geen zekerheid
                                    meer over wanneer een omroep afgespeeld wordt.
                                </p>
                            </div>
                            <fieldset>
                                <legend>Speciaal</legend>
                                <InputCheckbox v-model="minecraftEnabled" identifier="minecraftEnabled">
                                    <span>Omroepen</span>
                                </InputCheckbox>
                                <InputAnnouncement v-model="minecraftAnnouncement" identifier="minecraftAnnouncement"
                                    :disabled="!minecraftEnabled">
                                    Inhoud
                                </InputAnnouncement>
                                <InputNumber v-model.number="minecraftTimestamp" identifier="minecraftTimestamp"
                                    min="20" max="80" unit="min">A Minecraft Movie: tijdstip zaalcontrole
                                    <small v-if="minecraftTimestamp > 0">
                                        Het tijdstip {{ minecraftTimestamp }} minuten na start hoofdfilm wordt
                                        gemarkeerd.
                                    </small>
                                    <small v-else>Er wordt geen extra tijdstip gemarkeerd bij A Minecraft Movie.</small>
                                    <small>Standaardwaarde: 65 min. De chickenjockey-scène speelt zich af op ongeveer 69
                                        min.</small>
                                </InputNumber>
                            </fieldset>
                            <fieldset>
                                <legend>4DX-inloop</legend>
                                <InputCheckbox v-model="options.plfStart.enabled" identifier="announcePlfStart">
                                    <span>Omroepen</span>
                                </InputCheckbox>
                                <InputAnnouncement v-model="options.plfStart.announcement"
                                    identifier="announcePlfStartAnnouncement" :disabled="!options.plfStart.enabled">
                                    Inhoud
                                </InputAnnouncement>
                                <InputNumber v-model.number="options.plfStart.minutesBeforeStartTime"
                                    identifier="announcePlfStartGracePeriod" min="0" max="30" unit="min"
                                    :disabled="!options.plfStart.enabled">
                                    Voorlooptijd
                                    <small>
                                        De omroep wordt {{ options.plfStart.minutesBeforeStartTime }} min voor de
                                        aanvangstijd afgespeeld.
                                    </small>
                                </InputNumber>
                            </fieldset>
                            <fieldset>
                                <legend>Start</legend>
                                <InputCheckbox v-model="options.start.enabled" identifier="announceStart">
                                    Omroepen
                                </InputCheckbox>
                                <InputAnnouncement v-model="options.start.announcement"
                                    identifier="announceStartAnnouncement" :disabled="!options.start.enabled">
                                    Inhoud
                                </InputAnnouncement>
                            </fieldset>
                            <fieldset>
                                <legend>Start hoofdfilm</legend>
                                <InputCheckbox v-model="options.mainShow.enabled" identifier="announceMainShow">
                                    Omroepen
                                </InputCheckbox>
                                <InputAnnouncement v-model="options.mainShow.announcement"
                                    identifier="announceMainShowAnnouncement" :disabled="!options.mainShow.enabled">
                                    Inhoud
                                </InputAnnouncement>
                            </fieldset>
                            <fieldset>
                                <legend>Aftiteling</legend>
                                <InputCheckbox v-model="options.credits.enabled" identifier="announceCredits">
                                    Omroepen
                                </InputCheckbox>
                                <InputAnnouncement v-model="options.credits.announcement"
                                    identifier="announceCreditsAnnouncement" :disabled="!options.credits.enabled">
                                    Inhoud
                                </InputAnnouncement>
                                <InputNumber v-model.number="options.credits.secondsBeforeCreditsTime"
                                    identifier="announceCreditsGracePeriod" step="15" min="0" max="240" unit="s"
                                    :disabled="!options.credits.enabled">
                                    Voorlooptijd
                                    <small>
                                        De omroep wordt {{ options.credits.secondsBeforeCreditsTime }} s voor de
                                        aftiteling
                                        afgespeeld.
                                    </small>
                                </InputNumber>
                            </fieldset>
                            <fieldset>
                                <legend>Einde voorstelling</legend>
                                <InputCheckbox v-model="options.end.enabled" identifier="announceEnd">
                                    Omroepen
                                </InputCheckbox>
                                <InputAnnouncement v-model="options.end.announcement"
                                    identifier="announceEndAnnouncement" :disabled="!options.end.enabled">
                                    Inhoud
                                </InputAnnouncement>
                            </fieldset>
                            <fieldset>
                                <legend>Start laatste hoofdfilm</legend>
                                <InputCheckbox v-model="options.finalMainShowStart.enabled"
                                    identifier="announceFinalShow">
                                    Omroepen
                                </InputCheckbox>
                                <InputAnnouncement v-model="options.finalMainShowStart.announcement"
                                    identifier="announceFinalShowAnnouncement"
                                    :disabled="!options.finalMainShowStart.enabled">
                                    Inhoud
                                </InputAnnouncement>
                            </fieldset>
                        </Tab>
                    </Tabs>
                </SidePanel>
            </div>
        </section>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </main>
</template>

<style scoped>
#upcoming-announcements {
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

    &>button {
        display: flex;
        align-items: center;
        height: 22px;
        padding-inline: 6px;
        font: 13px Arial, Helvetica, sans-serif;
        text-transform: none;
        background-color: #ffffff14;
        border: none;
        border-radius: 4px;
        color: #fff;
        cursor: pointer;
    }

    &+& {
        margin-top: -10px;
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
