<script setup lang="ts">
import { computed } from 'vue';
import { getSoundName } from '@/scripts/voices';
import SpriteLibrary from './SpriteLibrary.vue';

const segments = defineModel<{ spriteName: string; offset: number }[]>({ default: () => [] });
const { auditoriumKnown = false, scheduleDisabled = false } = defineProps<{
    auditoriumKnown?: boolean;
    scheduleDisabled?: boolean;
}>();

const emit = defineEmits<{
    (e: 'preview', segments: { spriteName: string; offset: number }[]): void;
    (e: 'download', segments: { spriteName: string; offset: number }[]): void;
    (e: 'schedule'): void;
    (e: 'dismiss'): void;
}>();

const displaySegments = computed(() => segments.value.map(segment => ({
    ...segment,
    label: segment.spriteName ? getSoundName(segment.spriteName) : 'Nog geen onderdeel'
})));

function addSprite(spriteName: string) {
    segments.value.push({
        spriteName,
        offset: 0,
    });
}
</script>

<template>
    <Transition>
        <ModalDialog @dismiss="emit('dismiss')">

            <h3>
                <slot name="title">Omroep bewerken</slot>
            </h3>

            <div class="builder-layout">
                <div class="segment-list-panel">
                    <span class="label">Omroeponderdelen</span>
                    <ul class="list scroll fixed segments-list">
                        <li class="segment" v-for="(segment, i) in displaySegments" :key="i">
                            <span class="segment-label">{{ segment.label }}</span>
                            <Icon class="delete" @click="segments.splice(i, 1)">close</Icon>
                        </li>
                        <p v-if="!segments.length" class="empty-state">Geen onderdelen geselecteerd.</p>
                    </ul>
                </div>

                <div class="sprite-library-panel">
                    <span class="label">Onderdelen toevoegen</span>
                    <SpriteLibrary :additional-sounds="auditoriumKnown ? ['auditorium#'] : []" @select="addSprite" />
                </div>

                <div class="schedule">
                    <slot name="schedule"></slot>
                </div>
            </div>


            <hr>

            <div class="builder-actions">
                <Button class="primary" :disabled="scheduleDisabled" @click="emit('schedule')">
                    <slot name="schedule-submit">
                        <Icon>timer</Icon>
                        Inplannen
                    </slot>
                </Button>
                <Button class="secondary" :disabled="!segments.length" @click="emit('preview', segments)">
                    <Icon>play_arrow</Icon>
                    Nu afspelen
                </Button>
                <Button class="secondary" :disabled="!segments.length" @click="emit('download', segments)">
                    <Icon>download</Icon>
                    Downloaden
                </Button>
            </div>

        </ModalDialog>
    </Transition>
</template>

<style scoped>
.builder-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.sprite-library {
    max-height: 500px;
}

.schedule {
    grid-column: 1 / -1;
}

.builder-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    align-items: end;
}

.segment {
    display: grid;
    align-items: center;
    grid-template-columns: 1fr auto;
    gap: 8px;
}

.segment-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.empty-state {
    margin: 16px;
    opacity: .75;
}

hr {
    border: none;
    border-top: 1px solid #ffffff14;
    margin: 16px 0;
}
</style>
