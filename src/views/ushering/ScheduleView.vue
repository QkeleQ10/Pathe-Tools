<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStorage, useDropZone } from '@vueuse/core'
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { useCreditsStingersStore } from '@/stores/creditsStingers'
import { Show, TimetableShow } from '@/classes/classes'

const store = useTmsScheduleStore()
const stingersStore = useCreditsStingersStore()

const trueColours = useStorage('true-colours', false);

const displayScheduledTime = useStorage('display-scheduled-time', true);
const displayMainShowTime = useStorage('display-main-show-time', false);
const displayIntermissionTime = useStorage('display-intermission-time', true);
const displayCreditsTime = useStorage('display-credits-time', true);
const displayEndTime = useStorage('display-end-time', false);
const displayNextStartTime = useStorage('display-next-start-time', false);

const splitExtra = ref(true);
const displayPreshowDuration = useStorage('show-preshow-duration', 1) // 0 = never, 1 = only for 4DX, 2 = always
const displayCreditsDuration = useStorage('show-credits-duration', 1) // 0 = never, 1 = only for post-credits, 2 = always
const plfTimeBefore = useStorage('plf-time-before', 17) // usher-in will begin 17 minutes before start
const shortGapInterval = useStorage('short-gap-interval', 10) // double usher-out if the difference is less than 10 minutes
const longGapInterval = useStorage('long-gap-interval', 35) // long gap if the difference is greater than 30 minutes

const main = ref<HTMLElement>(null)

function transformTable() {
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
}

const pages = ref<TimetableShow[][]>([]);

const shows1 = ref<TimetableShow[]>([]);
const shows2 = ref<TimetableShow[]>([]);

// Array to hold refs to SchedulePage components
const schedulePageRefs = ref<any[]>([]);

store.$subscribe(() => {
    const transformed = transformTable();
    // Split the transformed shows into two pages for display
    const MAX_PAGE_SIZE = 46
    const overlap = 2

    const numPages = Math.ceil(transformed.length / MAX_PAGE_SIZE)
    const pageSize = Math.ceil(transformed.length / numPages)

    // Each page includes a small overlap with the previous/next page for context
    pages.value = Array.from({ length: numPages }, (_, i) => {
        const start = Math.max(0, i * pageSize - overlap)
        const end = Math.min((i + 1) * pageSize + overlap, transformed.length)
        return transformed.slice(start, end)
    })
});

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
        <section id="edit" :class="{ gray: trueColours }">
            <div class="section-content flex" style="flex-wrap: wrap-reverse;">
                <div style="flex-basis: 210mm;">
                    <div class="flex" style="justify-content: space-between; align-items: center; padding-right: 16px;">
                        <h2>Tijdenlijstje bewerken</h2>
                        <InputSwitch v-model="trueColours" identifier="trueColours">Ware kleuren</InputSwitch>
                    </div>
                    <p id="upload-hint" v-if="!pages?.[0]?.length">Upload eerst een bestand.</p>
                    <div id="pages">
                        <SchedulePage v-for="(page, i) in pages" :ref="el => schedulePageRefs[i] = el" :shows="page"
                            :metadata="store.metadata" :page-num="i" :num-pages="pages.length" />
                    </div>
                </div>
                <SidePanel style="flex-basis: 300px;">
                    <h2>Opties</h2>
                    <fieldset>
                        <legend>Kolommen</legend>
                        <div>
                            <div class="label">Weergeven indien beschikbaar</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                                <InputCheckbox class="enclose-box" identifier="displayScheduledTime"
                                    v-model="displayScheduledTime">Inloop
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
                                    v-model="displayNextStartTime">Volgende inloop
                                </InputCheckbox>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>Uitloop</legend>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <InputGroup type="number" id="shortGapInterval" v-model.number="shortGapInterval" min="0"
                                max="20">
                                <template #label>Dubbele uitloop tot</template>
                                <span class="unit">minuten</span>
                            </InputGroup>
                            <InputGroup type="number" id="longGapInterval" v-model.number="longGapInterval" min="20"
                                max="80">
                                <template #label>Gat tussen uitlopen vanaf</template>
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
                    <fieldset v-show="!(shows1.length > 0 && !shows1.some(row => row.auditorium?.includes('4DX')))">
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
                        style="display: flex; gap: 16px; justify-content: stretch; margin-top: auto; position: sticky; bottom: 0; padding: 16px;">
                        <Button v-for="(page, i) in pages" :key="i" @click="schedulePageRefs[i]?.handlePrint()"
                            class="primary full">
                            <Icon>print</Icon>
                            {{ pages.length > 1
                                ? 'Deel ' + (i + 1) + ' afdrukken'
                                : 'Afdrukken' }}
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
            <h3>Films met post-credits-scènes</h3>
            <ul v-if="stingersStore.stingers.length > 0" class="scrollable-list">
                <li v-for="stinger in stingersStore.stingers" :key="stinger" style="display: flex;
                    justify-content: space-between; align-items: center;">
                    <span>{{ stinger }}</span>
                    <Icon @click="removeStinger(stinger)" class="delete" title="Verwijderen">
                        close
                    </Icon>
                </li>
            </ul>
            <div v-else style="text-align: center; padding: 32px; opacity: 0.5;">
                Geen films in database
            </div>
            <div style="display: flex; gap: 8px; margin-top: 16px;">
                <Button @click="stingersStore.getStingers()">
                    <Icon>refresh</Icon>
                    Vernieuwen
                </Button>
                <Button @click="addStinger">
                    <Icon>add</Icon>
                    Toevoegen
                </Button>
            </div>
        </ModalDialog>
    </main>
</template>

<style scoped>
#pages {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
</style>
