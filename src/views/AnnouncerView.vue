<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useSound } from '@vueuse/sound'
import { Tabs, Tab } from 'super-vue3-tabs'

import voiceTts from '@/assets/sounds/voices/tts.ogg'

import { useTmsScheduleStore } from '@/stores/tmsSchedule.js'
const tmsScheduleStore = useTmsScheduleStore()

const now = ref(() => new Date())
setInterval(updateNowValue, 1000)
updateNowValue()
function updateNowValue() {
    now.value = new Date()
}

const voice = useStorage('announcement-voice', 'tts')
const announceStart = useStorage('announce-start', false)
const announcePlfStart = useStorage('announce-plf-start', true)
const announcePlfStartGracePeriod = useStorage('announce-plf-start-grace-period', 15)
const announceMainShow = useStorage('announce-main-show', false)
const announceCredits = useStorage('announce-credits', true)
const announceCreditsGracePeriod = useStorage('announce-credits-grace-period', 60)
const announceEnd = useStorage('announce-end', false)

function formatSoundName(id) {
    const soundNames = { start: "start", mainshow: "start hoofdfilm", credits: "aftiteling", end: "einde voorstelling" }
    let auditoriumMatch = id.match(/^(auditorium)([0-9]+)$/)
    if (soundNames[id]) return soundNames[id]
    else if (auditoriumMatch) return `zaal ${auditoriumMatch[2]}`
    else return id
}

const spriteMap = {
    "auditorium1": [0, 1296.0090702947846], "auditorium2": [3000, 1344.0136054421766], "auditorium3": [6000, 1248.004535147392], "auditorium4": [9000, 1368.0045351473923], "auditorium5": [12000, 1488.0045351473932], "auditorium6": [15000, 1440.0000000000014], "auditorium7": [18000, 1488.0045351473932], "credits": [21000, 1296.009070294783], "end": [24000, 1728.0045351473916], "mainshow": [27000, 1728.0045351473916], "start": [30000, 1056.0090702947846], "chime": [33000, 1616.6893424036316]
}

const { play, isPlaying } = useSound(voiceTts, {
    sprite: spriteMap,
    preload: true,
    onplay: async () => { document.dispatchEvent(new Event('announcerSoundPlay')) },
    onend: async () => { document.dispatchEvent(new Event('announcerSoundEnd')) },
})

let soundQueue = reactive([])
watch(soundQueue, async (queue) => {
    if (queue[0] && !spriteMap[queue[0].id]) soundQueue.shift()
    if (queue[0] && !isPlaying.value) {
        const soundParams = soundQueue[0]
        play(soundParams)
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
            announcement: ['chime', 'start', `auditorium${row.AUDITORIUM?.match(/\d+/)}`],
            status: 'unscheduled',
            ...row
        })
    })

    // Start 4DX
    if (announcePlfStart.value) store.table.filter(row => row.AUDITORIUM?.includes('4DX')).forEach((row) => {
        if (row.scheduledTime) array.push({
            announceTime: new Date(row.scheduledTime.getTime() - (announcePlfStartGracePeriod.value * 60000)),
            announcement: ['chime', 'start', `auditorium${row.AUDITORIUM?.match(/\d+/)}`],
            status: 'unscheduled',
            ...row
        })
    })

    // Main show
    if (announceMainShow.value) store.table.forEach((row) => {
        if (row.scheduledTime) array.push({
            announceTime: row.featureTime,
            announcement: ['chime', 'mainshow', `auditorium${row.AUDITORIUM?.match(/\d+/)}`],
            status: 'unscheduled',
            ...row
        })
    })

    // Credits
    if (announceCredits.value) store.table.forEach((row) => {
        if (row.creditsTime) array.push({
            announceTime: new Date(row.creditsTime.getTime() - (announceCreditsGracePeriod.value * 1000)),
            announcement: ['chime', 'credits', `auditorium${row.AUDITORIUM?.match(/\d+/)}`],
            status: 'unscheduled',
            ...row
        })
    })

    // End show
    if (announceEnd.value) store.table.forEach((row) => {
        if (row.scheduledTime) array.push({
            announceTime: row.endTime,
            announcement: ['chime', 'end', `auditorium${row.AUDITORIUM?.match(/\d+/)}`],
            status: 'unscheduled',
            ...row
        })
    })

    announcementsToMake.value = [
        ...announcementsToMake.value.filter((a) => a.status === 'scheduled'),
        ...array.filter((a) => a.announceTime >= Date.now()).sort((a, b) => a.announceTime - b.announceTime)
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
            obj.status = 'scheduled'
            setTimeout(() => {
                if (obj.status === 'unscheduled') return
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
                                    :class="{ 'translucent-white': !(extra === '4DX' && row.announcement.includes('start')) }">
                                    {{ extra
                                    }}</Chip>
                            </div>
                            <div class="announcement" :class="row.announcement"
                                @dblclick="row.announcement.forEach(id => { soundQueue.push({ id }) })"
                                style="display: grid; grid-template-columns: 64px 130px 1fr;">
                                <Icon style="justify-self: center; opacity: 0.5"
                                    :class="{ pulsate: row.status === 'scheduled' }">
                                    {{ row.announceTime <= now ? 'graphic_eq' : 'schedule' }}</Icon>
                                        <div>
                                            {{ row.announceTime.toLocaleTimeString('nl-NL') }}
                                            ({{ formatTimeLeft(row.announceTime - now) }})
                                        </div>
                                        <div>
                                            '<span v-for="(id, i) in row.announcement" v-show="id !== 'chime'"
                                                class="word"
                                                :class="{ announcing: row.announceTime <= now && soundQueue[0]?.id === id }">
                                                {{ formatSoundName(id) }}{{ i < row.announcement.length - 1 ? '&nbsp;'
                                                    : '' }} </span>'
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
                        </Tab>
                        <Tab value="Handmatig">
                            <div class="flex" style="flex-wrap: wrap; gap: 8px; margin-top: -4px;">
                                <ButtonPrimary v-for="(val, id) of spriteMap" @click="soundQueue.push({ id })">
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
