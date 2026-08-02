<script setup lang="ts">
import { computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { getSoundName, previewSpriteSound, voices, Voice } from '@/scripts/voices';

const props = defineProps<{
    id?: string;
    noSelect?: boolean;
    chimes?: boolean;
    additionalSounds?: string[];
    placeholder?: string;
}>();

const model = defineModel<string>({ required: true });
const preferredVoiceIds = useStorage<string[]>('preferred-voices', []);

const sounds = computed(() => {
    const list = Object.values(voices).flatMap(voice => voice.sounds.slice());

    if (props.additionalSounds) {
        list.push(...props.additionalSounds);
    }

    const unique = Array.from(new Set(list)).filter((e): e is string => typeof e === 'string');

    return unique
        .filter(e => e.startsWith('chime') === !!props.chimes);
});

function sentenceCase(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function selected(key: string) {
    model.value = key;
}

const preferredVoices = computed(() =>
    preferredVoiceIds.value
        .map(id => voices[id])
        .filter((voice): voice is Voice => !!voice)
);

function preview(key: string) {
    return previewSpriteSound(key, preferredVoices.value);
}
</script>

<template>
    <div class="sprite-pile" :id="id" v-bind="$attrs">
        <div class="sprite" v-for="key in sounds" :key="key" :class="{ selected: model === key || (!model && key === props.placeholder) }">
            <template v-if="props.noSelect">
                <button type="button" class="select-sound" @click="preview(key)" :title="key">
                    {{ sentenceCase(getSoundName(key)) }}
                    <Icon fill>play_arrow</Icon>
                </button>
            </template>
            <template v-else>
                <button type="button" class="select-sound" @click="selected(key)" :title="key">
                    {{ sentenceCase(getSoundName(key)) }}
                </button>
                <button v-if="!props.additionalSounds?.includes(key)" type="button" class="preview-button"
                    @click="preview(key)" title="Voorbeeld afspelen">
                    <Icon fill>play_arrow</Icon>
                </button>
            </template>
        </div>
    </div>
</template>

<style scoped>
.sprite-pile {
    max-height: 100px;
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

    border-radius: 4px;
    overflow: hidden;

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

    &.selected>button {
        background-color: var(--yellow1);
        color: #000;
    }

    .select-sound {
        padding: 4px 6px;
    }

    .preview-button {
        padding: 4px;
        padding-left: 2px;
    }
}
</style>
