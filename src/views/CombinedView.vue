<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useDropZone } from '@vueuse/core';
import { useTmsScheduleStore } from '@/stores/tmsSchedule.ts';

import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue';
import Timetable from '@/components/features/narrowcasting/timetable/Timetable.vue';
import Announcer from '@/components/features/ushering/announcer/Announcer.vue';

const store = useTmsScheduleStore();

const { isOverDropZone } = useDropZone(useTemplateRef('main'), {
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
});
</script>

<template>
    <div ref="main" class="content">
        <div class="layout">


            <Timetable />
            <Announcer />

            <main style="display: grid; grid-template-columns: auto 1fr; gap: 32px;">
                <div id="timetable-main-tp-target"></div>
                <div id="announcer-main-tp-target"></div>
            </main>

            <SidePanel>
                <div class="flex" style="flex-direction: column;">

                    <TimetableUploadSection />

                    timetable
                    <div id="timetable-settings-tp-target"></div>

                    omroepen
                    <div id="announcer-settings-tp-target"></div>

                </div>

                <div class="spacer"></div>

                <div class="flex" style="flex-direction: column;">
                    <span>Het voorbeeld is slechts indicatief.</span>
                </div>
            </SidePanel>

        </div>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </div>
</template>
