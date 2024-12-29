<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useSound } from '@vueuse/sound'

import voiceRosetta from '@/assets/sounds/voices/rosetta.ogg'
import voiceGerwim from '@/assets/sounds/voices/gerwim.ogg'

import { useTmsScheduleStore } from '@/stores/tmsSchedule.js'
const tmsScheduleStore = useTmsScheduleStore()

const warningShown = ref(true)

const now = ref(() => new Date())
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
    voice: 'Rosetta'
})

const voiceFiles = {
    rosetta: voiceRosetta,
    gerwim: voiceGerwim
};

const voices = reactive({
    rosetta: {
        sprite: {
            "auditorium01": [0, 1201.6326530612246], "auditorium02": [3000, 1332.2448979591836], "auditorium03": [6000, 1332.2448979591836], "auditorium04": [9000, 1384.489795918368], "auditorium05": [12000, 1436.7346938775504], "auditorium06": [15000, 1436.7346938775504], "auditorium07": [18000, 1515.102040816327], "auditorium08": [21000, 1515.102040816327], "auditorium09": [24000, 1488.9795918367347], "auditorium10": [27000, 1306.1224489795932], "auditorium11": [30000, 1462.8571428571427], "auditorium12": [33000, 1515.1020408163233], "auditorium13": [36000, 1488.9795918367383], "auditorium14": [39000, 1488.9795918367383], "auditorium15": [42000, 1567.3469387755076], "auditorium16": [45000, 1488.9795918367383], "auditorium17": [48000, 1515.1020408163233], "auditorium18": [51000, 1462.8571428571463], "auditorium19": [54000, 1724.0816326530605], "auditorium20": [57000, 1593.4693877551], "chime": [60000, 3084.51247165533], "credits": [65000, 1501.6099773242645], "end": [68000, 1563.7868480725672], "mainshow": [71000, 1793.3333333333367], "start": [74000, 989.9092970521508]
        }
    },
    gerwim: {
        sprite: {
            "auditorium01": [0, 824.9659863945578], "auditorium02": [2000, 870.9070294784577], "auditorium03": [4000, 790.2040816326528], "auditorium04": [6000, 886.8253968253965], "auditorium05": [8000, 838.5260770975051], "auditorium06": [10000, 866.757369614513], "auditorium07": [12000, 987.7777777777776], "auditorium08": [14000, 665.6689342403635], "credits": [16000, 936.5532879818588], "start": [18000, 638.9342403628114]
        }
    }
});

Object.keys(voices).forEach(voice => {
    ({ play: voices[voice].play, isPlaying: voices[voice].isPlaying } = useSound(voiceFiles[voice], {
        sprite: voices[voice].sprite,
        preload: true,
        onplay: async () => { document.dispatchEvent(new CustomEvent('announcerSoundPlay')) },
        onend: async () => { document.dispatchEvent(new CustomEvent('announcerSoundEnd')) },
    }));
});

let soundQueue = reactive([])
watch(soundQueue, async (queue) => {
    if (queue[0] && !voices.rosetta.sprite[queue[0].id]) soundQueue.shift()
    if (queue[0] && !Object.values(voices).some(voice => voice.isPlaying)) {
        const soundParams = soundQueue[0]

        if (voices[options.value.voice?.toLowerCase()]?.sprite[soundParams.id])
            voices[options.value.voice?.toLowerCase()].play(soundParams)
        else
            voices.rosetta.play(soundParams)

        document.addEventListener('announcerSoundEnd', () => { soundQueue.shift() }, { once: true })
    }
}, { deep: true })

const announcementsToMake = ref([])
watch([tmsScheduleStore, options], ([store]) => compileListOfAnnouncements(store), { deep: true })
compileListOfAnnouncements(tmsScheduleStore)
function compileListOfAnnouncements(store) {
    let array = []
    const announcementTypes = ['start', 'plfStart', 'mainShow', 'credits', 'end'];
    store.table.forEach(row => {
        if (!row.scheduledTime) return;
        announcementTypes.forEach(type => {
            if (!options.value[type].enabled) return;
            let announceTime;
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
            }
            if (announceTime) {
                array.push({
                    announceTime,
                    announcement: options.value[type].announcement.map(e => e.replace('#', parseAuditorium(row.AUDITORIUM))),
                    status: 'unscheduled',
                    announcementType: type,
                    ...row
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
                obj.announcement.forEach(id => { soundQueue.push({ id }) })
            }, Math.max(obj.announceTime - Date.now() - 5000, 0))
        })
}

function formatTimeLeft(timeInMs) {
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

function formatSoundName(id) {
    const soundNames = { start: "start", mainshow: "start hoofdfilm", credits: "aftiteling", end: "einde voorstelling", chime: "geluidje" }
    let auditoriumMatch = id.match(/^(auditorium)([0-9]+)$/)
    if (soundNames[id]) return soundNames[id]
    else if (auditoriumMatch) return `zaal ${Number(auditoriumMatch[2])}`
    else return id
}

function sentenceCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function parseAuditorium(auditorium) {
    if (auditorium?.toLowerCase().includes('rooftop')) return '08'
    else return String(auditorium?.match(/\d+/)).padStart(2, '0')
}
</script>

<template>
    <main class="container dark">
        <TmsScheduleUploadSection />
        <section v-if="tmsScheduleStore.table.length > 0">
            <div class="flex" style="flex-wrap: wrap-reverse;">
                <div style="flex: 50% 1 1;">
                    <h2>Geplande omroepen</h2>
                    <div v-if="announcementsToMake.length > 0" id="upcoming-announcements" class="flex"
                        style="flex-direction: column; gap: 8px;">
                        <div v-for="row in announcementsToMake" v-show="now - row.announceTime < 10000" class="film"
                            :class="{ 'announcing': row.status === 'announcing' }">
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
                                @dblclick="row.announcement.forEach(id => { soundQueue.push({ id }) })"
                                style="display: grid; grid-template-columns: 64px 130px 1fr;">

                                <Icon fill v-if="row.status === 'announcing'">graphic_eq</Icon>
                                <Icon fill
                                    v-else-if="row.announcementType === 'start' || row.announcementType === 'start4dx'"
                                    :class="{ pulsate: row.status === 'scheduled' }">play_arrow</Icon>
                                <Icon fill v-else-if="row.announcementType === 'mainshow'"
                                    :class="{ pulsate: row.status === 'scheduled' }">play_circle</Icon>
                                <Icon fill v-else-if="row.announcementType === 'credits'"
                                    :class="{ pulsate: row.status === 'scheduled' }">stop_circle</Icon>
                                <Icon fill v-else-if="row.announcementType === 'end'"
                                    :class="{ pulsate: row.status === 'scheduled' }">stop</Icon>
                                <Icon fill v-else>schedule</Icon>
                                <div>
                                    {{ row.announceTime.toLocaleTimeString('nl-NL') }}
                                    ({{ formatTimeLeft(row.announceTime - now) }})
                                </div>
                                <div :style="{ opacity: row.status === 'announcing' ? 1 : 0.35 }">
                                    '<span v-for="(id, i) in row.announcement" v-show="id !== 'chime'" class="word"
                                        :class="{ announcing: row.announceTime <= now && soundQueue[0]?.id === id }">
                                        {{ formatSoundName(id) }}{{ i < row.announcement.length - 1 ? '&nbsp;' : '' }}
                                            </span>'
                                </div>
                            </div>
                        </div>
                    </div>
                    <p v-else>Er zijn geen omroepen gepland.</p>
                </div>
                <SidePanel style="flex-basis: 229px;">
                    <Tabs>
                        <Tab value="Opties">
                            <InputText v-model="options.voice" identifier="voice">Naam stem</InputText>
                            <div v-if="warningShown" @click="warningShown = false" class="parameters-warning">
                                <Icon fill style="--size: 48px;">warning</Icon>
                                <p>
                                    Het is afgeraden de rest van de opties aan te passen.<br>
                                    <br>
                                    De standaardinstellingen zijn samengesteld op basis van wat het beste lijkt te
                                    werken volgens de medewerkers.<br>
                                    <br>
                                    Als je deze instellingen aanpast, dan hebben medewerkers mogelijk geen zekerheid
                                    meer over wanneer een omroep afgespeeld wordt.
                                </p>
                            </div>
                            <fieldset :disabled="!tmsScheduleStore.table.some(row => row.AUDITORIUM?.includes('4DX'))">
                                <legend>4DX-inloop</legend>
                                <InputCheckbox v-model="options.plfStart.enabled" identifier="announcePlfStart"
                                    :disabled="!tmsScheduleStore.table.some(row => row.AUDITORIUM?.includes('4DX'))">
                                    <span>Omroepen</span>
                                </InputCheckbox>
                                <InputAnnouncement v-model="options.plfStart.announcement"
                                    identifier="announcePlfStartAnnouncement"
                                    :disabled="!options.plfStart.enabled || !tmsScheduleStore.table.some(row => row.AUDITORIUM?.includes('4DX'))">
                                    Inhoud
                                </InputAnnouncement>
                                <InputNumber v-model.number="options.plfStart.minutesBeforeStartTime"
                                    identifier="announcePlfStartGracePeriod" min="0" max="30" unit="min"
                                    :disabled="!options.plfStart.enabled || !tmsScheduleStore.table.some(row => row.AUDITORIUM?.includes('4DX'))">
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
                        </Tab>
                        <Tab value="Handmatig">
                            <div class="flex" style="flex-wrap: wrap; gap: 8px; margin-top: -4px;">
                                <ButtonPrimary v-for="id of Object.keys(voices.rosetta.sprite)"
                                    @click="soundQueue.push({ id })">
                                    {{ formatSoundName(id) }}
                                </ButtonPrimary>
                            </div>
                            <div class="queue">
                                <div v-for="(element, i) in soundQueue" @click="soundQueue.splice(i, 1)">
                                    <Icon :fill="true">graphic_eq</Icon>
                                    {{ sentenceCase(formatSoundName(element.id, true)) }}
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </SidePanel>
            </div>
        </section>
        <section v-else>
            <h2>Geplande omroepen</h2>
            <p>Upload eerst een bestand.</p>
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
}

.parameters-warning {
    position: absolute;
    top: 48px;
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

.pulsate {
    animation: pulsate 2000ms infinite;
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
