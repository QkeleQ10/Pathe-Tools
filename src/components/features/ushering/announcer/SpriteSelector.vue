<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { getSoundName, previewSpriteSound, voices, Voice } from '@/scripts/voices';

const props = defineProps<{
    id?: string;
    chimes?: boolean;
    additionalSounds?: string[];
    placeholder?: string;
}>();

const model = defineModel<string>({ required: true });
const preferredVoiceIds = useStorage<string[]>('preferred-voices', []);

const searchQuery = ref(model.value || props.placeholder || '');

const sortByQuery = (items: string[], query: string) => {
    query = query.toLowerCase();

    return items
        .map(key => ({
            item: key,
            score: Math.max(
                score(key, query),
                score(getSoundName(key), query)
            )
        }))
        .sort((a, b) => b.score - a.score)
        .map(x => x.item);
};

const score = (text = "", query: string) => {
    text = text.toLowerCase();

    if (text === query) return 100;
    if (text.startsWith(query)) return 75;
    if (text.includes(query)) return 50;

    // Loose subsequence match ("crd" matches "credits")
    let i = 0;
    for (const c of text) if (c === query[i]) i++;
    return i / query.length;
};

const sortedSounds = computed(() => {
    const list = Object.values(voices).flatMap(voice => voice.sounds.slice());

    if (props.additionalSounds) {
        list.push(...props.additionalSounds);
    }

    const unique = Array.from(new Set(list)).filter((e): e is string => typeof e === 'string');

    const results = unique
        .filter(e => e.startsWith('chime') === !!props.chimes);

    return sortByQuery(results, searchQuery.value);
});

function sentenceCase(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function select(key: string) {
    if (key)
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
    <div class="sprite-selector">
        <Input class="sound-search" placeholder="Zoeken..." v-model="searchQuery"
            @keyup.enter="select(sortedSounds[0])" />
        <div class="sprite-row" :id="id" v-bind="$attrs">
            <div class="sprite" v-for="key in sortedSounds" :key="key"
                :class="{ selected: model === key || (!model && key === props.placeholder) }">
                <button type="button" class="select-sound" @click="select(key)" :title="key">
                    {{ sentenceCase(getSoundName(key)) }}
                </button>
                <button v-if="model === key && !props.additionalSounds?.includes(key)" type="button" class="preview-button"
                    @click="preview(key)" title="Voorbeeld afspelen">
                    <Icon fill>play_arrow</Icon>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.sprite-selector {
    display: grid;
    gap: 4px;
}

.sprite-row {
    max-height: 100px;
    overflow-y: auto;
    display: flex;
    gap: 2px 4px;
}

.sprite {
    display: flex;
    width: max-content;
    flex-shrink: 0;
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
