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

const displayScheduledTime = useStorage('display-scheduled-time', true);
const displayMainShowTime = useStorage('display-main-show-time', false);
const displayIntermissionTime = useStorage('display-intermission-time', true);
const displayCreditsTime = useStorage('display-credits-time', true);
const displayEndTime = useStorage('display-end-time', false);
const displayNextStartTime = useStorage('display-next-start-time', false);

const splitExtra = ref(true);
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

const transformedTable = computed(() => {
    const plfRows = store.table?.filter(row => row.auditorium?.includes('4DX')) || []
    let arr = store.table?.map((show: Show, i: number) => {
        const hasCreditsStinger = stingersStore.stingers.includes(show.title?.trim())
        const overlapWithPlf = plfRows.some(plf =>
            show.creditsTime.getTime() - plf.scheduledTime.getTime() >= plfTimeBefore.value * -60000 &&
            show.creditsTime.getTime() - (plf.mainShowTime?.getTime() ?? (plf.showTime.getTime() + 900000)) <= 0
        )
        const nextShow = store.table.slice(i + 1).find(s => s.auditorium === show.auditorium)
        return {
            ...show,
            overlapWithPlf,
            hasCreditsStinger,
            timeToNextUsherout: store.table[i + 1]
                ? store.table[i + 1].creditsTime.getTime() - (hasCreditsStinger ? show.endTime : show.creditsTime).getTime()
                : undefined,
            nextStartTime: nextShow?.scheduledTime
        } as TimetableShow
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
        await stingersStore.addStinger(prompt("Titel film invoeren:"))
    } catch (error) {
        console.error('Failed to add stinger:', error)
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
                    <div id="print-component-wrapper" v-if="transformedTable.length > 0">
                        <div id="print-component" ref="printComponent" class="">
                            <div class="header" v-if="'flags' in store.metadata">
                                {{ store.metadata.flags.includes('times-only') ? 'Datum onbekend' :
                                    format(transformedTable[0]?.scheduledTime || 0, 'PPPP', { locale: nl }) }}
                            </div>
                            <table class="timetable" spellcheck="false">
                                <colgroup>
                                    <col span="1" style="width: 6%;" />
                                    <col span="1" style="width: 9%;" />
                                    <col span="1" style="width: 6%;" />
                                    <col span="1" style="width: 6%;" />
                                    <col span="1" style="width: 13%;" />
                                    <col span="1" style="width: 6%;" />
                                    <col span="1" style="width: 4%;" />
                                    <col span="1" style="width: 49%;" />
                                    <col span="1" style="width: 2%;" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <td nowrap class="td-auditorium">Zaal</td>
                                        <td nowrap class="td-scheduled">
                                            {{ displayScheduledTime ? "Inloop" : '' }}
                                        </td>
                                        <td nowrap class="td-main">
                                            {{displayMainShowTime && store.table.some(show => show.mainShowTime)
                                                ? "Start" : ''}}
                                        </td>
                                        <td nowrap class="td-intermission">
                                            {{displayIntermissionTime && store.table.some(show => show.intermissionTime)
                                                ? "Pauze" : ''}}
                                        </td>
                                        <td nowrap class="td-credits">
                                            {{ displayCreditsTime ? "Aftiteling" : '' }}
                                        </td>
                                        <td nowrap class="td-end">
                                            {{ displayEndTime ? "Eind" : '' }}
                                        </td>
                                        <td nowrap class="td-next">
                                            {{ displayNextStartTime ? "Volg." : '' }}
                                        </td>
                                        <td nowrap class="td-title">Film</td>
                                        <td nowrap class="td-age"></td>
                                    </tr>
                                </thead>
                                <ScheduleTableRow v-for="(show, i) in transformedTable" :key="i" :show="show" />
                            </table>
                            <br>
                            <span contenteditable class="custom-content"></span>
                            <div class="footer">
                                <span v-if="'lastModified' in store.metadata">
                                    Gegevens: {{ new Date(store.metadata.lastModified).toLocaleString('nl-NL', {
                                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit',
                                        minute: '2-digit'
                                    }) }} •
                                </span>
                                Gegenereerd: {{ new Date().toLocaleDateString('nl-NL', {
                                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit',
                                    minute:
                                        '2-digit'
                                }) }}
                                • Pathé Tools • Quinten Althues
                            </div>
                        </div>
                    </div>
                    <p id="upload-hint" v-else>Upload eerst een bestand.</p>
                </div>
                <SidePanel style="flex-basis: 355px;">
                    <h2>Opties</h2>
                    <fieldset>
                        <legend>Kolommen</legend>
                        <div>
                            <div class="label">Weergeven indien beschikbaar</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                                <InputCheckbox class="enclose-box" identifier="displayScheduledTime"
                                    v-model="displayScheduledTime">Aanvang
                                </InputCheckbox>
                                <InputCheckbox class="enclose-box" identifier="displayMainShowTime"
                                    v-model="displayMainShowTime">Start hoofdfilm
                                </InputCheckbox>
                                <InputCheckbox class="enclose-box" identifier="displayIntermissionTime"
                                    v-model="displayIntermissionTime">Pauze
                                </InputCheckbox>
                                <InputCheckbox class="enclose-box" identifier="displayCreditsTime"
                                    v-model="displayCreditsTime">Aftiteling
                                </InputCheckbox>
                                <InputCheckbox class="enclose-box" identifier="displayEndTime" v-model="displayEndTime">
                                    Einde voorstelling
                                </InputCheckbox>
                                <InputCheckbox class="enclose-box" identifier="displayNextStartTime"
                                    v-model="displayNextStartTime">Aanvang volgende voorstelling
                                </InputCheckbox>
                            </div>
                        </div>
                    </fieldset>
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
                            <InputGroup type="number" id="longGapInterval" v-model.number="longGapInterval" min="20"
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
                            Als een voorstelling een post-credits-scène heeft, dan wordt de tijd 'Einde voorstelling'
                            gebruikt
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
#print-component-wrapper {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;

    overflow: auto;
    border-radius: 5px;
    background-color: #ffffff14;
    padding: 16px 4px;
}

#print-component {
    position: relative;

    width: calc(210mm + 16px);
    height: calc(297mm + 16px);
    padding: 16px;

    --border-color: #ffffff3d;
    --row-color: transparent;
    --banded-row-color: #ffffff14;
    --header-color: #ffffff96;
    --color: #fff;
    --inverse-color: #000;

    &.print {
        --border-color: #525252;
        --row-color: #fff;
        --banded-row-color: #e4e4e4;
        --header-color: #525252;
        --color: #000;
        --inverse-color: #fff;
    }
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
}

div.header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    color: var(--color);
    opacity: 0.5;
    font-size: 10px;
    text-align: center;

    &::first-letter {
        text-transform: uppercase;
    }
}

div.footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    color: var(--color);
    opacity: 0.1;
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
    width: 100%;
    border: 1px solid var(--border-color);
    border-collapse: collapse;
    color: var(--color);
    font-family: Arial, Helvetica, sans-serif;
    --row-height: 21.5px;
    font-size: 12.5px;

    thead>tr {
        background-color: var(--header-color);
        color: var(--inverse-color);
        font-weight: bold;
    }

    tr,
    thead {
        font: inherit;
        height: var(--row-height);
    }

    td {
        position: relative;
        padding: 2px 6px;
    }

    .td-credits {
        padding-left: 32px;
    }
}
</style>
