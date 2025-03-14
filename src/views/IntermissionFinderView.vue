<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'

import { useTmsXmlStore } from '@/stores/tmsXml'
import SidePanel from '@/components/SidePanel.vue';
const tmsXmlStore = useTmsXmlStore()

const intermissionPercentageDev = useStorage('intermission-percentage-dev', 5)

const filmMeta = computed(() => {
    return findObjectValue(
        (tmsXmlStore.obj?.ReelList?.Reel?.[0] || tmsXmlStore.obj?.ReelList?.Reel)?.AssetList,
        ([key]) => key.includes('CompositionMetadataAsset'))
})
const filmTitle = computed(() => {
    return findObjectValue(
        filmMeta.value,
        ([key]) => key.includes('TitleText')
    )?._text || tmsXmlStore.obj?.AnnotationText?._text.split('_')[0]
})
const filmIs3d = computed(() => {
    return !!findObjectValue(
        (tmsXmlStore.obj?.ReelList?.Reel?.[0] || tmsXmlStore.obj?.ReelList?.Reel)?.AssetList,
        ([key]) => key.includes('StereoscopicPicture'))
})
const filmSpokenLanguage = computed(() => {
    return findObjectValue(
        findObjectValue(
            findObjectValue(
                filmMeta.value,
                ([key]) => key.includes('SubDescriptors')),
            ([key]) => key.includes('SubDescriptor')),
        ([key]) => key.includes('SpokenLanguage')
    )?._text
})
const filmSubtitleLanguage = computed(() => {
    return findObjectValue(
        filmMeta.value,
        ([key]) => key.includes('MainSubtitleLanguageList')
    )?._text
})

const reels = computed(() => {
    const reelsOrigin = tmsXmlStore.obj?.ReelList?.Reel
    let reels = []

    if (reelsOrigin?.length > 0) {
        reels.push(...reelsOrigin?.map((reel, i) => {
            const obj = {}
            const assetList = reel?.AssetList
            const reelInfo = findObjectValue(
                assetList,
                ([key]) => key.includes('Main') && key.endsWith('Picture')
            )
            obj.title = reelInfo?.AnnotationText?._text || `Reel ${i}`
            obj.frameRate = Number(reelInfo?.EditRate?._text?.split(' ')[0]) || Number(reelInfo?.FrameRate?._text?.split(' ')[0])
            obj.frames = Number((reelInfo?.Duration || reelInfo?.IntrinsicDuration)?._text)
            obj.intrinsicFrames = Number(reelInfo?.IntrinsicDuration?._text)
            obj.duration = obj.frames / obj.frameRate * 1000
            obj.intrinsicDuration = obj.intrinsicFrames / obj.frameRate * 1000
            obj.entryPoint = Number(reelInfo?.EntryPoint?._text)
            obj.id = reelInfo?.Id?._text
            return obj
        }))
    } else {
        const obj = {}
        const reel = reelsOrigin
        const assetList = reel?.AssetList
        const reelInfo = findObjectValue(
            assetList,
            ([key]) => key.includes('Main') && key.endsWith('Picture')
        )
        obj.title = reel?.AnnotationText?._text || `Reel 0`
        obj.frameRate = Number(reelInfo?.EditRate?._text?.split(' ')[0]) || Number(reelInfo?.FrameRate?._text?.split(' ')[0])
        obj.frames = Number((reelInfo?.Duration || reelInfo?.IntrinsicDuration)?._text)
        obj.intrinsicFrames = Number(reelInfo?.IntrinsicDuration?._text)
        obj.duration = obj.frames / obj.frameRate * 1000
        obj.intrinsicDuration = obj.intrinsicFrames / obj.frameRate * 1000
        obj.entryPoint = Number(reelInfo?.EntryPoint?._text)
        obj.id = reelInfo?.Id?._text
        reels.push(obj)
    }

    reels.forEach((obj, i1) => {
        obj.properDuration = obj.duration / reels.reduce((acc, reel) => acc + reel.duration, 0)
        obj.properStart = reels.slice(0, i1).reduce((acc, reel) => acc + reel.properDuration, 0)
    })

    return reels
})

const mostCentralGap = computed(() => [...reels.value].sort((a, b) => Math.abs(a.properStart - 0.5) - Math.abs(b.properStart - 0.5))[0].properStart)
const reelAfterGapIndex = computed(() => reels.value.findIndex(reel => reel.properStart === mostCentralGap.value))
const filmDuration = computed(() => reels.value.reduce((acc, reel) => acc + reel.duration, 0))

function findObjectValue(obj, predicate) {
    if (typeof obj !== 'object') return
    return Object.entries(obj)?.find(predicate)?.[1]
}

function formatDuration(duration = 0, frameRate = 24) {
    frameRate = Number(frameRate)
    let frames = duration * frameRate / 1000
    const hours = Math.floor(frames / frameRate / 60 / 60)
    const minutes = Math.floor(frames / frameRate / 60) % 60
    const seconds = Math.floor(frames / frameRate) % 60
    const extraFrames = Math.floor(frames % frameRate)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(extraFrames).padStart(2, '0')}`
}

function formatReelInformation(reel, i) {
    return `
${i + 1}e reel\n
Titel: ${reel.title || 'Geen'}
ID: ${reel.id}\n
Framerate: ${reel.frameRate} fps
Duur: ${formatDuration(reel.duration, reel.frameRate)} (${reel.frames} frames)\n
Intrinsieke duur: ${formatDuration(reel.intrinsicDuration, reel.frameRate)} (${reel.intrinsicFrames} frames)
Startpunt: ${formatDuration(reel.entryPoint, reel.frameRate)} (${reel.entryPoint} frames)`
}
</script>

<template>
    <HeroImage />
    <main class="container dark">
        <TmsXmlUploadSection />
        <section>
            <div class="flex" style="flex-wrap: wrap;">
                <div style="flex: 50% 1 1;">
                    <h2>Filminformatie</h2>
                    <div class="film" v-if="tmsXmlStore.metadata?.name">
                        <div class="room">
                            <Icon fill style="--size: 24px; opacity: 0.5;">theaters</Icon>
                        </div>
                        <h3 class="title">{{ filmTitle }}</h3>
                        <div class="time" v-if="!reels.some(reel => reel.frameRate !== reels[0].frameRate)">
                            {{ formatDuration(filmDuration, reels[0].frameRate) }}
                            <span :class="{ bold: reels[0].frameRate !== 24, colour: reels[0].frameRate !== 24 }">
                                ({{ reels[0].frameRate }} fps)
                            </span>
                        </div>
                        <div class="time" v-else>Framerate verschilt per reel</div>
                        <div class="flex chips">
                            <Chip v-if="filmIs3d">
                                <Icon fill>eyeglasses</Icon>3D
                            </Chip>
                            <Chip class="translucent-white" v-if="filmSpokenLanguage">
                                <Icon fill>volume_up</Icon> {{ filmSpokenLanguage }}
                            </Chip>
                            <Chip class="translucent-white" v-if="filmSubtitleLanguage">
                                <Icon fill>subtitles</Icon> {{ filmSubtitleLanguage }}
                            </Chip>
                        </div>
                        <div class="extra">
                            <h4>Reels</h4>
                            <div class="flex proportional-reels">
                                <div v-for="(reel, i) in reels" class="reel"
                                    :style="{ '--propFrac': reel.properDuration }"
                                    :title="formatReelInformation(reel, i)"
                                    :class="{ 'after-intermission': mostCentralGap === reel.properStart && Math.abs(mostCentralGap - 0.5) < (intermissionPercentageDev / 100) }">
                                </div>
                            </div>
                            <table class="reels">
                                <thead>
                                    <tr>
                                        <td>Reel</td>
                                        <td>Duur (hh:mm:ss:ff)</td>
                                        <td>Starttijd (hh:mm:ss:ff)</td>
                                    </tr>
                                </thead>
                                <tr v-for="(reel, i) in reels" :title="formatReelInformation(reel, i)">
                                    <td>{{ i + 1 }}</td>
                                    <td>{{ formatDuration(reel.duration, reel.frameRate) }}
                                        <span v-if="reel.frameRate !== reels[0].frameRate" class="bold colour">
                                            ({{ reel.frameRate }} fps)
                                        </span>
                                    </td>
                                    <td>{{ formatDuration(reel.properStart * filmDuration, reel.frameRate) }}
                                        ({{ (reel.properStart * 100).toLocaleString('nl-NL',
                                            { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}%)
                                    </td>
                                </tr>
                            </table>
                            <div class="extra-extra">
                                <h4>Pauzesuggestie</h4>
                                <p v-if="Math.abs(mostCentralGap - 0.5) < (intermissionPercentageDev / 100)">
                                    Een pauze zou kunnen worden ingepland tussen de {{ reelAfterGapIndex }}<sup>e</sup>
                                    en de
                                    {{ reelAfterGapIndex + 1 }}<sup>e</sup> reel
                                    (na {{ formatDuration(mostCentralGap * filmDuration, reels[0].frameRate) }} of {{
                                        (mostCentralGap * 100).toLocaleString('nl-NL',
                                            { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}%).
                                </p>
                                <p v-else-if="reels.length > 1">
                                    Er is geen reel die tussen {{ 50 -
                                        intermissionPercentageDev }}% en {{ 50 + intermissionPercentageDev }}% van de
                                    film
                                    eindigt.
                                    <a v-if="(Math.abs(mostCentralGap - 0.5) - (intermissionPercentageDev / 100)) < 0.05"
                                        class="link"
                                        @click="intermissionPercentageDev = Math.ceil(Math.abs(mostCentralGap - 0.5) * 100)">
                                        Maximale afwijking bijstellen tot {{ Math.ceil(Math.abs(mostCentralGap - 0.5) *
                                            100) }}%?</a>
                                    <br>
                                    Een pauze zou kunnen worden ingepland tijdens de
                                    {{ reelAfterGapIndex + 1 }}<sup>e</sup> reel (bijvoorbeeld na
                                    <b>{{ formatDuration(0.5 * filmDuration, reels[0].frameRate) }}</b> of 50%).
                                    <br>
                                </p>
                                <p v-else>
                                    Er is maar één reel.
                                    <br>
                                    Een pauze zou halverwege kunnen worden ingepland (bijvoorbeeld na
                                    <b>{{ formatDuration(0.5 * filmDuration, reels[0].frameRate) }}</b> of 50%).
                                </p>
                            </div>
                        </div>
                    </div>
                    <p v-else>Geen bestand geüpload</p>
                </div>
                <SidePanel style="flex: 229px 1 1;">
                    <Tabs>
                        <Tab value="Configuratie">
                            <fieldset>
                                <legend>Pauzesuggestie</legend>
                                <InputNumber v-model.number="intermissionPercentageDev"
                                    identifier="intermissionPercentageDev" unit="%">
                                    Maximale afwijking van middenpunt
                                    <small>De filmpauze kan worden geplaatst tussen {{ 50 -
                                        intermissionPercentageDev }}% en {{ 50 + intermissionPercentageDev }}% van de
                                        film.
                                    </small>
                                </InputNumber>
                            </fieldset>
                        </Tab>
                    </Tabs>
                </SidePanel>
            </div>
        </section>
    </main>
</template>

<style scoped>
div.container {
    min-height: calc(100vh - 70px);
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

.film h3,
.film h4 {
    margin: 0;
}

.film .room {
    grid-column: 1;
    grid-row: 1 / -1;
    padding-left: 8px;
    padding-right: 8px;
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

.film .extra {
    grid-column: 1 / -1;
    grid-row: -1;
    padding: 12px;
    background-color: #ffffff14;
}

.film .extra-extra {
    margin: -12px;
    margin-top: 0;
    padding: 12px;
    background-color: #ffffff14;

    p {
        margin-block: 4px;
    }
}

table {
    border: 1px solid #ffffff3d;
    border-collapse: collapse;
    width: 100%;
    margin-top: 16px;
    margin-bottom: 16px;
    font-size: 12.5px;
}

thead {
    background-color: #ffffff96;
    color: #000;
    font-weight: bold;
}

tr,
thead {
    height: 21.5px;
    min-height: 21.5px;
    max-height: 21.5px;
}

tr:nth-child(even) {
    background-color: #ffffff14;
}

td {
    position: relative;
    padding: 2px 6px;
}

.proportional-reels {
    width: 100%;
    gap: 4px;
}

.proportional-reels .reel {
    position: relative;
    height: 20px;
    background-color: #ffffff3d;
    flex: 1 1 calc(var(--propFrac) * 100%);
}

.proportional-reels .reel.after-intermission:before {
    content: '';
    position: absolute;
    left: -3px;
    top: -6px;
    bottom: -6px;
    width: 2px;
    background-color: #ffc426;
}
</style>
