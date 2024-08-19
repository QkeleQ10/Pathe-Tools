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

const announceUsherouts = useStorage('usherout-announce', true)
const usheroutAnnounceBefore = useStorage('usherout-announce-before', 60)
const announcePlfUsherins = useStorage('plf-announce', true)
const plfTimeBefore = useStorage('plf-time-before', 17)

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

    if (announceUsherouts.value) timetableFileStore.table.forEach((row) => {
        if (row.creditsTime) {
            array.push({
                announceTime: new Date(row.creditsTime.getTime() - (usheroutAnnounceBefore.value * 1000)),
                announcement: ['credits', `a${row.AUDITORIUM?.match(/\d+/)}`],
                ...row
            })
        }
    })

    if (announcePlfUsherins.value) timetableFileStore.table.filter(row => row.AUDITORIUM?.includes('4DX')).forEach((row) => {
        if (row.scheduledTime) {
            array.push({
                announceTime: new Date(row.scheduledTime.getTime() - (plfTimeBefore.value * 60000)),
                announcement: ['usherin', `a${row.AUDITORIUM?.match(/\d+/)}`],
                ...row
            })
        }
    })

    return array || []
})

setInterval(() => {
    announcementsToMake.value.forEach((row, i) => {
        if (!row.announced && Math.abs(row.announceTime - now.value) <= 2000) {
            console.log("Announcing!", row)
            row.announcement.forEach(id => {
                soundQueue.push({ id })
            })
            announcementsToMake.value[i].announced = true
        }
    })
}, 1000)
</script>


<template>
    <div class="container dark">
        <TimetableUploadSection />
        <section v-if="timetableFileStore.table.length > 0">
            <h2>Volgende omroepen</h2>
            {{ soundQueue }}
            <div class="flex" style="flex-wrap: wrap;">
                <div id="upcoming-announcements" class="flex" style="flex-direction: column;">
                    <div v-for="row in announcementsToMake" v-show="now - row.announceTime < 10000" class="film"
                        :class="{ 'announced': !!row.announced }">
                        <div class="room">
                            {{ (row.AUDITORIUM === 'PULR 8') ? 'RT' : row.AUDITORIUM.replace(/^\w+\s/, '') }}
                        </div>
                        <div class="title">{{ row.PLAYLIST }}</div>
                        <div class="time">
                            {{ row.scheduledTime.toLocaleTimeString('nl-NL') }} –
                            {{ row.endTime.toLocaleTimeString('nl-NL') }}</div>
                        <div class="announcement" :class="row.announcement">
                            "{{ row.announcement.map(a => soundNames[a]).join(' ') }}"
                            {{ row.announceTime.toLocaleTimeString() }}
                            <span v-show="Math.abs(row.announceTime - now) < 120000">
                                ({{ Math.floor((row.announceTime - now) / 1000) }} s)
                            </span>
                            {{ row.announceTime - now }}
                        </div>
                    </div>
                </div>
                <div id="parameters" style="display: flex; flex-direction: column; flex: 229px 1 1;">
                    <Tabs themeColor="#ffc426">
                        <Tab value="Opties">
                            <InputCheckbox v-model="announceUsherouts" identifier="announceUsherouts">
                                Uitlopen omroepen
                            </InputCheckbox>
                            <InputNumber v-model.number="usheroutAnnounceBefore" identifier="usheroutBefore" step="15"
                                min="0" max="240" unit="s">
                                Tijd vóór uitloop
                            </InputNumber>
                            <InputCheckbox v-model="announcePlfUsherins" identifier="announcePlfUsherins">
                                Start 4DX-inloop omroepen
                            </InputCheckbox>
                            <InputNumber v-model.number="plfTimeBefore" identifier="plfTimeBefore" min="0" max="30"
                                unit="min">
                                Tijd vóór inloop 4DX
                            </InputNumber>
                        </Tab>
                        <Tab value="Handmatig">
                            <ButtonPrimary v-for="(val, id) of spriteMap" @click="soundQueue.push({ id })">
                                {{ soundNames[id] }}
                            </ButtonPrimary>
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

.film .room {
    grid-column: 1;
    grid-row: 1 / -1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}

.film .title {
    font-weight: 600;
}

.film .time {
    opacity: 0.5;
}

.film .announcement {
    grid-column: 1 / -1;
    grid-row: -1;
    padding: 6px 12px;
    background-color: #ffffff14;
}

.film.announced {
    background-color: #fff;
    color: #000;
}
</style>
