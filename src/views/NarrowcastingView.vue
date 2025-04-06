<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDropZone, useUrlSearchParams } from '@vueuse/core';
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { Show } from '@/classes/classes';
import { format } from 'date-fns';

const store = useTmsScheduleStore();

const params = useUrlSearchParams('history');

declare global {
    interface Window {
        datadump: any;
        narrowcastXml: string;
    }
};

store.$subscribe(() => {
    const oldTable = window.datadump;
    const oldNarrowcastXml = window.narrowcastXml;

    window.datadump = store.table;
    window.narrowcastXml = narrowcastXml.value;

    if (!params.download || !store.table?.length || narrowcastXml.value.length < 10 || oldNarrowcastXml === window.narrowcastXml) return;

    const blob = new Blob([narrowcastXml.value], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'timetable.xml';
    link.click();
    URL.revokeObjectURL(link.href);
});

const narrowcastXml = computed(() => {
    const indent = (level: number) => '  '.repeat(level);
    const xmlContent = store.table.map((show, index) => {
        const xml = showToXml(show, index);
        return xml.split('><').join(`>\n${indent(2)}<`);
    }).join(`\n${indent(1)}`);
    return `<voorstellingen>\n${indent(1)}${xmlContent}\n</voorstellingen>`;
});

function showToXml(show: Show, index: number) {
    return `<Shows><ID type="Long Integer">${index}</ID><DatumVan type="Date/Time">${format(show.scheduledTime, 'dd-MM-yyyy')}</DatumVan><DatumTot type="Date/Time">${format(show.scheduledTime.getTime() + 86400000, 'dd-MM-yyyy')}</DatumTot><Tijd type="Date/Time">${format(show.scheduledTime, 'HH:mm')}</Tijd><Titel type="Text">${show.playlist}</Titel><Zaal type="Text">${show.auditoriumNumber}</Zaal><Kleur type="Long Integer">4</Kleur><Permanent type="Long Integer">1</Permanent></Shows>`;
}

const main = ref<HTMLElement>(null);
const { isOverDropZone } = useDropZone(main, {
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
});
</script>

<template>
    <main ref="main">
        <HeroImage />
        <TimetableUploadSection />
        <section>
            <div class="flex" style="flex-wrap: wrap-reverse;">
                <div style="flex: 100% 1 1;">
                    <h2 style="margin-bottom: 0;">Datadump</h2>
                    <small>{{ store.table.length }} voorstellingen</small>
                    <p>Aangeboden als array in publieke variabele <code>datadump</code> en als pseudo-xml-string in
                        publieke variabele <code>narrowcastXml</code>.
                    </p>
                    <Tabs>
                        <Tab value="JSON">
                            <div class="block">
                                <code>{{ JSON.stringify(store.table, null, 2) }}</code>
                            </div>
                        </Tab>
                        <Tab value="XML">
                            <div class="block">
                                <code>{{ narrowcastXml }}</code>
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </section>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </main>
</template>

<style scoped>
code {
    white-space: pre;
}
</style>
