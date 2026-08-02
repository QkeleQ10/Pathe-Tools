<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { getSoundName, previewSpriteSound, voices, Voice } from '@/scripts/voices';

const props = defineProps<{
    chimes?: boolean;
    additionalSounds?: string[];
}>();

const emit = defineEmits<{
    (e: 'select', spriteName: string): void;
}>();

const preferredVoiceIds = useStorage<string[]>('preferred-voices', []);
const searchQuery = ref('');

const preferredVoices = computed(() =>
    preferredVoiceIds.value
        .map(id => voices[id])
        .filter((voice): voice is Voice => !!voice)
);

const sounds = computed(() => {
    const list = Object.values(voices).flatMap(voice => voice.sounds.slice());

    if (props.additionalSounds) {
        list.push(...props.additionalSounds);
    }

    return Array.from(new Set(list))
        .filter((sound): sound is string => typeof sound === 'string')
        .filter(sound => sound.startsWith('chime') === !!props.chimes)
        .sort((left, right) => {
            if (!searchQuery.value.trim()) {
                return 0;
            }

            const leftLabel = getSoundName(left).toLowerCase();
            const rightLabel = getSoundName(right).toLowerCase();
            const query = searchQuery.value.trim().toLowerCase();

            if (!query) return leftLabel.localeCompare(rightLabel, undefined, { numeric: true });

            return score(right, query) - score(left, query) || leftLabel.localeCompare(rightLabel, undefined, { numeric: true });
        });
});

function score(sound: string, query: string) {
    const label = getSoundName(sound).toLowerCase();
    const name = sound.toLowerCase();

    if (name === query || label === query) return 100;
    if (name.startsWith(query) || label.startsWith(query)) return 75;
    if (name.includes(query) || label.includes(query)) return 50;

    let index = 0;
    for (const character of `${label} ${name}`) {
        if (character === query[index]) index += 1;
    }
    return index / query.length;
}

function sentenceCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function select(spriteName: string) {
    emit('select', spriteName);
}

function preview(spriteName: string) {
    return previewSpriteSound(spriteName, preferredVoices.value);
}
</script>

<template>
    <div class="sprite-library">
        <Input class="search-box" v-model="searchQuery" placeholder="Zoeken..." @keyup.enter="select(sounds[0])" />

        <div class="sprite-pile sprites-list">
            <div v-for="spriteName in sounds" :key="spriteName" class="sprite">
                <button type="button" class="select-sound" @click="select(spriteName)" :title="spriteName">
                    {{ sentenceCase(getSoundName(spriteName)) }}
                </button>
                <!-- <button type="button" class="preview-button" @click="preview(spriteName)" title="Voorbeeld afspelen">
                    <Icon fill>play_arrow</Icon>
                </button> -->
            </div>
            <p v-if="!sounds.length" class="empty-state">Geen sprites gevonden.</p>
        </div>
    </div>
</template>

<style scoped>
.sprite-library {
    display: grid;
    gap: 8px;
}

.sprites-list {
    max-height: 452px;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 2px 4px;
}

.sprite {
    display: flex;
    height: 26px;
    font: inherit;
    font-size: 13px;
    align-items: center;
    border-radius: 4px;
    overflow: hidden;

    &:first-child {
        background-color: light-dark(#00000066, #ffffff33);
    }

    &>button {
        border: 0;
        color: inherit;
        font: inherit;
        display: flex;
        align-items: center;
        cursor: pointer;

        background-color: light-dark(#00000033, #ffffff1a);
        color: light-dark(#000, #fff);

        &:hover {
            background-color: #ffffff1f;
        }

        &:not(:first-child)::before {
            content: '';
            display: block;
            width: 1px;
            height: calc(100% - 4px);
            background-color: currentColor;
            opacity: .25;
            margin-right: 4px;
        }
    }

    .select-sound {
        padding: 4px 6px;
    }

    .preview-button {
        padding: 4px;
        padding-left: 2px;
    }
}

.empty-state {
    margin: 0;
    opacity: .75;
}
</style>