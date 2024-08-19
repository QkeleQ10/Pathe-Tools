<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useSound } from '@vueuse/sound'
import { Tabs, Tab } from 'super-vue3-tabs'
import sfx from '@/assets/sounds/voices/tts.mp3'

import { useTimetableFileStore } from '@/stores/timetableFile.js'
const timetableFileStore = useTimetableFileStore()

const now = ref(() => new Date())
setInterval(() => {
    now.value = new Date()
}, 1000)

const announceCredits = useStorage('announce-credits', true)
const announceCreditsGracePeriod = useStorage('announce-credits-grace-period', 60)
const announceEnds = useStorage('announce-end', false)
const announcePlfStart = useStorage('announce-plf-start', true)
const announcePlfStartGracePeriod = useStorage('announce-plf-start-grace-period', 15)

const soundNames = { a1: "zaal 1", a2: "zaal 2", a3: "zaal 3", a4: "zaal 4", a5: "zaal 5", a6: "zaal 6", a7: "zaal 7", credits: "aftiteling" }

let soundQueue = reactive([])
const spriteMap = {
    a1: [0, 1055],
    a2: [2000, 1055],
    a3: [4000, 1055],
    a4: [6000, 1055],
    a5: [8000, 1055],
    a6: [10000, 1055],
    a7: [12000, 1055],
    credits: [14000, 1055]
}
const { play, isPlaying } = useSound(sfx, {
    sprite: spriteMap,
    preload: true,
    onplay: async () => { document.dispatchEvent(new Event('announcerSoundPlay')) },
    onend: async () => { document.dispatchEvent(new Event('announcerSoundEnd')) },
})

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

const announcementsToMake = computed(() => {
    let array = []

    if (announceCredits.value) timetableFileStore.table.forEach((row) => {
        if (row.creditsTime) {
            array.push({
                announceTime: new Date(row.creditsTime.getTime() - (announceCreditsGracePeriod.value * 1000)),
                announcement: ['credits', `a${row.AUDITORIUM?.match(/\d+/)}`],
                ...row
            })
        }
    })

    if (announcePlfStart.value) timetableFileStore.table.filter(row => row.AUDITORIUM?.includes('4DX')).forEach((row) => {
        if (row.scheduledTime) {
            array.push({
                announceTime: new Date(row.scheduledTime.getTime() - (announcePlfStartGracePeriod.value * 60000)),
                announcement: ['usherin', `a${row.AUDITORIUM?.match(/\d+/)}`],
                ...row
            })
        }
    })

    // scheduleAnnouncements(array)
    return array || []
})


const scheduledAnnouncements = reactive([])
watch(announcementsToMake, scheduleAnnouncements)
scheduleAnnouncements(announcementsToMake.value)
function scheduleAnnouncements(array) {
    while (scheduledAnnouncements.length > 0) scheduledAnnouncements.pop()

    array.forEach((obj) => {
        // Skip iteration if the announcement is in the past.
        if (obj.announceTime < Date.now()) return

        scheduledAnnouncements.push(obj)
        setTimeout(() => {
            let i = scheduledAnnouncements.findIndex((obj2) => obj.announceTime === obj2.announceTime && obj.announcement.join() === obj2.announcement.join())
            if (!i) return
            obj.announcement.forEach(id => { soundQueue.push({ id }) })
            setTimeout(() => {
                i = scheduledAnnouncements.findIndex((obj2) => obj.announceTime === obj2.announceTime && obj.announcement.join() === obj2.announcement.join())
                if (i) scheduledAnnouncements.splice(i, 1)
            }, 10000)
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
        <TimetableUploadSection />
        <section v-if="timetableFileStore.table.length > 0">
            <h2>Geplande omroepen</h2>
            <div class="flex" style="flex-wrap: wrap;">
                <div id="upcoming-announcements" class="flex" style="flex-direction: column; gap: 8px;">
                    <div v-for="row in scheduledAnnouncements" v-show="now - row.announceTime < 10000" class="film"
                        :class="{ 'announced': row.announceTime <= now }">
                        <div class="room">
                            {{ (row.AUDITORIUM === 'PULR 8') ? 'RT' : row.AUDITORIUM.replace(/^\w+\s/, '') }}
                        </div>
                        <div class="title">{{ row.PLAYLIST }}</div>
                        <div class="time">
                            {{ row.scheduledTime.toLocaleTimeString('nl-NL') }} –
                            {{ row.endTime.toLocaleTimeString('nl-NL') }}</div>
                        <div class="announcement" :class="row.announcement"
                            style="display: grid; grid-template-columns: 64px 130px 1fr;">
                            <span class="icon-speaker" :class="{ loud: row.announceTime <= now }"
                                style="justify-self: center; opacity: 0.5;"></span>
                            <div>
                                {{ row.announceTime.toLocaleTimeString() }}
                                ({{ formatTimeLeft(row.announceTime - now) }})
                            </div>
                            <div>
                                '<span v-for="(id, i) in row.announcement" class="word"
                                    :class="{ announcing: row.announceTime <= now && soundQueue[0]?.id === id }">
                                    {{ soundNames[id] || id }}{{ i < row.announcement.length - 1 ? '&nbsp;' : '' }}
                                        </span>'
                            </div>
                        </div>
                    </div>
                </div>
                <div id="parameters" style="flex: 229px 1 1;">
                    <Tabs themeColor="#ffc426">
                        <Tab value="Opties">
                            <InputCheckbox v-model="announceCredits" identifier="announceCredits">
                                Aftiteling omroepen
                            </InputCheckbox>
                            <InputNumber v-model.number="announceCreditsGracePeriod"
                                identifier="announceCreditsGracePeriod" step="15" min="0" max="240" unit="s">
                                Voorlooptijd aftiteling
                                <div class="small" v-if="announceCreditsGracePeriod > 0">
                                    De aftiteling wordt {{ announceCreditsGracePeriod }} s van tevoren omgeroepen.
                                </div>
                            </InputNumber>
                            <InputCheckbox v-model="announcePlfStart" identifier="announcePlfStart">
                                Start 4DX omroepen
                            </InputCheckbox>
                            <InputNumber v-model.number="announcePlfStartGracePeriod"
                                identifier="announcePlfStartGracePeriod" min="0" max="30" unit="min">
                                Voorlooptijd start 4DX
                                <div class="small" v-if="announceCreditsGracePeriod > 0">
                                    De 4DX-inloop wordt {{ announcePlfStartGracePeriod }} min van tevoren omgeroepen.
                                </div>
                            </InputNumber>
                            <InputCheckbox>
                                Start omroepen (dead)
                            </InputCheckbox>
                            <InputCheckbox>
                                Start hoofdfilm omroepen (dead)
                            </InputCheckbox>
                            <InputCheckbox>
                                Einde voorstelling omroepen (dead)
                            </InputCheckbox>
                        </Tab>
                        <Tab value="Handmatig">
                            <div class="flex" style="flex-wrap: wrap; gap: 8px;">
                                <ButtonPrimary v-for="(val, id) of spriteMap" @click="soundQueue.push({ id })">
                                    {{ soundNames[id] || id }}
                                </ButtonPrimary>
                            </div>
                            <div class="flex" style="flex-direction: column; gap: 8px;">
                                <div v-for="element in soundQueue">
                                    <span class="icon-speaker loud"></span> {{ soundNames[element.id] || element.id }}
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
    flex: 50% 1 1;
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

.film.announced {
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

.icon-speaker:after {
    display: inline-block;
    content: '🕩';
    transform: scaleX(-1) scale(1.5);
    padding-inline: 4px;
}

.icon-speaker.loud:after {
    content: '🕪';
}

#parameters .input {
    margin-bottom: 16px;
}
</style>
