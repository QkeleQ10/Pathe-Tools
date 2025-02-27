<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useStorage } from '@vueuse/core';
import { HowlStatic, useSound } from '@vueuse/sound';
import { voices, getSoundInfo } from '@/voices.ts';

import { useTmsScheduleStore } from '@/stores/tmsSchedule'
const tmsScheduleStore = useTmsScheduleStore()

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

const howls = reactive({});
Object.entries(voices).forEach(([voice, { file, sprite }]) => {
    howls[voice] = useSound(file, {
        sprite,
        preload: true,
        onplay: () => document.dispatchEvent(new CustomEvent('announcerSoundPlay')),
        onend: () => document.dispatchEvent(new CustomEvent('announcerSoundEnd')),
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

        let usedVoice = playSound(currentVoice, soundQueue[0]);
        if (options.value.selectedVoices.includes(usedVoice)) currentVoice = usedVoice;

        await new Promise(resolve => document.addEventListener('announcerSoundEnd', resolve, { once: true }))
        soundQueue.shift()
    }
}, { deep: true })

function playSound(preferredVoice: string, sound: { id: string }) {
    if (voices[preferredVoice]?.sprite[sound.id]) {
        howls[preferredVoice].play(sound)
        return preferredVoice;
    }

    for (const voice of options.value.selectedVoices) {
        if (voices[voice]?.sprite[sound.id]) {
            howls[voice].play(sound)
            return voice;
        }
    }

    for (const voice in voices) {
        console.log(voice)
        if (voices[voice]?.sprite[sound.id]) {
            howls[voice].play(sound);
            return voice;
        }
    }

    soundQueue.shift();
    return null;
}

const announcementsToMake = ref([])
watch([tmsScheduleStore, options], ([store]) => compileListOfAnnouncements(store), { deep: true })
compileListOfAnnouncements(tmsScheduleStore)
function compileListOfAnnouncements(store) {
    let array = []
    const announcementTypes = ['start', 'plfStart', 'mainShow', 'credits', 'end', 'finalMainShowStart'];
    store.table.forEach((row: any, i: number) => {
        if (!row.scheduledTime) return;
        announcementTypes.forEach(type => {
            if (!options.value[type].enabled) return;
            let announceTime;
            let announcement = options.value[type].announcement.map(e => e.replace('#', parseAuditorium(row.AUDITORIUM)));

            switch (type) {
                case 'start':
                    announceTime = row.scheduledTime;
                    break;
                case 'plfStart':
                    if (!row.AUDITORIUM?.includes('4DX')) return;
                    announceTime = new Date(row.scheduledTime.getTime() - (options.value.plfStart.minutesBeforeStartTime * 60000));
                    break;
                case 'mainShow':
                    announceTime = row.featureTime;
                    break;
                case 'credits':
                    announceTime = new Date(row.creditsTime.getTime() - (options.value.credits.secondsBeforeCreditsTime * 1000));
                    break;
                case 'end':
                    announceTime = row.endTime;
                    break;
                case 'finalMainShowStart':
                    if (i !== store.table.length - 1) return;
                    announceTime = row.featureTime;
                    break;
            }
            if (announceTime) {
                array.push({
                    announceTime,
                    announcement,
                    status: 'unscheduled',
                    announcementType: type,
                    ...row,
                    key: announceTime + announcement.join()
                });
            }
        });
    });

    announcementsToMake.value.filter((a) => a.status === 'scheduled').forEach((a) => {
        const newElement = array.findIndex((b) => a.announceTime === b.announceTime && a.announcement.join() === b.announcement.join())
        if (newElement) array.splice(newElement, 1)
        array.push(a)
    })

    announcementsToMake.value = [
        ...array.filter((a) => Date.now() - a.announceTime < 10000).sort((a, b) => a.announceTime - b.announceTime)
    ]

    updateNowValue()
}

setInterval(scheduleAnnouncements, 30000)
watch(announcementsToMake, scheduleAnnouncements)
scheduleAnnouncements()
function scheduleAnnouncements() {
    announcementsToMake.value
        .filter((obj) => obj.announceTime - Date.now() < 60000 && obj.status === 'unscheduled')
        .forEach((obj) => {
            if (obj.status === 'scheduled') return
            obj.status = 'scheduled'
            setTimeout(() => {
                if (obj.status !== 'scheduled') return
                obj.status = 'announcing'
                obj.announcement.forEach((id: string) => { soundQueue.push({ id, key: new Date().getTime() + id }) })
            }, Math.max(obj.announceTime - Date.now() - 5000, 0))
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
</script>

<template>
    <main class="container dark">
        <TmsScheduleUploadSection />
        <section>
            <div class="flex" style="flex-wrap: wrap-reverse;">
                <div style="flex: 50% 1 1;">
                    <h2>Geplande omroepen</h2>
                    <div id="upcoming-announcements">
                        <TransitionGroup name="list">
                            <div v-for="row in announcementsToMake" v-show="now.getTime() - row.announceTime < 10000"
                                class="film" :key="row.key" :class="{ 'announcing': row.status === 'announcing' }">
                                <div class="room">
                                    {{ (row.AUDITORIUM === 'PULR 8' || row.AUDITORIUM === 'Rooftop') ? 'RT' :
                                        row.AUDITORIUM.replace(/^\w+\s/, '').split(' ')[0] }}
                                </div>
                                <div class="title">{{ row.title }}</div>
                                <div class="time">
                                    {{ row.scheduledTime.toLocaleTimeString('nl-NL') }} –
                                    {{ row.endTime.toLocaleTimeString('nl-NL') }}</div>
                                <div class="flex chips">
                                    <Chip v-for="extra in row.extras"
                                        :class="{ 'translucent-white': !(row.announcementType === 'start4dx' && extra === '4DX') }">
                                        {{ extra }}
                                    </Chip>
                                </div>
                                <div class="announcement" :class="row.announcement"
                                    @dblclick="row.announcement.forEach(id => { soundQueue.push({ id, key: new Date().getTime() + id }) })"
                                    style="display: grid; grid-template-columns: 64px 130px 1fr;">

                                    <Icon v-if="row.announcementType === 'plfStart'"
                                        :class="{ pulsate: row.status === 'scheduled' }">line_start_diamond</Icon>
                                    <Icon v-else-if="row.announcementType === 'start'"
                                        :class="{ pulsate: row.status === 'scheduled' }">line_start_square</Icon>
                                    <Icon v-else-if="row.announcementType === 'mainShow'"
                                        :class="{ pulsate: row.status === 'scheduled' }">line_start_circle</Icon>
                                    <Icon v-else-if="row.announcementType === 'credits'"
                                        :class="{ pulsate: row.status === 'scheduled' }">line_end_circle</Icon>
                                    <Icon v-else-if="row.announcementType === 'end'"
                                        :class="{ pulsate: row.status === 'scheduled' }">line_end_square</Icon>
                                    <Icon v-else>schedule</Icon>
                                    <div>
                                        {{ row.announceTime.toLocaleTimeString('nl-NL') }}
                                        ({{ formatTimeLeft(row.announceTime - now.getTime()) }})
                                    </div>
                                    <div :style="{ opacity: row.status === 'announcing' ? 1 : 0.35 }">
                                        '<span v-for="(id, i) in row.announcement" v-show="id !== 'chime'" class="word"
                                            :class="{ announcing: row.announceTime <= now && soundQueue[0]?.id === id }">
                                            {{ getSoundInfo(id).name }}{{ i < row.announcement.length - 1 ? '&nbsp;'
                                                : '' }} </span>'
                                    </div>
                                </div>
                            </div>
                            <p v-if="announcementsToMake.filter(row => now.getTime() - row.announceTime < 10000).length < 1"
                                key="0">Er zijn geen omroepen gepland.</p>
                            <p v-if="tmsScheduleStore.table.length < 1">Upload eerst een bestand.</p>
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
                                    <ButtonText v-for="id of ids"
                                        @click="soundQueue.push({ id, key: new Date().getTime() + id })"
                                        :class="{ translucent: id !== 'chime' && !options.selectedVoices.some(e => voices[e].sounds.includes(id)) }">
                                        <Icon v-if="id === 'chime'" :fill="true"
                                            style="--size: 14px; vertical-align: middle;">
                                            music_note</Icon>
                                        <span v-else>
                                            {{ getSoundInfo(id).name }}
                                        </span>
                                    </ButtonText>
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
                        <Tab value="Geavanceerd">
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
    </main>
    <div class="clock">{{ now.toLocaleTimeString('nl-NL') }}</div>
</template>

<style scoped>
.clock {
    position: fixed;
    top: 0;
    right: max(calc(50vw - 590px), 0px);
    height: 70px;
    width: 90px;
    padding-right: 20px;
    display: flex;
    align-items: center;
    z-index: 11;
    color: #00000055;
    font: 700 16px Arial, Helvetica, sans-serif;
}

div.container {
    min-height: calc(100vh - 70px);
}

h2 {
    margin-bottom: 16px;
}

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

    &>button.primary {
        display: flex;
        align-items: center;
        height: 22px;
        padding-inline: 6px;
        border-radius: 4px;
        font: 13px Arial, Helvetica, sans-serif;
        text-transform: none;
        background-color: #ffffff14;
        color: #fff;
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
