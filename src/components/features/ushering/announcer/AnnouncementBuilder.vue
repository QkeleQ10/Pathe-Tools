<script setup lang="ts">
import { computed } from 'vue';
import { getSoundName } from '@/scripts/voices';
import SpriteLibrary from './SpriteLibrary.vue';

const segments = defineModel<{ spriteName: string; offset: number }[]>({ default: [] });
const showAnnouncementBuilder = defineModel<boolean>('show', { default: false });
const props = defineProps({
    noButton: {
        type: Boolean,
        default: false
    },
    auditoriumKnown: {
        type: Boolean,
        default: false
    }
});

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
    <Button v-if="!noButton" class="secondary full left" @click="showAnnouncementBuilder = true" v-bind="$attrs">
        <slot>
            <Icon>build</Icon>
            <span>Omroep bewerken</span>
        </slot>
    </Button>

    <Transition>
        <ModalDialog v-if="showAnnouncementBuilder" @dismiss="showAnnouncementBuilder = false">
            <div class="builder-layout">
                <div class="segment-list-panel">
                    <h3>Omroeponderdelen</h3>
                    <ul class="list scroll fixed segments-list">
                        <li class="segment" v-for="(segment, i) in displaySegments" :key="i">
                            <span class="segment-label">{{ segment.label }}</span>
                            <Icon class="delete" @click="segments.splice(i, 1)">close</Icon>
                        </li>
                        <p v-if="!segments.length" class="empty-state">Geen onderdelen geselecteerd.</p>
                    </ul>
                </div>

                <div class="sprite-library-panel">
                    <h3>Onderdelen toevoegen</h3>
                    <SpriteLibrary
                        :additional-sounds="auditoriumKnown ? ['auditorium#'] : []"
                        @select="addSprite" />
                </div>
            </div>
            <slot name="footer">
            </slot>
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
</style>
