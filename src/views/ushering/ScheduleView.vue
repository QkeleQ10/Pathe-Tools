<script setup lang="ts">
import { ref, computed, useTemplateRef, nextTick } from 'vue'
import { useStorage, useDropZone } from '@vueuse/core'
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { Show, TimetableShow } from '@/scripts/types.ts'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { useVueToPrint } from 'vue-to-print'
import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue'
import SchedulePage from '@features/ushering/schedule/SchedulePage.vue'
import UserGuide from '@/components/features/ushering/schedule/UserGuide.vue'
import ColsBuilder, { defaultColumns } from '@/components/features/ushering/schedule/ColsBuilder.vue'
import Settings from '@/components/features/ushering/schedule/Settings.vue'

const store = useTmsScheduleStore()
const stingers = useStorage<string[]>('credits-stingers', [])

const sortBy = useStorage<'scheduledTime' | 'creditsTime'>('schedule-sort-by', 'creditsTime');
const trueColours = useStorage('true-colours', false);

const columns = useStorage<{ type: string; width: number }[]>('schedule-columns', defaultColumns);

const displayPreshowDuration = useStorage('show-preshow-duration', 1) // 0 = never, 1 = only for 4DX, 2 = always
const displayCreditsDuration = useStorage('show-credits-duration', 1) // 0 = never, 1 = only for post-credits, 2 = always
const plfTimeBefore = useStorage('plf-time-before', 17) // usher-in will begin 17 minutes before start
const shortGapInterval = useStorage('short-gap-interval', 10) // double usher-out if the difference is less than 10 minutes
const longGapInterval = useStorage('long-gap-interval', 35) // long gap if the difference is greater than 30 minutes

const fontSize = useStorage('schedule-font-size', 12.5) // font size in pixels

const intermissionDuration = useStorage('intermission-duration', 15) // duration of intermissions in minutes

const main = ref<HTMLElement>(null)

const pages = computed<TimetableShow[][]>(() => {
    const plfRows = store.table?.filter(row => row.auditorium?.includes('4DX')) || []
    let arr = store.table?.map((show: Show, i: number) => {
        const hasCreditsStinger = stingers.value.includes(show.title?.trim())
        const overlapWithPlf = plfRows.some(plf =>
            (show.creditsTime || show.endTime).getTime() - plf.scheduledTime.getTime() >= plfTimeBefore.value * -60000 &&
            (show.creditsTime || show.endTime).getTime() - (plf.mainShowTime?.getTime() ?? (plf.showTime.getTime() + 900000)) <= 0
        )
        const nextShow = store.table.slice(i + 1).find(s => s.auditorium === show.auditorium)
        return {
            ...show,
            overlapWithPlf,
            hasCreditsStinger,
            timeToNextUsherout: store.table[i + 1]
                ? (store.table[i + 1].creditsTime || store.table[i + 1].endTime).getTime() - (hasCreditsStinger ? show.endTime : (show.creditsTime || show.endTime)).getTime()
                : undefined,
            nextStartTime: nextShow?.scheduledTime
        } as TimetableShow
    }) || []

    arr.filter(testRow => testRow.auditorium?.includes('4DX')).forEach(plfRow => {
        let index: number = 0;
        for (let i = 0; i < arr.length; i++) {
            const row = arr[i]
            let difference = (row.creditsTime || row.endTime).getTime() - plfRow.scheduledTime.getTime()
            if (difference > 0) {
                index = i
                break
            }
        }
        arr[Math.max(index, 0)].isNearPlf = true
    })

    const transformed = arr || [];
    // Split the transformed shows into two pages for display
    const MAX_PAGE_SIZE = -(14 / 3) * fontSize.value + 105
    const overlap = 2

    const numPages = Math.ceil(transformed.length / MAX_PAGE_SIZE)
    const pageSize = Math.ceil(transformed.length / numPages)

    // Each page includes a small overlap with the previous/next page for context
    return Array.from({ length: numPages }, (_, i) => {
        const start = Math.max(0, i * pageSize - overlap)
        const end = Math.min((i + 1) * pageSize + overlap, transformed.length)
        return transformed.slice(start, end)
    })
});

// Array to hold refs to SchedulePage components
const schedulePageRefs = ref<any[]>([]);

const { handlePrint } = useVueToPrint({
    content: useTemplateRef('pages'),
    documentTitle:
        "Tijdenlijstje "
        + format(pages.value?.[0]?.[0]?.scheduledTime || new Date(), 'yyyy-MM-dd', { locale: nl })
        + (pages.value.length > 1 ? ` (${pages.value.length} delen)` : ''),
})

const { isOverDropZone } = useDropZone(main, {
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
})
</script>

<template>
    <div ref="main" class="content">
        <div class="layout">
            <main>
                <template v-if="pages?.[0]?.length">
                    <div id="pages" ref="pages" :class="{ gray: trueColours }">
                        <SchedulePage v-for="(page, i) in pages" :ref="el => schedulePageRefs[i] = el" :shows="page"
                            :metadata="store.metadata" :page-num="i" :num-pages="pages.length" :fontSize="fontSize"
                            :sortBy="sortBy" />
                    </div>
                </template>
                <template v-else>
                    <h1>Tijdenlijstje</h1>
                    <p>Upload eerst een <b>TSV</b>-bestand uit RosettaBridge (optie <b>Dates - ISO</b>) door hem naar deze pagina te slepen.</p>
                </template>
            </main>

            <SidePanel>
                <div class="flex" style="flex-direction: column;">
                    <TimetableUploadSection />

                    <template v-if="pages.length === 1">
                        <Button class="primary full left" style="flex: 2;"
                            @click="sortBy = 'creditsTime'; nextTick(() => schedulePageRefs[0]?.handlePrint())">
                            <Icon>print</Icon>
                            Uitlopenlijst afdrukken
                        </Button>
                        <Button class="secondary full left" style="flex: 1;"
                            @click="sortBy = 'scheduledTime'; nextTick(() => schedulePageRefs[0]?.handlePrint())">
                            <Icon>print</Icon>
                            Inlopenlijst afdrukken
                        </Button>
                    </template>

                    <template v-else>
                        <Button class="primary full left" v-if="pages.length > 1" @click="handlePrint()" style="flex: 2;">
                            <Icon>print</Icon>
                            Alles afdrukken
                        </Button>
                        <Button class="secondary full left" v-for="(page, i) in pages" :key="i"
                            @click="schedulePageRefs[i]?.handlePrint()" style="flex: 1;">
                            <Icon>print</Icon>
                            {{ pages.length > 1
                                ? 'Deel ' + (i + 1) + ' afdrukken'
                                : 'Afdrukken' }}
                        </Button>
                    </template>

                    <Settings />

                    <InvokableModalDialog>
                        <template #button-content>
                            <Icon>help</Icon> Handleiding
                        </template>
                        <template #dialog-content>
                            <UserGuide />
                        </template>
                    </InvokableModalDialog>
                </div>

                <div class="spacer"></div>

                <div class="flex" style="flex-direction: column;">
                    <span>Klik op tekst in het voorbeeld om te bewerken.</span>
                    <InputSwitch v-model="trueColours" identifier="trueColours">Ware kleuren</InputSwitch>
                </div>

            </SidePanel>
        </div>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </div>
</template>

<style scoped>
.layout {
    display: grid;
    grid-template-columns: 1fr clamp(300px, 25vw, 500px);
    grid-template-rows: 1fr;
    height: 100%;
    gap: 32px;
    overflow-y: hidden;

    main {
        position: relative;
        padding: 32px 32px;
        overflow-y: auto;
    }

    aside {
        display: grid;
        grid-template-rows: auto 1fr auto;

        padding: 32px 32px;
        border-left: 1px solid #fff3;
        box-shadow: 0 2px 4px 0 #0008;
    }
}

.float {
    position: absolute;
    top: 32px;

    &.left {
        left: 32px;
        right: auto;
    }

    &.right {
        right: 32px;
        left: auto;
    }
}

#pages {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 16px;

    @media print {
        display: block;
    }
}

#print-buttons {
    position: sticky;
    bottom: 0;
    backdrop-filter: blur(4px);
    padding: 8px;
    padding-top: 16px;
    margin: -8px;
    gap: 4px;
}
</style>
