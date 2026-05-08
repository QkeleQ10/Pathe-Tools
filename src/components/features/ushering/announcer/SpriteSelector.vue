<script setup lang="ts">
import { computed } from 'vue';
import { getSoundName, previewSpriteSound, voices } from '@/scripts/voices';

const props = defineProps<{
    id?: string;
    includeVariableAuditorium?: boolean;
    alwaysPlay?: boolean;
}>();

const model = defineModel<string>({ required: true });

const sounds = computed(() => {
    const list = Object.values(voices).flatMap(voice => voice.sounds.slice());

    if (props.includeVariableAuditorium) list.push('auditorium#');

    const unique = Array.from(new Set(list)).filter((e): e is string => typeof e === 'string');

    return unique
        .filter(e => !e.startsWith('chime'))
        .sort((a, b) => getSoundName(a).localeCompare(getSoundName(b), 'nl', { numeric: true, sensitivity: 'base' }));
});

function sentenceCase(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function selected(key: string) {
    model.value = key;
    if (props.alwaysPlay) previewSpriteSound(key)
}
</script>

<template>
    <div class="sounds-pile" :id="id" v-bind="$attrs">
        <div class="sound-entry" v-for="key in sounds" :key="key" :class="{ selected: model === key }">
            <button type="button" class="select-sound" @click="selected(key)" :title="key">
                {{ sentenceCase(getSoundName(key)) }}
            </button>
            <button v-if="key !== 'auditorium#'" type="button" class="preview-button" @click="previewSpriteSound(key)"
                title="Voorbeeld afspelen">
                <Icon fill>play_arrow</Icon>
            </button>
        </div>
    </div>
</template>

<style scoped>
.sounds-pile {
    max-height: 100px;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 2px 4px;
}

.sound-entry {
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
