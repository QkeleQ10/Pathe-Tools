<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import { getSoundName } from '@/scripts/voices';
import { getDefaultAnnouncerSound, getDefaultScheduleAuditoriumName, getDefaultTimetableAuditoriumName } from '@/scripts/auditoriums';
import SpriteSelector from '../ushering/announcer/SpriteSelector.vue';

const props = defineProps<{
    preview?: {
        schedule?: boolean;
        timetable?: boolean;
        announcer?: boolean;
    }
}>();

const store = useTmsScheduleStore();

const timetableAuditoriumMappings = useStorage<Record<string, string>>('timetable-auditorium-mappings', {}, window.sessionStorage);
const scheduleAuditoriumMappings = useStorage<Record<string, string>>('schedule-auditorium-mappings', {}, window.sessionStorage);
const announcerAuditoriumMappings = useStorage<Record<string, string>>('announcer-auditorium-mappings', {}, window.sessionStorage);

const loadedAuditoriums = computed(() => {
    return [...new Set(store.table.map(show => show.auditorium).filter(Boolean))];
});

const auditoriums = computed(() => (
    [...new Set([
        ...Object.keys(timetableAuditoriumMappings.value),
        ...Object.keys(scheduleAuditoriumMappings.value),
        ...Object.keys(announcerAuditoriumMappings.value),
        ...loadedAuditoriums.value
    ])].sort((a, b) => ("" + a).localeCompare(b, undefined, { numeric: true }))
));

const dialogOpen = ref(false);
const dKey = ref('');

const selectedScheduleName = computed({
    get: () => dKey.value
        ? (scheduleAuditoriumMappings.value?.[dKey.value] ?? getDefaultScheduleAuditoriumName(dKey.value))
        : '',
    set: (value: string) => {
        if (!dKey.value) return;
        scheduleAuditoriumMappings.value = {
            ...scheduleAuditoriumMappings.value,
            [dKey.value]: value
        }
    }
});

const selectedTimetableName = computed({
    get: () => dKey.value
        ? (timetableAuditoriumMappings.value?.[dKey.value] ?? getDefaultTimetableAuditoriumName(dKey.value))
        : '',
    set: (value: string) => {
        if (!dKey.value) return;
        timetableAuditoriumMappings.value = {
            ...timetableAuditoriumMappings.value,
            [dKey.value]: value
        }
    }
});

const selectedAnnouncerSound = computed({
    get: () => dKey.value
        ? (announcerAuditoriumMappings.value?.[dKey.value] ?? getDefaultAnnouncerSound(dKey.value))
        : '',
    set: (value: string) => {
        if (!dKey.value) return;
        announcerAuditoriumMappings.value = {
            ...announcerAuditoriumMappings.value,
            [dKey.value]: value
        }
    }
});
</script>

<template>
    <div>
        <ul class="list scroll auditorium-mapping-list">
            <li v-for="(key) in auditoriums" :key="key" class="grid">
                <span>{{ key }}</span>
                <small>
                    <Icon>print</Icon>
                    {{ scheduleAuditoriumMappings[key] || getDefaultScheduleAuditoriumName(key) }}
                </small>
                <small>
                    <Icon>voice_selection</Icon>
                    {{ getSoundName(announcerAuditoriumMappings[key] || getDefaultAnnouncerSound(key)) }}
                </small>
                <small>
                    <Icon>signpost</Icon>
                    {{ timetableAuditoriumMappings[key] || getDefaultTimetableAuditoriumName(key) }}
                </small>
                <div class="actions">
                    <Icon class="edit" @click="dKey = key; dialogOpen = true">
                        edit
                    </Icon>
                </div>
            </li>
        </ul>
        <p v-if="!auditoriums.length">
            Upload eerst een bestand.
        </p>

        <Transition>
            <ModalDialog v-if="dialogOpen" @dismiss="dialogOpen = false">
                <h3>Zaal bewerken <span style="font-weight: normal;">({{ dKey }})</span></h3>
                <InputGroup type="text" id="internalName" v-model="selectedScheduleName"
                    :placeholder="getDefaultScheduleAuditoriumName(dKey)">
                    <template #label>Weergavenaam voor tijdenlijstje</template>
                </InputGroup>
                <br>
                <span class="label">Geluidsfragment voor omroepen</span>
                <SpriteSelector v-model="selectedAnnouncerSound" :placeholder="getDefaultAnnouncerSound(dKey)" />
                <br>
                <InputGroup type="text" id="shortName" v-model="selectedTimetableName"
                    :placeholder="getDefaultTimetableAuditoriumName(dKey)">
                    <template #label>Weergavenaam voor timetable</template>
                </InputGroup>
            </ModalDialog>
        </Transition>
    </div>
</template>

<style scoped>
.auditorium-mapping-list {
    li {
        position: relative;
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr auto;
        align-items: center;

        small {
            opacity: .75;

            display: flex;
            gap: 4px;
            align-items: center;
        }

        .actions {
            display: flex;
            gap: 8px;
        }
    }
}

:deep(.sounds-pile) {
    padding: 8px 12px;
    border: 1px solid #ffffff14;
    border-radius: 5px;
    max-height: 250px !important;
}
</style>