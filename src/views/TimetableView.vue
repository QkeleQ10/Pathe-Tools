<script setup>
import { ref, computed, nextTick } from 'vue'
import { useVueToPrint } from "vue-to-print"

import ButtonPrimary from '@/components/ButtonPrimary.vue'
import ButtonText from '@/components/ButtonText.vue'
import DropZone from '@/components/DropZone.vue'
import InputCheckbox from '@/components/InputCheckbox.vue'
import InputNumber from '@/components/InputNumber.vue'
import Chip from '@/components/Chip.vue'

const splitExtra = ref(true)
const plfTimeBefore = ref(16) // usher-in will begin 16 minutes before start
const plfTimeAfter = ref(16) // usher-in will end 16 minutes after start
const shortGapInterval = ref(10) // double usher-out if the difference is less than 10 minutes
const longGapInterval = ref(35) // long gap if the difference is greater than 30 minutes

const fileInput = ref(null)
const printComponent = ref(null)
const editSection = ref(null)

const table = ref([])
const transformedTable = computed(() => {
    let transformedTable = table.value.map((row, i) => {
        let extra = row.PLAYLIST?.match(/(\s((4DX)|(ATMOS)|(3D)|(Music)|(\([A-Z]+\))))+/)?.[0]?.slice(1)
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
    table.value = jsonObj

    nextTick(() => {
        editSection.value.scrollIntoView({ behavior: "smooth" })
    })
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

function preferToiletRound(index) {
    console.log(transformedTable.value[index].preferToiletRound)
    transformedTable.value[index].preferToiletRound = !transformedTable.value[index].preferToiletRound
    console.log(transformedTable.value[index].preferToiletRound)
}
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
        <section id="edit" ref="editSection" v-show="table.length > 0">
            <h2>Tijdenlijstje bewerken</h2>
            <div class="flex" style="flex-wrap: wrap;">
                <div id="print-component" ref="printComponent">
                    <table spellcheck="false">
                        <colgroup>
                            <col span="1" style="width: 0;">
                            <col span="1" style="width: 0;">
                            <col span="1" style="width: 16%;">
                            <col span="1" style="width: 28%;">
                            <col span="1" style="width: 50%;">
                            <col span="1" style="width: 0;">
                        </colgroup>
                        <thead>
                            <td nowrap contenteditable width="1px">Zaal</td>
                            <td nowrap contenteditable>Inloop</td>
                            <td nowrap contenteditable></td>
                            <td nowrap contenteditable>Aftiteling</td>
                            <td nowrap contenteditable>Film</td>
                            <td nowrap contenteditable></td>
                        </thead>
                        <tr v-for="(row, i) in transformedTable" v-show="i != 0"
                            :class="{ italic: row.AUDITORIUM?.includes('4DX'), bold: row.FEATURE_RATING === '16' || row.FEATURE_RATING === '18' }">
                            <td nowrap contenteditable>
                                <!--:style="`padding-left: calc(${row.AUDITORIUM.replace(/^\D+/g, '')} * 6px)`"-->
                                {{ row.AUDITORIUM === 'PULR 8' ? 'RT' : row.AUDITORIUM.replace(/^\w+\s/, '') }}
                            </td>
                            <td nowrap contenteditable>
                                {{ row.SCHEDULED_TIME.replace(/(:00)$/, '') }}
                            </td>
                            <td nowrap contenteditable class="special-cell"
                                :class="{ 'toilet-round': !!row.preferToiletRound }"
                                @dblclick="preferToiletRound(i)">
                                {{ row.isNearPlf ? '4DX' : ' ' }}
                            </td>
                            <td nowrap>
                                <div class="double-usherout" v-if="row.timeToNextUsherout <= shortGapInterval * 60000">
                                </div>
                                <div class="long-gap"
                                    v-if="row.timeToNextUsherout >= longGapInterval * 60000 && longGapInterval > 0">
                                </div>
                                <div class="plf-overlap" v-if="row.overlapWithPlf"></div>
                                <span>{{ row.CREDITS_TIME }}</span>
                                <span v-if="row.hasPostCredits">⋆</span>
                            </td>
                            <td nowrap contenteditable v-if="splitExtra">
                                <span>{{ row.title }}</span>
                                <span style="float: right">{{ row.extra }}</span>
                            </td>
                            <td nowrap contenteditable v-else>
                                {{ row.PLAYLIST }}
                            </td>
                            <td nowrap contenteditable style="text-align: end;"
                                :class="{ translucent: row.FEATURE_RATING !== '16' && row.FEATURE_RATING !== '18' }">
                                {{ row.FEATURE_RATING }}
                            </td>
                        </tr>
                    </table>
                    <div class="custom-content" contenteditable></div>
                    <div class="footer">
                        gegenereerd op
                        {{ new Date().toLocaleDateString('nl-NL', {
                        weekday: 'short', day: 'numeric', month: 'short',
                        year: 'numeric'
                        }) }}
                        om
                        {{ new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) }}
                        • Pathé Utrecht Leidsche Rijn
                        • Quinten Althues
                    </div>
                </div>
                <div id="parameters" style="display: flex; flex-direction: column; flex: 229px 1 1;">
                    <InputCheckbox v-model="splitExtra" identifier="splitExtra">Extra informatie scheiden van filmtitel
                    </InputCheckbox>
                    <InputNumber v-model.number="plfTimeBefore" identifier="plfTimeBefore" min="0" max="30" unit="min">
                        Tijd vóór inloop 4DX
                        <div class="small" v-if="plfTimeBefore > 0">Uitlopen vanaf {{ plfTimeBefore }} minuten voor een
                            4DX-inloop krijgen een
                            streeplijntje</div>
                        <div class="small" v-else>Uitlopen vlak voor een 4DX-inloop worden niet gemarkeerd</div>
                    </InputNumber>
                    <InputNumber v-model.number="plfTimeAfter" identifier="plfTimeAfter" min="0" max="30" unit="min">
                        Tijd na inloop 4DX
                        <div class="small" v-if="plfTimeAfter > 0">Uitlopen tot {{ plfTimeAfter }} minuten na een
                            4DX-inloop krijgen een
                            streeplijntje</div>
                        <div class="small" v-else>Uitlopen vlak na een 4DX-inloop worden niet gemarkeerd</div>
                    </InputNumber>
                    <InputNumber v-model.number="shortGapInterval" identifier="shortGapInterval" min="0" max="20"
                        unit="min">Interval voor dubbele
                        uitloop
                        <div class="small" v-if="shortGapInterval > 0">Uitlopen met minder dan {{ shortGapInterval }}
                            minuten ertussen krijgen een
                            boogje</div>
                        <div class="small" v-else>Uitlopen met weinig tijd ertussen worden niet gemarkeerd</div>
                    </InputNumber>
                    <InputNumber v-model.number="longGapInterval" identifier="longGapInterval" min="20" max="80"
                        unit="min">Interval voor gat tussen
                        uitlopen
                        <div class="small" v-if="longGapInterval > 0">Gaten van meer dan {{ longGapInterval }} minuten
                            krijgen een stippellijntje
                        </div>
                        <div class="small" v-else>Uitlopen met veel tijd ertussen worden niet gemarkeerd</div>
                    </InputNumber>
                    <div class="buttons"
                        style="display: flex; flex-direction: column; gap: 16px; align-items: stretch; margin-top: auto; position: sticky; bottom: 16px; padding-inline: 16px;">
                        <!-- <ButtonText @click="determineToiletRounds" style="color: #fff;">
                            <Chip>Experimenteel</Chip>
                            Toiletrondes indelen
                        </ButtonText> -->
                        <ButtonPrimary @click="handlePrint">
                            Afdrukken</ButtonPrimary>
                    </div>
                </div>
            </div>
        </section>
        <!-- <section id="print" v-show="table.length > 0">
            <h2>Tijdenlijstje afdrukken</h2>
            <ButtonPrimary @click="handlePrint">Afdrukken</ButtonPrimary>
        </section> -->
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

#print-component {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 5px;
    background-color: #ffffff14;
    padding: 16px;

    max-width: 100%;
    overflow: auto;

    --border-color: #ffffff3d;
    --row-color: transparent;
    --banded-row-color: #ffffff14;
    --header-color: #ffffff96;
    --color: #fff;
    --inverse-color: #000;
}

div.custom-content {
    width: 100%;
    margin: -10px;
    margin-top: 6px;
    padding: 10px;
    color: var(--color);
    text-align: center;
}

div.custom-content:empty:after {
    content: "Eigen tekst toevoegen";
    opacity: .3;
}

div.footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0.07;
    display: none;
    font-size: 10px;
    text-align: center;
}

@media print {
    #print-component {
        position: fixed;
        inset: 1.4cm;
        width: auto;
        height: auto;
        box-sizing: border-box;
        padding: 0;
        background-color: transparent;
        max-width: none;
        overflow: visible;

        --border-color: #525252;
        --row-color: #fff;
        --banded-row-color: #e4e4e4;
        --header-color: #525252;
        --color: #000;
        --inverse-color: #fff;

        break-inside: avoid;
        break-after: avoid;
        break-before: avoid;
    }

    div.custom-content:empty {
        display: none;
    }

    div.footer {
        display: block;
    }
}

table {
    border: 1px solid var(--border-color);
    border-collapse: collapse;
    color: var(--color);
    width: 18cm;
    max-height: 26cm;
    font-size: 12.5px;
}

thead {
    background-color: var(--header-color);
    color: var(--inverse-color);
    font-weight: bold;
}

tr,
thead {
    height: 21.5px;
    min-height: 21.5px;
    max-height: 21.5px;
}

tr {
    background-color: var(--row-color);
}

tr:nth-child(even) {
    background-color: var(--banded-row-color);
}

td {
    position: relative;
    padding: 2px 6px;
}

[contenteditable]:hover {
    outline: 1px solid #ffffff88;
    background-color: #ffc52631;
}

[contenteditable]:focus-visible {
    outline: 1px solid #ffc426;
    background-color: #ffc52631;
}

td.special-cell {
    translate: 0 50%;
    text-align: end;
    padding-right: 14px;
    font-weight: normal;
}

td.toilet-round:before {
    position: absolute;
    right: 42px;
    content: '';
    border: 1px solid var(--color);
    background-color: var(--row-color);
    opacity: 0.5;
    height: 12px;
    aspect-ratio: 1;
}

td .double-usherout {
    position: absolute;
    top: 50%;
    left: -3px;
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    outline: 2px solid var(--color);
    clip-path: inset(-3px calc(100% - 5px) -3px -3px);
    opacity: .5;
}

td .long-gap {
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 62px;
    border-bottom: 2px dotted var(--color);
    opacity: .35;
}

td .plf-overlap {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -10px;
    border-left: 2px dashed var(--color);
    opacity: .5;
}

#parameters {
    padding-top: 16px;
}

#parameters .input-slider {
    margin-bottom: 16px;
}
</style>
