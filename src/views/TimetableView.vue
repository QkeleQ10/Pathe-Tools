<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useStorage, useDropZone } from '@vueuse/core'
import { useVueToPrint } from "vue-to-print"
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { Show, TimetableShow } from '@/classes/classes'

const store = useTmsScheduleStore()

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
const optionalColumns = Object.fromEntries(Object.entries(columns).filter(([, value]) => value.optional))

const splitExtra = ref(true)
const optionalColumnsSetting = useStorage('optional-columns', {
    mainTime: false,
    endTime: false,
    nextStartTime: false
})
const plfTimeBefore = useStorage('plf-time-before', 17) // usher-in will begin 17 minutes before start
const shortGapInterval = useStorage('short-gap-interval', 10) // double usher-out if the difference is less than 10 minutes
const longGapInterval = useStorage('long-gap-interval', 35) // long gap if the difference is greater than 30 minutes
const postCreditsFilms = useStorage('post-credits-films', new Set())
while (postCreditsFilms.value.size > 20) {
    postCreditsFilms.value.delete(Array.from(postCreditsFilms.value)[0])
}

const printComponent = ref(null)
const main = ref<HTMLElement>(null)

const showMenu = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const targetRow = ref<any>({})
const targetI = ref(0)

function showContextMenu(event: MouseEvent, row: object, i: number) {
    event.preventDefault();
    (document.activeElement as HTMLElement).blur()
    showMenu.value = true
    targetRow.value = row
    targetI.value = i
    menuX.value = event.clientX
    menuY.value = event.clientY
}

function closeContextMenu() {
    nextTick(() => showMenu.value = false)
}

const transformedTable = computed(() => {
    let arr = store.table?.slice().map((show: Show, i: number) => {
        let timetableShow = show as TimetableShow
        timetableShow.overlapWithPlf = store.table.filter(testRow => testRow.auditorium?.includes('4DX')).some(testRow =>
            timetableShow.creditsTime.getTime() - testRow.scheduledTime.getTime() >= plfTimeBefore.value * -60000 &&
            timetableShow.creditsTime.getTime() - testRow.mainShowTime.getTime() <= 0
        )
        timetableShow.hasPostCredits = postCreditsFilms.value.has(timetableShow.title?.trim())
        timetableShow.timeToNextUsherout = store.table[i + 1]?.creditsTime.getTime() - (timetableShow.hasPostCredits ? timetableShow.endTime : timetableShow.creditsTime).getTime()
        timetableShow.nextStartTime = store.table.find((testRow, testI) => testI > i && testRow.auditorium === timetableShow.auditorium)?.scheduledTime
        return timetableShow
    }) || []

    arr.filter(testRow => testRow.auditorium?.includes('4DX')).forEach(plfRow => {
        let index: number = 0;
        for (let i = 0; i < arr.length; i++) {
            const row = arr[i]
            let difference = row.creditsTime.getTime() - plfRow.scheduledTime.getTime()
            if (difference > 0) {
                index = i
                break
            }
        }
        arr[Math.max(index, 0)].isNearPlf = true
    })

    return arr || []
})

const { handlePrint } = useVueToPrint({
    content: () => printComponent.value,
    documentTitle: "Tijdenlijstje " + format(new Date(), 'MM/dd/yyyy'),
})

const { isOverDropZone } = useDropZone(main, {
    onDrop: store.filesUploaded,
    dataTypes: ['text/csv', '.csv'],
    multiple: false
})
</script>

<template>
    <main ref="main">
        <HeroImage />
        <TimetableUploadSection />
        <section id="edit" v-if="transformedTable.length > 0">
            <div class="flex" style="flex-wrap: wrap-reverse;">
                <div>
                    <h2>Tijdenlijstje bewerken</h2>
                    <div id="print-component" ref="printComponent">
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
                            <tr v-for="(row, i) in transformedTable"
                                :class="{ targeting: showMenu && targetI === i, italic: row.auditorium?.includes('4DX'), bold: row.featureRating === '16' || row.featureRating === '18' }"
                                @contextmenu.prevent="showContextMenu($event, row, i)">
                                <td nowrap contenteditable>
                                    {{ (row.auditorium === 'PULR 8' || row.auditorium === 'Rooftop') ? 'RT' :
                                        row.auditorium.replace(/^\w+\s/, '') }}
                                </td>
                                <td nowrap contenteditable>
                                    {{ format(row.scheduledTime, 'HH:mm') }}
                                </td>
                                <td nowrap contenteditable v-if="optionalColumnsSetting.mainTime" class="translucent">
                                    {{ format(row.mainShowTime, 'HH:mm:ss') }}
                                </td>
                                <td nowrap contenteditable class="special-cell">
                                    {{ transformedTable[i]?.isNearPlf }}
                                </td>
                                <td nowrap>
                                    <div class="double-usherout"
                                        v-if="row.timeToNextUsherout <= shortGapInterval * 60000">
                                    </div>
                                    <div class="long-gap"
                                        v-if="row.timeToNextUsherout >= longGapInterval * 60000 && longGapInterval > 0">
                                    </div>
                                    <div class="plf-overlap" v-if="row.overlapWithPlf"></div>
                                    <span contenteditable class="credits-time">
                                        {{ format(row.creditsTime, 'HH:mm:ss') }}
                                        <span v-if="row.hasPostCredits" class="post-credits">+{{
                                            Math.round((row.endTime.getTime() - row.creditsTime.getTime()) /
                                                60000)
                                        }}</span>
                                    </span>
                                </td>
                                <td nowrap contenteditable v-if="optionalColumnsSetting.endTime" class="translucent">
                                    {{ format(row.endTime, 'HH:mm:ss') }}
                                </td>
                                <td nowrap contenteditable v-if="optionalColumnsSetting.nextStartTime"
                                    class="translucent" style="font-weight: normal; font-style: normal;">
                                    {{ row.nextStartTime ? format(row.nextStartTime, 'HH:mm') : '-' }}
                                </td>
                                <td nowrap contenteditable v-if="splitExtra">
                                    <span>{{ row.title }}</span>
                                    <span style="float: right">{{ row.extras.join(' ') }}</span>
                                </td>
                                <td nowrap contenteditable v-else>
                                    {{ row.playlist }}
                                </td>
                                <td nowrap contenteditable style="text-align: end;"
                                    :class="{ translucent: row.featureRating !== '16' && row.featureRating !== '18' }">
                                    {{ row.featureRating }}
                                </td>
                            </tr>
                        </table>
                        <br>
                        <span class="custom-content" contenteditable></span>
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
                            <fieldset :disabled="!transformedTable.some(row => row.auditorium?.includes('4DX'))">
                                <legend>4DX-inloop</legend>
                                <small>Uitlopen tijdens de 4DX-inloop worden gemarkeerd met een
                                    streeplijntje.</small>

                                <InputNumber v-model.number="plfTimeBefore" identifier="plfTimeBefore" min="0" max="30"
                                    unit="min"
                                    :disabled="!transformedTable.some(row => row.auditorium?.includes('4DX'))">
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
                                <small>
                                    Bij uitlopen met post-credits-scènes wordt de tijd 'Einde voorstelling' gebruikt
                                    voor het
                                    berekenen van de tijd tot de volgende uitloop.
                                </small>
                            </fieldset>
                        </Tab>
                        <Tab value="Kolommen">
                            <InputCheckbox v-for="(value, colId) in optionalColumns"
                                v-model="optionalColumnsSetting[colId]" :identifier="String(colId)">
                                {{ columns[colId].title }}
                            </InputCheckbox>
                        </Tab>
                    </Tabs>
                    <div class="buttons"
                        style="display: flex; flex-direction: column; gap: 16px; align-items: stretch; margin-top: auto; position: sticky; bottom: 16px; padding-left: 16px; padding-right: 16px;">
                        <ButtonPrimary class="full" @click="handlePrint">
                            Afdrukken</ButtonPrimary>
                    </div>
                </SidePanel>
            </div>
        </section>
        <section v-else>
            <h2>Tijdenlijstje bewerken</h2>
            <p>Upload eerst een bestand.</p>
        </section>
        <Transition>
            <ContextMenu v-if="showMenu" class="dark" :x="menuX" :y="menuY" @click-outside="closeContextMenu">
                <button
                    @click="postCreditsFilms.has(targetRow.title?.trim()) ? postCreditsFilms.delete(targetRow.title?.trim()) : postCreditsFilms.add(targetRow.title?.trim()); closeContextMenu()">
                    <div class="check" :class="{ 'empty': !postCreditsFilms.has(targetRow.title?.trim()) }"></div>
                    Post-credits-scène bij {{ targetRow.title }}
                </button>
            </ContextMenu>
        </Transition>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </main>
</template>

<style scoped>
#print-component {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    max-width: 100%;
    aspect-ratio: 210/297;
    overflow: auto;
    border-radius: 5px;
    background-color: #ffffff14;
    padding: 16px;

    --border-color: #ffffff3d;
    --row-color: transparent;
    --banded-row-color: #ffffff14;
    --header-color: #ffffff96;
    --color: #fff;
    --inverse-color: #000;
}

.custom-content {
    display: inline-block;
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
    opacity: 0.09;
    display: none;
    font-size: 10px;
    text-align: center;
}

@media print {
    @page {
        size: A4 portrait;
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
        aspect-ratio: unset;
        border-radius: 0;

        --border-color: #525252;
        --row-color: #fff;
        --banded-row-color: #e4e4e4;
        --header-color: #525252;
        --color: #000;
        --inverse-color: #fff;
    }

    .custom-content:empty {
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
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12.5px;

    thead>tr {
        background-color: var(--header-color);
        color: var(--inverse-color);
        font-weight: bold;
    }

    tr,
    thead {
        font: inherit;
        height: 21.5px;
        min-height: 21.5px;
        max-height: 21.5px;
    }

    tr {
        font: inherit;
        background-color: var(--row-color);

        &:nth-child(even) {
            background-color: var(--banded-row-color);
        }

        &.targeting {
            background-color: #ffc52631;
        }
    }

    tr:first-of-type>td.special-cell {
        transform: translateY(-20%);
    }

    td {
        position: relative;
        padding: 2px 6px;

        &.special-cell {
            transform: translateY(-50%);
            text-align: end;
            padding-right: 14px;
            font-weight: normal;
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
