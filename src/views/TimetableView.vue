<script setup>
import { ref, computed, nextTick } from 'vue'
import { useStorage } from '@vueuse/core'
import { useVueToPrint } from "vue-to-print"

import { useTmsScheduleStore } from '@/stores/tmsSchedule.js'

const columns = {
    mainTime: {
        header: "Start",
        title: "Start hoofdfilm",
        optional: true
    },
    endTime: {
        header: "Einde",
        title: "Einde voorstelling",
        optional: true
    },
    nextStartTime: {
        header: "Volgende",
        title: "Volgende inloop",
        optional: true
    }
}
const optionalColumns = Object.fromEntries(Object.entries(columns).filter(([key, value]) => value.optional))

const customContent = useStorage('custom-content', {
    text1: '',
    text2: ''
})
const splitExtra = ref(true)
const optionalColumnsSetting = useStorage('optional-columns', {
    mainTime: false,
    endTime: false,
    nextStartTime: false
})
const plfTimeBefore = useStorage('plf-time-before', 17) // usher-in will begin 17 minutes before start
const shortGapInterval = useStorage('short-gap-interval', 10) // double usher-out if the difference is less than 10 minutes
const longGapInterval = useStorage('long-gap-interval', 35) // long gap if the difference is greater than 30 minutes
const calculatePostCredits = useStorage('calculate-post-credits', true)
const postCreditsFilms = useStorage('post-credits-films', new Set())
while (postCreditsFilms.value.size > 20) {
    console.log(postCreditsFilms.value)
    postCreditsFilms.value.delete(Array.from(postCreditsFilms.value)[0])
}

const printComponent = ref(null)
const editSection = ref(null)

const showMenu = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const targetRow = ref({})
const targetI = ref(0)

const showContextMenu = (event, row, i) => {
    event.preventDefault()
    document.activeElement.blur()
    showMenu.value = true
    targetRow.value = row
    targetI.value = i
    menuX.value = event.clientX
    menuY.value = event.clientY
}

const closeContextMenu = () => {
    nextTick(() => showMenu.value = false)
}

const tmsScheduleStore = useTmsScheduleStore()

const transformedTable = computed(() => {
    let transformedTable = tmsScheduleStore.table.map((row, i) => {
        let obj = { ...row }
        obj.overlapWithPlf = tmsScheduleStore.table.filter(testRow => testRow.AUDITORIUM?.includes('4DX')).some(testRow =>
            getTimeDifferenceInMs(testRow.SCHEDULED_TIME, row.CREDITS_TIME) >= plfTimeBefore.value * -60000 &&
            getTimeDifferenceInMs(testRow.FEATURE_TIME, row.CREDITS_TIME) <= 0
        )
        obj.hasPostCredits = postCreditsFilms.value.has(obj.title?.trim())
        obj.assumedEndTime = obj.hasPostCredits && calculatePostCredits.value ? row.END_TIME : row.CREDITS_TIME
        obj.timeToNextUsherout = getTimeDifferenceInMs(obj.assumedEndTime, tmsScheduleStore.table[i + 1]?.CREDITS_TIME)
        obj.nextStartTime = tmsScheduleStore.table.find((testRow, testI) => testI > i && testRow.AUDITORIUM === row.AUDITORIUM)?.SCHEDULED_TIME
        return obj
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
        transformedTable[index].isNearPlf = true
    })

    return transformedTable || []
})

function parseTime(timeStr) {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number)
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds)
}

function getTimeDifferenceInMs(time1, time2) {

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
    documentTitle: "Tijdenlijstje " + new Date().toLocaleDateString('nl-NL'),
})
</script>

<template>
    <main class="container dark">
        <TmsScheduleUploadSection />
        <section id="edit" ref="editSection" v-if="tmsScheduleStore.table.length > 0">
            <div class="flex" style="flex-wrap: wrap-reverse;">
                <div>
                    <h2>Tijdenlijstje bewerken</h2>
                    <div id="print-component" ref="printComponent">
                        <div class="page">
                            <table class="timetable" spellcheck="false">
                                <colgroup>
                                    <col span="1" style="width: 0;">
                                    <col span="1" style="width: 0;">
                                    <col span="1" style="width: 16%;">
                                    <col span="1" style="width: 0;" v-if="optionalColumnsSetting.mainTime">
                                    <col span="1" style="width: 28%;">
                                    <col span="1" style="width: 0;" v-if="optionalColumnsSetting.endTime">
                                    <col span="1" style="width: 0;" v-if="optionalColumnsSetting.nextStartTime">
                                    <col span="1" style="width: 50%;">
                                    <col span="1" style="width: 0;">
                                </colgroup>
                                <thead>
                                    <tr>
                                        <td nowrap contenteditable width="1px">Zaal</td>
                                        <td nowrap contenteditable>Inloop</td>
                                        <td nowrap contenteditable v-if="optionalColumnsSetting.mainTime">
                                            {{ columns.mainTime.header }}
                                        </td>
                                        <td nowrap contenteditable></td>
                                        <td nowrap contenteditable>Aftiteling</td>
                                        <td nowrap contenteditable v-if="optionalColumnsSetting.endTime">
                                            {{ columns.endTime.header }}
                                        </td>
                                        <td nowrap contenteditable v-if="optionalColumnsSetting.nextStartTime">
                                            {{ columns.nextStartTime.header }}
                                        </td>
                                        <td nowrap contenteditable>Film</td>
                                        <td nowrap contenteditable></td>
                                    </tr>
                                </thead>
                                <tr v-for="(row, i) in transformedTable" v-show="i != 0"
                                    :class="{ targeting: showMenu && targetI === i, italic: row.AUDITORIUM?.includes('4DX'), bold: row.FEATURE_RATING === '16' || row.FEATURE_RATING === '18' }"
                                    @contextmenu.prevent="showContextMenu($event, row, i)">
                                    <td nowrap contenteditable>
                                        {{ (row.AUDITORIUM === 'PULR 8' || row.AUDITORIUM === 'Rooftop') ? 'RT' :
                                            row.AUDITORIUM.replace(/^\w+\s/, '') }}
                                    </td>
                                    <td nowrap contenteditable>
                                        {{ row.SCHEDULED_TIME.replace(/(:00)$/, '') }}
                                    </td>
                                    <td nowrap contenteditable v-if="optionalColumnsSetting.mainTime"
                                        class="translucent">
                                        {{ row.FEATURE_TIME }}
                                    </td>
                                    <td nowrap contenteditable v-if="i !== transformedTable.length - 1"
                                        class="special-cell"
                                        :class="{ 'intermission-checkbox': !!row.intermissionAfter }"
                                        @dblclick="tmsScheduleStore.table.at(i).intermissionAfter = !row.intermissionAfter">
                                        {{ row.isNearPlf ? '4DX' : ' ' }}
                                    </td>
                                    <td v-else></td>
                                    <td nowrap>
                                        <div class="double-usherout"
                                            v-if="row.timeToNextUsherout <= shortGapInterval * 60000">
                                        </div>
                                        <div class="long-gap"
                                            v-if="row.timeToNextUsherout >= longGapInterval * 60000 && longGapInterval > 0">
                                        </div>
                                        <div class="plf-overlap" v-if="row.overlapWithPlf"></div>
                                        <span contenteditable class="credits-time">
                                            {{ row.CREDITS_TIME }}
                                            <span v-if="row.hasPostCredits" class="post-credits">+{{
                                                Math.round(getTimeDifferenceInMs(row.CREDITS_TIME, row.END_TIME) /
                                                    60000)
                                            }}</span>
                                        </span>
                                    </td>
                                    <td nowrap contenteditable v-if="optionalColumnsSetting.endTime"
                                        class="translucent">
                                        {{ row.END_TIME }}
                                    </td>
                                    <td nowrap contenteditable v-if="optionalColumnsSetting.nextStartTime"
                                        class="translucent" style="font-weight: normal; font-style: normal;">
                                        {{ row.nextStartTime?.replace(/(:00)$/, '') || '-' }}
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
                            <br>
                            <div class="custom-content" contenteditable></div>
                            <div class="footer">
                                gegenereerd op
                                {{ new Date().toLocaleDateString('nl-NL', {
                                    weekday: 'short', day: 'numeric', month: 'short',
                                    year: 'numeric'
                                }) }}
                                om
                                {{ new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) }}
                                • Pathé Tools
                                • Quinten Althues
                            </div>
                        </div>
                        <div class="page">
                            <div class="custom-content" contenteditable>
                                <!-- <table spellcheck="false">
                                    <tbody>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table> -->
                            </div>
                        </div>
                    </div>
                </div>
                <SidePanel style="flex-basis: 229px;">
                    <Tabs>
                        <Tab value="Opties">
                            <fieldset>
                                <legend>Weergave</legend>
                                <InputCheckbox v-model="splitExtra" identifier="splitExtra">
                                    Extra informatie scheiden van filmtitel
                                </InputCheckbox>
                            </fieldset>
                            <fieldset :disabled="!tmsScheduleStore.table.some(row => row.AUDITORIUM?.includes('4DX'))">
                                <legend>4DX-inloop</legend>
                                <small>Uitlopen tijdens de 4DX-inloop worden gemarkeerd met een streeplijntje.</small>

                                <InputNumber v-model.number="plfTimeBefore" identifier="plfTimeBefore" min="0" max="30"
                                    unit="min"
                                    :disabled="!tmsScheduleStore.table.some(row => row.AUDITORIUM?.includes('4DX'))">
                                    Tijd voor aanvang
                                    <small v-if="plfTimeBefore > 0">De 4DX-inloop begint {{ plfTimeBefore }} minuten
                                        voor de aanvangstijd en eindigt wanneer de hoofdfilm begint.</small>
                                </InputNumber>
                            </fieldset>
                            <fieldset>
                                <legend>Uitloop</legend>
                                <InputNumber v-model.number="shortGapInterval" identifier="shortGapInterval" min="0"
                                    max="20" unit="min">Interval
                                    voor dubbele
                                    uitloop
                                    <small v-if="shortGapInterval > 0">
                                        Uitlopen met minder dan {{ shortGapInterval }} minuten ertussen krijgen een
                                        boogje
                                    </small>
                                    <small v-else>Uitlopen met weinig tijd ertussen worden niet gemarkeerd</small>
                                </InputNumber>
                                <InputNumber v-model.number="longGapInterval" identifier="longGapInterval" min="20"
                                    max="80" unit="min">Interval
                                    voor gat tussen
                                    uitlopen
                                    <small v-if="longGapInterval > 0">Gaten van meer dan {{ longGapInterval }}
                                        minuten
                                        krijgen een stippellijntje
                                    </small>
                                    <small v-else>Uitlopen met veel tijd ertussen worden niet gemarkeerd</small>
                                </InputNumber>
                                <InputCheckbox v-model="calculatePostCredits" identifier="calculatePostCredits">
                                    Post-credits-scènes meerekenen
                                    <small v-if="calculatePostCredits">
                                        Bij uitlopen met post-credits-scènes wordt de tijd 'Einde voorstelling' gebruikt
                                        voor het
                                        berekenen van de tijd tot de volgende uitloop.
                                    </small>
                                    <small v-else>
                                        Bij alle uitlopen wordt de tijd 'Aftiteling' wordt gebruikt voor het
                                        berekenen van de tijd tot de volgende uitloop.
                                    </small>
                                </InputCheckbox>
                            </fieldset>
                        </Tab>
                        <Tab value="Kolommen">
                            <InputCheckbox v-for="(value, colId) in optionalColumns"
                                v-model="optionalColumnsSetting[colId]" :identifier="colId">
                                {{ columns[colId].title }}
                            </InputCheckbox>
                        </Tab>
                    </Tabs>
                    <div class="buttons"
                        style="display: flex; flex-direction: column; gap: 16px; align-items: stretch; margin-top: auto; position: sticky; bottom: 16px; padding-left: 16px; padding-right: 16px;">
                        <ButtonPrimary @click="handlePrint">
                            Afdrukken</ButtonPrimary>
                    </div>
                </SidePanel>
            </div>
        </section>
        <section v-else>
            <h2>Tijdenlijstje bewerken</h2>
            <p>Upload eerst een bestand.</p>
        </section>
    </main>
    <Transition>
        <ContextMenu v-if="showMenu" class="dark" :x="menuX" :y="menuY" @click-outside="closeContextMenu">
            <button
                @click="tmsScheduleStore.table.at(targetI).intermissionAfter = !targetRow.intermissionAfter; closeContextMenu()">
                <div class="check" :class="{ 'empty': !transformedTable.at(targetI).intermissionAfter }"></div>
                Selectievakje onder deze rij
            </button>
            <button
                @click="postCreditsFilms.has(targetRow.title?.trim()) ? postCreditsFilms.delete(targetRow.title?.trim()) : postCreditsFilms.add(targetRow.title?.trim()); closeContextMenu()">
                <div class="check" :class="{ 'empty': !postCreditsFilms.has(targetRow.title?.trim()) }"></div>
                Post-credits-scène bij {{ targetRow.title }}
            </button>
        </ContextMenu>
    </Transition>
</template>

<style scoped>
div.container {
    min-height: calc(100vh - 70px);
}

h2 {
    margin-bottom: 16px;
}

#print-component {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    max-width: 100%;
    overflow: auto;

    --border-color: #ffffff3d;
    --row-color: transparent;
    --banded-row-color: #ffffff14;
    --header-color: #ffffff96;
    --color: #fff;
    --inverse-color: #000;
}

#print-component>.page {
    width: 100%;
    aspect-ratio: 210/297;
    border-radius: 5px;
    background-color: #ffffff14;
    padding: 16px;
    page-break-after: always;
    page-break-inside: avoid;
}

div.custom-content {
    width: 100%;
    padding: 10px;
    color: var(--color);
    text-align: center;

    &:empty:after {
        content: "Eigen tekst toevoegen";
        opacity: .3;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        color: var(--color);
        font-size: 12px;

        td {
            border: 1px solid var(--border-color);
            padding: 4px;
        }
    }
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
    @page {
        size: A4;
        margin: 1.35cm;
    }

    #print-component {
        display: block;
        position: unset;
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

    #print-component>.page {
        aspect-ratio: unset;
        border-radius: 0;
        background-color: transparent;
        padding: 0;
    }

    div.custom-content:empty {
        display: none;
    }

    #print-component>.page:last-child:has(div.custom-content:empty) {
        display: none;
    }

    div.footer {
        display: block;
    }
}

[contenteditable]:hover {
    outline: 1px solid #ffffff88;
    outline-offset: -1px;
    background-color: #ffc52631;
}

[contenteditable]:focus-visible {
    outline: 1px solid #ffc426;
    outline-offset: -1px;
    background-color: #ffc52631;
}

table.timetable {
    border: 1px solid var(--border-color);
    border-collapse: collapse;
    color: var(--color);
    width: 18cm;
    max-height: 26cm;
    font-size: 12.5px;

    thead>tr {
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

        &:nth-child(even) {
            background-color: var(--banded-row-color);
        }

        &.targeting {
            background-color: #ffc52631;
        }
    }

    td {
        position: relative;
        padding: 2px 6px;

        &.special-cell {
            transform: translateY(50%);
            text-align: end;
            padding-right: 14px;
            font-weight: normal;
        }

        &.intermission-checkbox:before {
            content: '';
            position: absolute;
            right: 42px;
            top: 50%;
            transform: translateY(-50%);
            border: 1px solid var(--color);
            background-color: var(--row-color);
            opacity: 0.5;
            height: 12px;
            width: 12px;
        }

        .double-usherout {
            position: absolute;
            top: 50%;
            left: -3px;
            height: 100%;
            width: 22px;
            border-radius: 50%;
            outline: 2px solid var(--color);
            clip-path: inset(-3px calc(100% - 5px) -3px -3px);
            opacity: .5;
        }

        .long-gap {
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 62px;
            border-bottom: 2px dotted var(--color);
            opacity: .35;
        }

        .plf-overlap {
            position: absolute;
            top: 0;
            bottom: 0;
            left: -10px;
            border-left: 2px dashed var(--color);
            opacity: .5;
        }

        .credits-time {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            padding: 2px 6px;
            display: flex;
            align-items: center;
        }

        .post-credits {
            opacity: .35;
            font-weight: normal;
            font-style: normal;
            margin-left: 4px;
        }
    }
}
</style>
