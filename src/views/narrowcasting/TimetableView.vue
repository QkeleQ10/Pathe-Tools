<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useDropZone } from '@vueuse/core';
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue';
import CinemecTimetableSection from '@features/sections/CinemecTimetableSection.vue';

const store = useTmsScheduleStore();

const { isOverDropZone } = useDropZone(useTemplateRef('main'), {
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
});
</script>

<template>
    <main ref="main">
        <TimetableUploadSection />

        <CinemecTimetableSection />

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </main>
</template>

<style scoped>
</style>
