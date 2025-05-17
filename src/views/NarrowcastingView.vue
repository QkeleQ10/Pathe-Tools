<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDropZone, useUrlSearchParams } from '@vueuse/core';
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { Show } from '@/classes/classes';
import { format } from 'date-fns';
import { useServerStore } from '@/stores/server';

const store = useTmsScheduleStore();
const serverStore = useServerStore();

const params = useUrlSearchParams('history');

const downloaded = ref(false);

store.$subscribe(() => {
    if (!params.download || !store.table?.length || narrowcastXml.value.length < 10 || downloaded.value) return;

    const blob = new Blob([narrowcastXml.value], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'timetable.xml';
    link.click();
    URL.revokeObjectURL(link.href);

    downloaded.value = true;
});

const narrowcastXml = computed(() => {
    const indent = (level: number) => '  '.repeat(level);
    const xmlContent = store.table
        .map((show, index) => showToXml(show, index).split('><').join(`>\n${indent(2)}<`))
        .join(`\n${indent(1)}`);
    return `<voorstellingen>\n${indent(1)}${xmlContent}\n</voorstellingen>`;
});

function showToXml(show: Show, index: number) {
    return `<Shows><ID type="Long Integer">${index}</ID><DatumVan type="Date/Time">${format(show.scheduledTime, 'dd-MM-yyyy')}</DatumVan><DatumTot type="Date/Time">${format(show.scheduledTime, 'dd-MM-yyyy')}</DatumTot><Tijd type="Date/Time">${format(show.scheduledTime, 'HH:mm')}</Tijd><Titel type="Text">${show.playlist}</Titel><Zaal type="Text">${show.auditoriumNumber}</Zaal><Kleur type="Long Integer">3</Kleur><Permanent type="Long Integer">1</Permanent></Shows>`;
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

        <CinemecTimetableSection />

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </main>
</template>

<style scoped>
</style>
