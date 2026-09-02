<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useDropZone, useStorage } from '@vueuse/core';
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

const showTimetable = useStorage('pwa-show-timetable', false);
const showAnnouncer = useStorage('pwa-show-announcer', true);
</script>

<template>
    <div ref="main" class="content">
        <div class="layout">

            <Timetable v-if="showTimetable" />
            <Announcer v-if="showAnnouncer" />

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

                    <Teleport to="#pwa-nav">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <InputCheckbox class="enclose-box" identifier="showTimetable" v-model="showTimetable">
                                Timetable
                            </InputCheckbox>
                            <InputCheckbox class="enclose-box" identifier="showAnnouncer" v-model="showAnnouncer">
                                Omroepen
                            </InputCheckbox>
                        </div>
                    </Teleport>

                </div>

                <div class="spacer"></div>

                <div class="flex" style="flex-direction: column;">
                    <span>tijdelijke pagina</span>
                </div>
            </SidePanel>

        </div>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </div>
</template>
