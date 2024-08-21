<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { Tabs, Tab } from 'super-vue3-tabs'

import { useTmsXmlStore } from '@/stores/tmsXml.js'
const tmsXmlStore = useTmsXmlStore()

const filmMeta = computed(() => ((tmsXmlStore.obj?.ReelList?.Reel?.[0] || tmsXmlStore.obj?.ReelList?.Reel)?.AssetList?.['meta:CompositionMetadataAsset'] || (tmsXmlStore.obj?.ReelList?.Reel?.[0] || tmsXmlStore.obj?.ReelList?.Reel)?.AssetList?.['cpl-meta:CompositionMetadataAsset']))
const filmTitle = computed(() => (filmMeta.value?.['meta:FullContentTitleText'] || filmMeta.value?.['cpl-meta:FullContentTitleText'])?._text || tmsXmlStore.obj?.AnnotationText?._text.split('_')[0])
const filmSubtitleLanguages = computed(() => (filmMeta.value?.['meta:MainSubtitleLanguageList'] || filmMeta.value?.['cpl-meta:MainSubtitleLanguageList'])?._text)

const reels = computed(() => {
    const reelsOrigin = tmsXmlStore.obj?.ReelList?.Reel
    if (reelsOrigin?.length > 0) {
        const reels = reelsOrigin?.map((reel, i) => {
            const obj = {}
            const reelInfo = reel?.AssetList?.MainPicture
            obj.title = reelInfo?.AnnotationText?._text || `Reel ${i}`
            obj.frameRate = Number(reelInfo?.FrameRate?._text?.split(' ')[0])
            obj.frames = Number((reelInfo?.Duration || reelInfo?.IntrinsicDuration)?._text)
            obj.intrinsicFrames = Number(reelInfo?.IntrinsicDuration?._text)
            obj.duration = obj.frames / obj.frameRate * 1000
            obj.intrinsicDuration = obj.intrinsicFrames / obj.frameRate * 1000
            obj.subtitleLanguage = reel?.AssetList?.MainSubtitle?.Language?._text
            obj.id = reelInfo?.Id?._text
            return obj
        })
        return reels
    } else {
        const reel = reelsOrigin
        const reelInfo = reel?.AssetList?.MainPicture
        const obj = {}
        obj.title = reel?.AnnotationText?._text || `Reel 0`
        obj.frameRate = Number(reelInfo?.FrameRate?._text?.split(' ')[0])
        obj.frames = Number((reelInfo?.Duration || reelInfo?.IntrinsicDuration)?._text)
        obj.intrinsicFrames = Number(reelInfo?.IntrinsicDuration?._text)
        obj.duration = obj.frames / obj.frameRate * 1000
        obj.intrinsicDuration = obj.intrinsicFrames / obj.frameRate * 1000
        obj.subtitleLanguage = reel?.AssetList?.MainSubtitle?.Language?._text
        obj.id = reelInfo?.Id?._text
        const reels = [obj]
        return reels
    }
})

function formatDuration(duration = 0, frameRate = 24) {
    frameRate = Number(frameRate)
    let frames = duration * frameRate / 1000
    const hours = Math.floor(frames / frameRate / 60 / 60)
    const minutes = Math.floor(frames / frameRate / 60) % 60
    const seconds = Math.floor(frames / frameRate) % 60
    const extraFrames = Math.floor(frames % frameRate)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(extraFrames).padStart(2, '0')}`
}
</script>

<template>
    <div class="container dark">
        <TmsXmlUploadSection />
        <section>
            <div class="flex" style="flex-wrap: wrap;">
                <div style="flex: 50% 1 1;" v-if="tmsXmlStore.metadata?.name">
                    <h2>Filminformatie</h2>
                    <div class="film">
                        <div class="room">
                            <Icon fill style="--size: 24px; opacity: 0.5;">theaters</Icon>
                        </div>
                        <div class="title">{{ filmTitle }}</div>
                        <div class="time" v-if="!reels.some(reel => reel.frameRate !== reels[0].frameRate)">
                            {{ formatDuration(reels?.reduce((acc, reel) => acc + reel.duration, 0)), reels[0].frameRate
                            }}
                            ({{ reels[0].frameRate }} fps)</div>
                        <div class="time" v-else>Framerate verschilt per reel</div>
                        <div class="flex chips">
                            <Chip class="translucent-white" v-if="reels.some(reel => reel.subtitleLanguage)">
                                <Icon fill>subtitles</Icon> {{ filmSubtitleLanguages }}
                            </Chip>
                        </div>
                        <div class="extra">
                            <table class="reels">
                                <thead>
                                    <td>Reel</td>
                                    <td>Framerate</td>
                                    <td>Frames</td>
                                    <td>IFrames</td>
                                    <td>Verschil</td>
                                    <td>Duur (hh:mm:ss:ff)</td>
                                    <td>IDuur (hh:mm:ss:ff)</td>
                                </thead>
                                <tr v-for="reel in reels">
                                    <td>{{ reel.title }}</td>
                                    <td>{{ reel.frameRate }} fps</td>
                                    <td>{{ reel.frames }} frames</td>
                                    <td>{{ reel.intrinsicFrames }} frames</td>
                                    <td>{{ reel.intrinsicFrames - reel.frames }} frames</td>
                                    <td>{{ formatDuration(reel.duration, reel.frameRate) }}</td>
                                    <td>{{ formatDuration(reel.intrinsicDuration, reel.frameRate) }}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
                <div id="parameters" style="flex: 229px 1 1;">
                    <Tabs themeColor="#ffc426">
                        <Tab value="Opties">

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

.film .extra {
    grid-column: 1 / -1;
    grid-row: -1;
    padding-block: 6px;
    background-color: #ffffff14;
}

#parameters .input {
    margin-bottom: 16px;
}
</style>
