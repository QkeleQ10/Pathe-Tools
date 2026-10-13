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
        <div class="pwa-layout">

            <Timetable v-if="showTimetable" />
            <Announcer v-if="showAnnouncer" />

            <SidePanel>

                <div class="mini-aside">
                    <InputCheckbox class="enclose-box" identifier="showTimetable" v-model="showTimetable">
                        Timetable
                    </InputCheckbox>
                    <div id="timetable-settings-tp-target"></div>
                </div>

                <div class="mini-aside">
                    <InputCheckbox class="enclose-box" identifier="showAnnouncer" v-model="showAnnouncer">
                        Omroepen
                    </InputCheckbox>
                    <div id="announcer-settings-tp-target"></div>
                </div>

                <TimetableUploadSection />

            </SidePanel>

            <main>
                <div id="timetable-main-tp-target"></div>
                <div id="announcer-main-tp-target"></div>
            </main>

        </div>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>

        <Teleport to="#pwa-nav">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.pwa-layout {
    display: grid;
    grid-template:
        "asidel asidem asider" max-content
        "mainl mainm mainr" 1fr
        / auto 1fr 435px;
    gap: 0 32px;

    height: 100%;
    overflow-y: hidden;

    aside {
        grid-area: 1 / 1 / 2 / -1;

        display: grid;
        grid-template-columns: subgrid;

        padding: 32px;
        padding-top: 0;

        background-color: #111316;
        background-color: #111316dd;
        border-bottom: 1px solid #fff3;
        box-shadow: 0 2px 4px 0 #0008;
    }

    main {
        grid-area: 2 / 1 / -1 / -1;

        position: relative;
        padding: 32px;
        overflow-y: auto;

        display: grid;
        grid-template-columns: subgrid;
    }
}

.mini-aside {
    width: 435px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

#announcer-main-tp-target {
    grid-column: span 2;
}
</style>