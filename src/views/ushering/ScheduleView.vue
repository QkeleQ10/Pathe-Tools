<script setup lang="ts">
import { ref, computed, useTemplateRef, nextTick } from 'vue'
import { useStorage, useDropZone } from '@vueuse/core'
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { Show, UsherShow } from '@/scripts/types.ts'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { useVueToPrint } from 'vue-to-print'
import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue'
import SchedulePage from '@features/ushering/schedule/SchedulePage.vue'
import UserGuide from '@/components/features/ushering/schedule/UserGuide.vue'
import Settings from '@/components/features/ushering/schedule/Settings.vue'
import ColsBuilder, { defaultColumns } from '@/components/features/ushering/schedule/ColsBuilder.vue'

const store = useTmsScheduleStore()
const stingers = useStorage<string[]>('credits-stingers', [])

const sortBy = useStorage<'scheduledTime' | 'creditsTime'>('schedule-sort-by', 'creditsTime');
const columns = useStorage<{ type: string; width: number }[]>('schedule-columns', defaultColumns);

const trueColours = ref(true);
const columnEditorOpen = ref(false);

const plfTimeBefore = useStorage('plf-time-before', 17) // usher-in will begin 17 minutes before start

const autoAdjustRowHeight = useStorage('schedule-row-height-auto-adjust', true);
const rowHeightMultiplier = useStorage('schedule-row-height-multiplier', 1);

const main = useTemplateRef('main')

const pages = computed<UsherShow[][]>(() => {
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
        } as UsherShow
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

    const ROW_HEIGHT = 21.5 * rowHeightMultiplier.value; // in px
    const PAGE_HEIGHT = 1030 - ROW_HEIGHT; // the page can fit 48 rows at the default height.
    const MAX_ROWS_PER_PAGE = Math.floor(PAGE_HEIGHT / ROW_HEIGHT); // calculate how many rows can fit on a page based on the current row height multiplier
    const overlap = 2

    const numPages = Math.ceil(transformed.length / MAX_ROWS_PER_PAGE)
    const pageSize = Math.ceil(transformed.length / numPages)

    if (autoAdjustRowHeight.value) {
        console.log(`Auto-adjusting row height: ${transformed.length} shows, ${pageSize} per page, ${numPages} pages.`)
        rowHeightMultiplier.value = Math.max(0.5, Math.min(1, Math.floor(((PAGE_HEIGHT / transformed.length) / 21.5) / 0.01) * 0.01))
    }

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
                <template v-if="columnEditorOpen">
                    <div id="cols-builder-wrapper">
                        <h3>Kolommen bewerken (bèta)</h3>
                        <Button class="tertiary" @click="columnEditorOpen = false">Stoppen met bewerken</Button>
                        <ColsBuilder style="min-width: 600px;" v-model="columns" />
                    </div>
                </template>

                <template v-if="pages?.[0]?.length">
                    <div id="pages" ref="pages" :class="{ gray: trueColours }">
                        <SchedulePage v-for="(page, i) in pages" :ref="el => schedulePageRefs[i] = el" :shows="page"
                            :metadata="store.metadata" :page-num="i" :num-pages="pages.length"
                            :row-height-multiplier="rowHeightMultiplier" :sort-by="sortBy" :columns="columns" />
                    </div>
                </template>
                <template v-else>
                    <h1>Tijdenlijstje</h1>
                    <p>Upload eerst een <b>TSV</b>-bestand uit RosettaBridge (optie <b>Dates - ISO</b>) door hem naar
                        deze pagina te slepen.</p>
                </template>

                <template v-if="columnEditorOpen">
                    <div id="rows-editor-wrapper">
                        <h3>Rijen</h3>
                        <input type="checkbox" id="autoAdjustRowHeight" v-model="autoAdjustRowHeight" /> auto
                        <input :disabled="autoAdjustRowHeight" type="range" min="0.5" max="1.5" step="0.01" orient="vertical"
                            v-model.number="rowHeightMultiplier" style="height: 200px; writing-mode: vertical-lr;" />
                    </div>
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
                        <Button class="primary full left" v-if="pages.length > 1" @click="handlePrint()"
                            style="flex: 2;">
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

                    <Button class="secondary full left" @click="columnEditorOpen = !columnEditorOpen">
                        <Icon>table_edit</Icon>
                        Kolom- & rij-indeling bewerken
                    </Button>

                    <Settings @open-column-editor="columnEditorOpen = true" />

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
                    <!-- <InputSwitch v-model="trueColours" identifier="trueColours">Ware kleuren</InputSwitch> -->
                </div>
            </SidePanel>

        </div>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </div>
</template>

<style scoped>
#pages {
    width: min-content;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: -16px;

    .page {
        margin-bottom: 16px;
    }
}

@media print {
    #pages {
        display: block;

        .page {
            margin: 0;
        }
    }
}

#cols-builder-wrapper {
    width: 210mm;
    padding: 16px 1.35cm;
    margin-bottom: 16px;
    margin-left: auto;
    margin-right: auto;

    background-color: #11131677;
    border: 1px solid #ffffff14;
    border-radius: 5px;
}

#rows-editor-wrapper {
    position: absolute;
    display: flex;
    flex-direction: column;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    padding: 8px;
    background-color: #11131677;
    border: 1px solid #ffffff14;
    border-radius: 5px;
}
</style>
