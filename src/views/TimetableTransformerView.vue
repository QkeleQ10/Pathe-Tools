<script setup>
import { ref, computed } from 'vue'
import { useVueToPrint } from "vue-to-print"

import ButtonPrimary from '@/components/ButtonPrimary.vue'
import DropZone from '@/components/DropZone.vue'
import InputSlider from '@/components/InputSlider.vue'

const plfTimeBefore = ref(16) // usher-in will begin 16 minutes before start
const plfTimeAfter = ref(16) // usher-in will end 16 minutes after start
const shortGapInterval = ref(10) // double usher-out if the difference is less than 10 minutes
const longGapInterval = ref(35) // long gap if the difference is greater than 30 minutes

const fileInput = ref(null)
const printComponent = ref(null)
const table = ref([])
const transformedTable = computed(() => {
    let transformedTable = table.value.map((row, i) => {
        let extra = row.PLAYLIST?.match(/(\s((4DX)|(ATMOS)|(3D)|(\([A-Z]+\))))+/)?.[0]?.slice(1)
        let title = row.PLAYLIST?.replace(extra, '')
        let overlapWithPlf = table.value.filter(testRow => testRow.AUDITORIUM?.includes('4DX')).some(testRow => (getTimeDifferenceInMs(testRow.SCHEDULED_TIME, row.CREDITS_TIME) >= plfTimeBefore.value * -60000 && getTimeDifferenceInMs(testRow.SCHEDULED_TIME, row.CREDITS_TIME) <= plfTimeAfter.value * 60000))
        let timeToNextUsherout = getTimeDifferenceInMs(row.CREDITS_TIME, table.value.at(i + 1)?.CREDITS_TIME)
        return { ...row, title, extra, overlapWithPlf, timeToNextUsherout }
    })

    transformedTable.filter(testRow => testRow.AUDITORIUM?.includes('4DX')).slice(1).forEach(plfRow => {
        let index
        for (let i = 0; i < transformedTable.length; i++) {
            const row = transformedTable[i]
            let difference = getTimeDifferenceInMs(plfRow.SCHEDULED_TIME, row.CREDITS_TIME)
            if (difference > 0) {
                index = i - 1
                break
            }
        }
        transformedTable.at(index).isNearPlf = true
    })

    return transformedTable || []

})

async function addFiles(fileList) {
    if (fileList?.[0]?.type !== 'text/csv') return
    const text = await fileList[0].text()

    const arr = text.split('\n')

    let jsonObj = []
    const headers = arr[0].split(',')
    for (var i = 0; i < arr.length; i++) {
        const data = arr[i].split(',')
        let obj = {}
        for (let j = 0; j < data.length; j++) {
            obj[headers[j].trim()] = data[j].trim()
        }
        jsonObj.push(obj)
    }
    console.log(jsonObj)
    table.value = jsonObj
}

function getTimeDifferenceInMs(time1, time2) {
    function parseTime(timeStr) {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number)
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds)
    }

    if (!time1 || !time2) return

    const date1 = parseTime(time1)
    const date2 = parseTime(time2)

    const difference1 = date2 - date1

    date2.setDate(date2.getDate() + 1)

    const difference2 = date2 - date1

    return Math.abs(difference1) < Math.abs(difference2) ? difference1 : difference2;
}

const { handlePrint } = useVueToPrint({
    content: () => printComponent.value,
    documentTitle: "Tijdenlijstje",
})
</script>

<template>
    <div class="container dark">
        <section id="upload">
            <h2>Bestand uploaden</h2>
            <DropZone id="drop-zone" @files-dropped="addFiles" #default="{ dropZoneActive }" @click="fileInput.click()"
                style="cursor: pointer;">
                <div v-if="dropZoneActive">
                    <div>Laat los om te uploaden</div>
                    <div class="small">CSV-bestand</div>
                </div>
                <div v-else>
                    <div>Sleep een bestand hierheen</div>
                    <div class="small">CSV-bestand</div>
                </div>
                <ButtonPrimary :data-active="dropZoneActive">Bladeren...</ButtonPrimary>
            </DropZone>
            <input type="file" ref="fileInput" accept="text/csv" style="display: none"
                @change="addFiles($event.target.files)" />
        </section>
        <section id="edit" v-show="table.length > 0">
            <h2>Tijdenlijstje bewerken</h2>
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 32px;">
                <div id="printComponent" ref="printComponent">
                    <table spellcheck="false">
                        <colgroup></colgroup>
                        <thead>
                            <td nowrap contenteditable
                                v-for="header in ['Zaal', 'Inloop', 'Aftiteling', 'Titel', 'Lftd.']">
                                {{ header }}
                            </td>
                        </thead>
                        <tr v-for="(row, i) in transformedTable" v-show="i != 0"
                            :class="{ italic: row.AUDITORIUM?.includes('4DX'), bold: row.FEATURE_RATING === '16' || row.FEATURE_RATING === '18' }">
                            <td nowrap contenteditable width="1px">
                                {{ row.AUDITORIUM.replace(/^\w+\s/, '') }}
                            </td>
                            <td nowrap contenteditable width="20%">
                                {{ row.SCHEDULED_TIME.replace(/(:00)$/, '') }}
                            </td>
                            <td nowrap contenteditable width="15%">
                                <div class="double-usherout" v-if="row.timeToNextUsherout <= shortGapInterval * 60000">
                                </div>
                                <div class="long-gap" v-if="row.timeToNextUsherout >= longGapInterval * 60000">
                                </div>
                                <div class="plf-overlap" v-if="row.overlapWithPlf"></div>
                                <div class="near-plf">{{ row.isNearPlf ? '4DX' : ' ' }}</div>
                                {{ row.CREDITS_TIME }}
                            </td>
                            <td nowrap contenteditable>
                                <span>{{ row.title }}</span>
                                <span style="float: right">{{ row.extra }}</span>
                            </td>
                            <td nowrap contenteditable width="1px" style="text-align: end;"
                                :class="{ translucent: row.FEATURE_RATING !== '16' && row.FEATURE_RATING !== '18' }">
                                {{ row.FEATURE_RATING }}
                            </td>
                        </tr>
                    </table>
                    <div class="custom-content" contenteditable></div>
                </div>
                <div id="parameters">
                    <InputSlider v-model="plfTimeBefore" min="0" max="30" unit="min">Tijd vóór inloop 4DX
                        <div class="small">Uitlopen vanaf {{ plfTimeBefore }} minuten voor een 4DX-inloop krijgen een
                            stippellijntje</div>
                    </InputSlider>
                    <InputSlider v-model="plfTimeAfter" min="0" max="30" unit="min">Tijd na inloop 4DX
                        <div class="small">Uitlopen tot {{ plfTimeAfter }} minuten na een 4DX-inloop krijgen een
                            stippellijntje</div>
                    </InputSlider>
                    <InputSlider v-model="shortGapInterval" min="0" max="30" unit="min">Interval voor dubbele uitloop
                        <div class="small">Uitlopen met minder dan {{ shortGapInterval }} minuten ertussen krijgen een
                            boogje</div>
                    </InputSlider>
                    <InputSlider v-model="longGapInterval" min="20" max="80" unit="min">Interval voor gat tussen
                        uitlopen
                        <div class="small">Gaten van meer dan {{ longGapInterval }} minuten worden
                            aangegeven met een stippellijntje</div>
                    </InputSlider>
                </div>
            </div>
        </section>
        <section id="print" v-show="table.length > 0">
            <h2>Tijdenlijstje afdrukken</h2>
            <ButtonPrimary @click="handlePrint">Afdrukken</ButtonPrimary>
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

#drop-zone {
    width: 100%;
    height: 100%;
    min-height: 170px;
    min-width: 512px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;

    border-radius: 5px;
    background-color: #ffffff14;
    border: 4px dashed transparent;
    color: #ffffffcc;
    font-size: 14px;
}

#drop-zone[data-active=true] {
    border-color: #ffffff14;
}

#drop-zone>div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

button[data-active=true] {
    opacity: .3;
}

#printComponent {
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 5px;
    background-color: #ffffff14;
    padding: 16px;

    --border-color: #ffffff3d;
    --banded-row-color: #ffffff14;
    --header-color: #ffffff96;
    --color: #fff;
    --inverse-color: #000;
}

@media print {
    #printComponent {
        width: 21cm;
        height: 29.7cm;
        box-sizing: border-box;
        padding: 0;
        padding-top: 1.6cm;
        background-color: transparent;

        --border-color: #525252;
        --banded-row-color: #d3d3d3;
        --header-color: #525252;
        --color: #000;
        --inverse-color: #fff;
    }

    div.custom-content:empty {
        display: none;
    }
}

table {
    border: 1px solid var(--border-color);
    border-collapse: collapse;
    color: var(--color);
    width: 18cm;
    max-height: 26cm;
    font-size: 13px;
}

thead {
    background-color: var(--header-color);
    color: var(--inverse-color);
    font-weight: bold;
}

tr,
thead {
    height: 22px;
}

tr:nth-child(even) {
    background-color: var(--banded-row-color);
}

td {
    position: relative;
    padding: 2px 6px;
}

td .double-usherout {
    position: absolute;
    top: 50%;
    left: -2px;
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    outline: 2px solid var(--color);
    clip-path: inset(-3px calc(100% - 6px) -3px -3px);
    opacity: .5;
}

td .long-gap {
    position: absolute;
    bottom: -1px;
    width: 52px;
    border-bottom: 2px dotted var(--color);
    opacity: .5;
}

td .plf-overlap {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -8px;
    border-left: 2px dotted var(--color);
    opacity: .5;
}

td .near-plf {
    position: absolute;
    left: -12px;
    top: 100%;
    height: 0;
    width: 0;
    display: flex;
    align-items: center;
    justify-content: end;
}

div.custom-content {
    margin: -10px;
    margin-top: 6px;
    padding: 10px;
    color: var(--color)
}

div.custom-content:empty:after {
    content: "Tekst";
    opacity: .3;
}

#parameters {
    padding-top: 16px;
}

#parameters .input-slider {
    margin-bottom: 16px;
    width: 100%;
}
</style>
