<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useSound } from '@vueuse/sound'
import { Tabs, Tab } from 'super-vue3-tabs'

import voiceRosetta from '@/assets/sounds/voices/rosetta.ogg'
import voiceGerwim from '@/assets/sounds/voices/gerwim.ogg'

import { useTmsScheduleStore } from '@/stores/tmsSchedule.js'
const tmsScheduleStore = useTmsScheduleStore()

const now = ref(() => new Date())
setInterval(updateNowValue, 1000)
updateNowValue()
function updateNowValue() {
    now.value = new Date()
}

const voice = useStorage('announcement-voice', 'rosetta')
const announceStart = useStorage('announce-start', false)
const announcePlfStart = useStorage('announce-plf-start', true)
const announcePlfStartGracePeriod = useStorage('announce-plf-start-grace-period', 15)
const announceMainShow = useStorage('announce-main-show', false)
const announceCredits = useStorage('announce-credits', true)
const announceCreditsGracePeriod = useStorage('announce-credits-grace-period', 60)
const announceEnd = useStorage('announce-end', false)

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

({ play: voices.rosetta.play, isPlaying: voices.rosetta.isPlaying } = useSound(voiceRosetta, {
    sprite: voices.rosetta.sprite,
    preload: true,
    onplay: async () => { document.dispatchEvent(new Event('announcerSoundPlay')) },
    onend: async () => { document.dispatchEvent(new Event('announcerSoundEnd')) },
}));

({ play: voices.gerwim.play, isPlaying: voices.gerwim.isPlaying } = useSound(voiceGerwim, {
    sprite: voices.gerwim.sprite,
    preload: true,
    onplay: async () => { document.dispatchEvent(new Event('announcerSoundPlay')) },
    onend: async () => { document.dispatchEvent(new Event('announcerSoundEnd')) },
}))

let soundQueue = reactive([])
watch(soundQueue, async (queue) => {
    if (queue[0] && !voices.rosetta.sprite[queue[0].id]) soundQueue.shift()
    if (queue[0] && !Object.values(voices).some(voice => voice.isPlaying)) {
        const soundParams = soundQueue[0]
        if (voices[voice.value]?.sprite[soundParams.id]) voices[voice.value].play(soundParams)
        else voices.rosetta.play(soundParams)
        document.addEventListener('announcerSoundEnd', () => {
            soundQueue.shift()
        }, { once: true })
    }
}, { deep: true })

const announcementsToMake = ref([])
watch([tmsScheduleStore, announceStart, announcePlfStart, announcePlfStartGracePeriod, announceMainShow, announceCredits, announceCreditsGracePeriod, announceEnd], ([store]) => compileListOfAnnouncements(store))
compileListOfAnnouncements(tmsScheduleStore)
function compileListOfAnnouncements(store) {
    let array = []

    // Start
    if (announceStart.value) store.table.forEach((row) => {
        if (row.scheduledTime) array.push({
            announceTime: row.scheduledTime,
            announcement: ['chime', 'start', `auditorium${parseAuditorium(row.AUDITORIUM)}`],
            announcementType: 'start',
            status: 'unscheduled',
            ...row
        })
    })

    // Start 4DX
    if (announcePlfStart.value) store.table.filter(row => row.AUDITORIUM?.includes('4DX')).forEach((row) => {
        if (row.scheduledTime) array.push({
            announceTime: new Date(row.scheduledTime.getTime() - (announcePlfStartGracePeriod.value * 60000)),
            announcement: ['chime', 'start', `auditorium${parseAuditorium(row.AUDITORIUM)}`],
            status: 'unscheduled',
            announcementType: 'start4dx',
            ...row
        })
    })

    // Main show
    if (announceMainShow.value) store.table.forEach((row) => {
        if (row.scheduledTime) array.push({
            announceTime: row.featureTime,
            announcement: ['chime', 'mainshow', `auditorium${parseAuditorium(row.AUDITORIUM)}`],
            status: 'unscheduled',
            announcementType: 'mainshow',
            ...row
        })
    })

    // Credits
    if (announceCredits.value) store.table.forEach((row) => {
        if (row.creditsTime) array.push({
            announceTime: new Date(row.creditsTime.getTime() - (announceCreditsGracePeriod.value * 1000)),
            announcement: ['chime', 'credits', `auditorium${parseAuditorium(row.AUDITORIUM)}`],
            status: 'unscheduled',
            announcementType: 'credits',
            ...row
        })
    })

    // End show
    if (announceEnd.value) store.table.forEach((row) => {
        if (row.scheduledTime) array.push({
            announceTime: row.endTime,
            announcement: ['chime', 'end', `auditorium${parseAuditorium(row.AUDITORIUM)}`],
            status: 'unscheduled',
            announcementType: 'end',
            ...row
        })
    })

    announcementsToMake.value.filter((a) => a.status === 'scheduled').forEach((a) => {
        if (!array.find((b) => a.announceTime === b.announceTime && a.announcement.join() === b.announcement.join())) array.push(a)
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
            }, obj.announceTime - Date.now())
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
    const soundNames = { start: "start", mainshow: "start hoofdfilm", credits: "aftiteling", end: "einde voorstelling" }
    let auditoriumMatch = id.match(/^(auditorium)([0-9]+)$/)
    if (soundNames[id]) return soundNames[id]
    else if (auditoriumMatch) return `zaal ${Number(auditoriumMatch[2])}`
    else return id
}

function parseAuditorium(auditorium) {
    if (auditorium?.toLowerCase().includes('rooftop')) return '08'
    else return String(auditorium?.match(/\d+/)).padStart(2, '0')
}
</script>

<template>
    <div class="container dark">
        <TmsScheduleUploadSection />
        <section>
            <div class="flex" style="flex-wrap: wrap;">
                <div style="flex: 50% 1 1;" v-if="tmsScheduleStore.table.length > 0">
                    <h2>Geplande omroepen</h2>
                    <div id="upcoming-announcements" class="flex" style="flex-direction: column; gap: 8px;">
                        <div v-for="row in announcementsToMake" v-show="now - row.announceTime < 10000" class="film"
                            :class="{ 'announcing': row.status === 'announcing' }">
                            <div class="room">
                                {{ (row.AUDITORIUM === 'PULR 8') ? 'RT' : row.AUDITORIUM.replace(/^\w+\s/, '') }}
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
                                <Icon fill v-else-if="row.announcementType === 'start'"
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
                </div>
                <div id="parameters" style="flex: 229px 1 1;">
                    <Tabs themeColor="#ffc426">
                        <Tab value="Opties">
                            <InputCheckbox v-model="announceStart" identifier="announceStart">
                                'Start' omroepen
                            </InputCheckbox>
                            <InputCheckbox v-model="announcePlfStart" identifier="announcePlfStart"
                                v-if="tmsScheduleStore.table.some(row => row.AUDITORIUM?.includes('4DX'))">
                                <span>'Start' <b v-if="announceStart">extra</b> omroepen bij 4DX</span>
                            </InputCheckbox>
                            <InputNumber v-model.number="announcePlfStartGracePeriod"
                                identifier="announcePlfStartGracePeriod" min="0" max="30" unit="min"
                                v-if="announcePlfStart && tmsScheduleStore.table.some(row => row.AUDITORIUM?.includes('4DX'))">
                                Voorlooptijd 'start' bij 4DX
                                <div class="small" v-if="announceCreditsGracePeriod > 0">
                                    De 4DX-inloop wordt {{ announcePlfStartGracePeriod }} min van tevoren omgeroepen.
                                </div>
                            </InputNumber>
                            <InputCheckbox v-model="announceMainShow" identifier="announceMainShow">
                                'Start hoofdfilm' omroepen
                            </InputCheckbox>
                            <InputCheckbox v-model="announceCredits" identifier="announceCredits">
                                'Aftiteling' omroepen
                            </InputCheckbox>
                            <InputNumber v-model.number="announceCreditsGracePeriod"
                                identifier="announceCreditsGracePeriod" step="15" min="0" max="240" unit="s"
                                v-if="announceCredits">
                                Voorlooptijd 'aftiteling'
                                <div class="small" v-if="announceCreditsGracePeriod > 0">
                                    De aftiteling wordt {{ announceCreditsGracePeriod }} s van tevoren omgeroepen.
                                </div>
                            </InputNumber>
                            <InputCheckbox v-model="announceEnd" identifier="announceEnd">
                                'Einde voorstelling' omroepen
                            </InputCheckbox>
                            <InputText v-model="voice" identifier="voice">Naam stem</InputText>
                        </Tab>
                        <Tab value="Handmatig">
                            <div class="flex" style="flex-wrap: wrap; gap: 8px; margin-top: -4px;">
                                <ButtonPrimary v-for="id of Object.keys(voices.rosetta.sprite)"
                                    @click="soundQueue.push({ id })">
                                    {{ formatSoundName(id) }}
                                </ButtonPrimary>
                            </div>
                            <div class="queue">
                                <div v-for="element in soundQueue">
                                    <Icon :fill="true">graphic_eq</Icon>
                                    {{ formatSoundName(element.id) }}
                                </div>
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
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
}

.film.announcing {
    background-color: #ffffff96;
    color: #000;
}

.film .room {
    grid-column: 1;
    grid-row: 1 / -1;
    padding-inline: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-weight: 600;
    overflow: hidden;
}

.film .title {
    font-weight: 600;
    margin-top: 6px;
}

.film .time {
    opacity: 0.5;
    margin-bottom: 6px;
}

.film .chips {
    position: absolute;
    top: 8px;
    right: 8px;
    gap: 4px;
}

.film .announcement {
    grid-column: 1 / -1;
    grid-row: -1;
    padding-block: 6px;
    background-color: #ffffff14;
}

.film .announcement .word.announcing {
    background-color: #ffc426;
    color: #000;
}

.film .announcement .icon {
    justify-self: center;
    opacity: 0.5;
}

#parameters .input {
    margin-bottom: 16px;
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
