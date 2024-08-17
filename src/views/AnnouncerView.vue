<script setup>
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useSound } from '@vueuse/sound'
import { Tabs, Tab } from 'super-vue3-tabs'
import sfx from '@/assets/sounds/voices/tts.mp3'

import { useTimetableFileStore } from '@/stores/timetableFile.js'
const timetableFileStore = useTimetableFileStore()

const announceUsherouts = useStorage('usherout-announce', true)
const announcePlfUsherins = useStorage('plf-announce', true)
const plfTimeBefore = useStorage('plf-time-before', 17)

const { play, sound } = useSound(sfx, {
    sprite: {
        auditorium1: [0, 1055],
        auditorium2: [2000, 1055],
        auditorium3: [4000, 1055],
        auditorium4: [6000, 1055],
        auditorium5: [8000, 1055],
        auditorium6: [10000, 1055],
        auditorium7: [12000, 1055],
        credits: [14000, 1055],
    },
})

function clicky() {
    console.log(sound)
    play({ id: 'credits' })
    setTimeout(() => {
        play({ id: 'auditorium1' })
    }, 1055)
}

</script>


<template>
    <div class="container dark" @click="clicky">
        <TimetableUploadSection />
        <section v-if="timetableFileStore.table.length > 0">
            <h2>Volgende omroepen</h2>
            <div class="flex" style="flex-wrap: wrap;">
                <div class="flex">
                </div>
                <div id="parameters" style="display: flex; flex-direction: column; flex: 229px 1 1;">
                    <Tabs themeColor="#ffc426">
                        <Tab value="Opties">
                            <InputCheckbox v-model="announceUsherouts" identifier="announceUsherouts">
                                Uitlopen omroepen
                            </InputCheckbox>
                            <InputCheckbox v-model="announcePlfUsherins" identifier="announcePlfUsherins">
                                Start 4DX-inloop omroepen
                            </InputCheckbox>
                            <InputNumber v-model.number="plfTimeBefore" identifier="plfTimeBefore" min="0" max="30"
                                unit="min">
                                Tijd vóór inloop 4DX
                            </InputNumber>
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
</style>
