<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useStorage, useDropZone } from '@vueuse/core'
import { useVueToPrint } from "vue-to-print"
import { format } from 'date-fns'
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { useCreditsStingersStore } from '@/stores/creditsStingers'
import { Show, TimetableShow } from '@/classes/classes'
import { nl } from 'date-fns/locale'

const store = useTmsScheduleStore()
const stingersStore = useCreditsStingersStore()

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
const displayPreshowDuration = useStorage('show-preshow-duration', 1) // 0 = never, 1 = only for 4DX, 2 = always
const displayCreditsDuration = useStorage('show-credits-duration', 1) // 0 = never, 1 = only for post-credits, 2 = always
const optionalColumnsSetting = useStorage('optional-columns', {
    mainTime: false,
    endTime: false,
    nextStartTime: false
})
const plfTimeBefore = useStorage('plf-time-before', 17) // usher-in will begin 17 minutes before start
const shortGapInterval = useStorage('short-gap-interval', 10) // double usher-out if the difference is less than 10 minutes
const longGapInterval = useStorage('long-gap-interval', 35) // long gap if the difference is greater than 30 minutes

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
        timetableShow.overlapWithPlf = store.table.filter(show2 => show2.auditorium?.includes('4DX')).some(testRow =>
            timetableShow.creditsTime.getTime() - testRow.scheduledTime.getTime() >= plfTimeBefore.value * -60000 &&
            timetableShow.creditsTime.getTime() - (testRow.mainShowTime ? testRow.mainShowTime.getTime() : (testRow.showTime.getTime() + 900000)) <= 0
        )
        timetableShow.hasCreditsStinger = stingersStore.stingers.includes(timetableShow.title?.trim())
        timetableShow.timeToNextUsherout = store.table[i + 1]?.creditsTime.getTime() - (timetableShow.hasCreditsStinger ? timetableShow.endTime : timetableShow.creditsTime).getTime()
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

const showStingersModal = ref(false)

async function addStinger() {
    try {
        await stingersStore.addStinger(prompt())
    } catch (error) {
        console.error('Failed to add stinger:', error)
    }
}

async function toggleCreditsStinger(title: string) {
    const trimmedTitle = title?.trim()
    if (!trimmedTitle) return

    try {
        if (stingersStore.stingers.includes(trimmedTitle)) {
            await stingersStore.deleteStinger(trimmedTitle)
        } else {
            await stingersStore.addStinger(trimmedTitle)
        }
    } catch (error) {
        console.error('Failed to toggle post-credits:', error)
    }
}

async function removeStinger(title: string) {
    try {
        await stingersStore.deleteStinger(title)
    } catch (error) {
        console.error('Failed to remove stinger:', error)
    }
}

const { handlePrint } = useVueToPrint({
    content: () => printComponent.value,
    documentTitle: "Tijdenlijstje " + format(transformedTable.value[0]?.scheduledTime || new Date(), 'yyyy-MM-dd', { locale: nl }),
})

const { isOverDropZone } = useDropZone(main, {
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
})

onMounted(() => {
    stingersStore.getStingers()
})
</script>

<template>
    <main ref="main">
        <TimetableUploadSection />
        <section id="edit">
            <div class="flex" style="flex-wrap: wrap-reverse;">
                <div style="flex-basis: calc(210mm + 16px);">
                    <h2>Tijdenlijstje bewerken</h2>
                    <div id="print-component" ref="printComponent" v-if="transformedTable.length > 0">
                        <div class="header" v-if="'flags' in store.metadata">
                            {{ store.metadata.flags.includes('times-only') ? 'datum onbekend' :
                                format(transformedTable[0]?.scheduledTime || 0, 'PPPP', { locale: nl }) }}
                        </div>
                        <table class="timetable" spellcheck="false">
                            <colgroup>
                                <col span="1" style="width: 0;">
                                <col span="1" style="width: 25%;">
                                <col span="1" style="width: 0;" v-if="optionalColumnsSetting.mainTime">
                                <col span="1" style="width: 20%;">
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
                            <tr v-for="(show, i) in transformedTable"
                                :class="{ targeting: showMenu && targetI === i, italic: show.auditorium?.includes('4DX'), bold: show.featureRating === '16' || show.featureRating === '18' }"
                                @contextmenu.prevent="showContextMenu($event, show, i)">
                                <td nowrap contenteditable>
                                    {{ show.auditorium === 'Rooftop' ? 'RT' : show.auditorium.replace(/^\w+\s/, '') }}
                                </td>
                                <td nowrap contenteditable>
                                    {{ format(show.scheduledTime, 'HH:mm') }}
                                    <span class="preshow-duration"
                                        v-if="(show.scheduledTime && show.mainShowTime) && ((displayPreshowDuration === 1 && show.auditorium?.includes('4DX')) || displayPreshowDuration === 2)">
                                        +{{ Math.round((show.mainShowTime.getTime() - show.scheduledTime.getTime()) /
                                            60000) }}
                                    </span>
                                </td>
                                <td nowrap contenteditable v-if="optionalColumnsSetting.mainTime" class="translucent">
                                    {{ format(show.mainShowTime || show.intermissionTime || 0, 'HH:mm:ss') }}
                                </td>
                                <td nowrap>
                                    <Icon4dx class="plf-icon" src="@/assets/symbols/icon-4dx.svg"
                                        v-if="show.isNearPlf" />
                                    <div class="double-usherout"
                                        v-if="show.timeToNextUsherout <= shortGapInterval * 60000">
                                    </div>
                                    <div class="long-gap"
                                        v-if="show.timeToNextUsherout >= longGapInterval * 60000 && longGapInterval > 0">
                                    </div>
                                    <div class="plf-overlap" v-if="show.overlapWithPlf"></div>
                                    <span contenteditable class="credits-time">
                                        {{ format(show.creditsTime, 'HH:mm:ss') }}
                                        <span class="credits-duration"
                                            v-if="(show.creditsTime && show.endTime) && ((displayCreditsDuration === 1 && show.hasCreditsStinger) || displayCreditsDuration === 2)">
                                            +{{ Math.round((show.endTime.getTime() - show.creditsTime.getTime()) /
                                                60000) }}
                                        </span>
                                    </span>
                                </td>
                                <td nowrap contenteditable v-if="optionalColumnsSetting.endTime" class="translucent">
                                    {{ format(show.endTime, 'HH:mm:ss') }}
                                </td>
                                <td nowrap contenteditable v-if="optionalColumnsSetting.nextStartTime"
                                    class="translucent" style="font-weight: normal; font-style: normal;">
                                    {{ show.nextStartTime ? format(show.nextStartTime, 'HH:mm') : '-' }}
                                </td>
                                <td nowrap contenteditable v-if="splitExtra">
                                    <span>{{ show.title }}</span>
                                    <span style="float: right">{{ show.extras.join(' ') }}</span>
                                </td>
                                <td nowrap contenteditable v-else>
                                    {{ show.playlist }}
                                </td>
                                <td nowrap contenteditable class="age-rating"
                                    :class="{ translucent: ['AL', '6', '9', '12', '14'].includes(show.featureRating) }">
                                    {{ show.featureRating }}
                                    <!-- <IconNicamAL class="nicam-icon" v-if="show.featureRating === 'AL'" />
                                    <IconNicam6 class="nicam-icon" v-else-if="show.featureRating === '6'" />
                                    <IconNicam9 class="nicam-icon" v-else-if="show.featureRating === '9'" />
                                    <IconNicam12 class="nicam-icon" v-else-if="show.featureRating === '12'" />
                                    <IconNicam14 class="nicam-icon" v-else-if="show.featureRating === '14'" />
                                    <IconNicam16 class="nicam-icon" v-else-if="show.featureRating === '16'" />
                                    <IconNicam18 class="nicam-icon" v-else-if="show.featureRating === '18'" />
                                    <span v-else>{{ show.featureRating }}</span> -->
                                </td>
                            </tr>
                        </table>
                        <br>
                        <span class="custom-content" contenteditable></span>
                        <div class="footer">
                            <span v-if="'lastModified' in store.metadata">
                                Gegevens: {{ new Date(store.metadata.lastModified).toLocaleString('nl-NL', {
                                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit',
                                    minute: '2-digit'
                                }) }} •
                            </span>
                            Gegenereerd: {{ new Date().toLocaleDateString('nl-NL', {
                                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:
                                    '2-digit'
                            }) }}
                            • Pathé Tools • Quinten Althues
                        </div>
                    </div>
                    <p id="upload-hint" v-else>Upload eerst een bestand.</p>
                </div>
                <SidePanel style="flex-basis: 355px;">
                    <h2>Opties</h2>
                    <fieldset
                        v-show="!(transformedTable.length > 0 && !transformedTable.some(row => row.auditorium?.includes('4DX')))">
                        <legend>4DX-inloop</legend>
                        <InputGroup type="number" id="plfTimeBefore" v-model.number="plfTimeBefore" min="0" max="30">
                            <template #label>Tijd voor aanvang</template>
                            <span class="unit">minuten</span>
                        </InputGroup>
                        <small v-if="plfTimeBefore > 0">
                            Uitlopen tijdens de 4DX-inloop worden gemarkeerd met een
                            streeplijntje. De 4DX-inloop begint {{ plfTimeBefore }} minuten
                            voor de aanvangstijd en eindigt wanneer de hoofdfilm begint.
                        </small>
                    </fieldset>
                    <fieldset>
                        <legend>Uitloop</legend>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <InputGroup type="number" id="shortGapInterval" v-model.number="shortGapInterval" min="0"
                                max="20">
                                <template #label>Interval voor dubbele uitloop</template>
                                <span class="unit">minuten</span>
                            </InputGroup>
                            <InputGroup type="number" id="shortGapInterval" v-model.number="longGapInterval" min="20"
                                max="80">
                                <template #label>Interval voor gat tussen uitlopen</template>
                                <span class="unit">minuten</span>
                            </InputGroup>
                        </div>
                        <small>
                            <span v-if="shortGapInterval > 0">
                                Uitlopen met minder dan {{ shortGapInterval }} minuten ertussen krijgen een
                                boogje.
                            </span>
                            <span v-else>
                                Uitlopen met weinig tijd ertussen worden niet gemarkeerd.
                            </span>
                            <span v-if="longGapInterval > 0">
                                Gaten van meer dan {{ longGapInterval }} minuten krijgen een stippellijntje.
                            </span>
                            <span v-else>
                                Uitlopen met veel tijd ertussen worden niet gemarkeerd.
                            </span>
                            <br>
                            Als een voorstelling een post-credits-scène heeft, dan wordt de tijd 'Einde voorstelling' gebruikt
                            voor het berekenen van de tijd tot de volgende uitloop.
                        </small>
                    </fieldset>
                    <fieldset>
                        <legend>Overig</legend>
                        <InputSwitch v-model="splitExtra" identifier="splitExtra">
                            Extra informatie scheiden van filmtitel
                        </InputSwitch>
                            <InputGroup type="select" id="displayCreditsDuration" v-model="displayCreditsDuration">
                                <template #label>Tijd tussen aftiteling en einde voorstelling tonen</template>
                                <template #input>
                                    <option :value="0">Nooit tonen</option>
                                    <option :value="1">Alleen bij post-credits-scènes</option>
                                    <option :value="2">Altijd tonen</option>
                                </template>
                            </InputGroup>
                            <InputGroup type="select" id="displayPreshowDuration" v-model="displayPreshowDuration">
                                <template #label>Tijd tussen inloop en start hoofdfilm tonen</template>
                                <template #input>
                                    <option :value="0">Nooit tonen</option>
                                    <option :value="1">Alleen bij 4DX-inloop</option>
                                    <option :value="2">Altijd tonen</option>
                                </template>
                            </InputGroup>
                    </fieldset>
                    <fieldset>
                        <legend>Extra kolommen</legend>
                        <InputCheckbox v-for="(value, colId) in optionalColumns" v-model="optionalColumnsSetting[colId]"
                            :identifier="String(colId)">
                            {{ columns[colId].title }}
                        </InputCheckbox>
                    </fieldset>

                    <div class="buttons"
                        style="display: flex; flex-direction: column; gap: 16px; align-items: stretch; margin-top: auto; position: sticky; bottom: 0; padding: 16px;">
                        <Button class="primary full" @click="handlePrint" v-if="transformedTable.length > 0">
                            <Icon>print</Icon>
                            Afdrukken
                        </Button>
                    </div>
                </SidePanel>
            </div>
        </section>
        <Transition>
            <ContextMenu v-if="showMenu" class="dark" :x="menuX" :y="menuY" @click-outside="closeContextMenu">
                <button @click="toggleCreditsStinger(targetRow.title); closeContextMenu()">
                    <div class="check" :class="{ 'empty': !stingersStore.stingers.includes(targetRow.title?.trim()) }">
                    </div>
                    Post-credits-scène bij {{ targetRow.title }}
                </button>
            </ContextMenu>
        </Transition>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>

        <Button class="secondary" @click="showStingersModal = true" style="opacity: .05;">
            <Icon>movie</Icon>
            Post-credits-scènes
        </Button>
        <ModalDialog v-if="showStingersModal" @dismiss="showStingersModal = false">
            <div>
                <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                    <Button @click="stingersStore.getStingers()">
                        <Icon>refresh</Icon>
                        Vernieuwen
                    </Button>
                    <Button @click="addStinger">
                        <Icon>add</Icon>
                        Toevoegen
                    </Button>
                </div>

                <div v-if="stingersStore.stingers.length > 0"
                    style="max-height: 300px; overflow-y: auto; border: 1px solid #ffffff14; border-radius: 4px;">
                    <div v-for="stinger in stingersStore.stingers" :key="stinger"
                        style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid #ffffff14;">
                        <span>{{ stinger }}</span>
                        <button @click="removeStinger(stinger)"
                            style="background: none; border: none; color: #ff6b6b; cursor: pointer; padding: 4px 8px; border-radius: 4px;"
                            title="Verwijderen">
                            <Icon>close</Icon>
                        </button>
                    </div>
                </div>
                <div v-else style="text-align: center; padding: 32px; opacity: 0.5;">
                    Geen films in database
                </div>
            </div>
        </ModalDialog>
    </main>
</template>

<style scoped>
#print-component {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    width: calc(210mm + 16px);
    height: calc(297mm + 16px);
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

div.header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    color: var(--color);
    opacity: 0.5;
    display: none;
    font-size: 10px;
    text-align: center;
}

div.footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    color: var(--color);
    opacity: 0.08;
    display: none;
    font-size: 10px;
    text-align: center;
}

@media print {
    @page {
        size: A4 portrait;
        margin: 1.35cm;
        margin-top: 0.8cm;
        margin-bottom: 0.8cm;
        /* padding: 0.15cm */
    }

    #print-component {
        display: block;
        position: unset;
        width: auto;
        height: auto;
        box-sizing: border-box;
        padding: 0;
        margin-top: 16px;
        margin-top: 16px;
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

    div.header,
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

        &.italic {
            font-style: italic;
        }

        &.bold {
            font-weight: bold;
        }
    }

    tr:first-of-type>td .plf-icon {
        transform: translateY(50%);
    }

    td {
        position: relative;
        padding: 2px 6px;

        .plf-icon {
            position: absolute;
            top: 0;
            left: -45px;
            height: 12px;
            translate: 0 -50%;
            fill: var(--color);
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

        .credits-duration,
        .preshow-duration {
            opacity: .35;
            font-weight: normal;
            font-style: normal;
            margin-left: 4px;
        }

        &.age-rating {
            text-align: end;
            min-width: 21px;
        }

        .nicam-icon {
            fill: var(--color);
            position: absolute;
            top: 50%;
            left: 50%;
            translate: -50% -50%;
            width: 16px;
            height: 16px;
        }
    }
}
</style>
