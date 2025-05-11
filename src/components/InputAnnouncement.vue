<script setup lang="ts">
import { ref } from 'vue';
import { useFocus } from '@vueuse/core';
import { getSoundInfo } from '@/utils/voices';

const props = defineProps<{ identifier: string }>();
const model = defineModel<string[]>({ default: [] });

const inputElement = ref<HTMLInputElement>(null);
const { focused } = useFocus(inputElement);
</script>

<template>
    <label class="input" :for="identifier">
        <div class="title">
            <slot></slot>
        </div>
        <div class="input">
            <input ref="inputElement" type="text" inputmode="numeric" pattern="[0-9]+" name="" :id="identifier"
                :value="model.join(' ')"
                @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value.split(' '))">
            <div v-show="!focused" class="words">
                <div v-for="soundInfo in model.map(getSoundInfo)" class="word"
                    :class="{ valid: soundInfo.valid, translucent: soundInfo.probability < 1 }">
                    <span v-for="(split, i) in soundInfo.id.split('|')" :key="i">
                        <Icon v-if="split === 'chime'" :fill="true" style="--size: 14px; vertical-align: middle;">
                            music_note</Icon>
                        <span v-else>
                            {{ soundInfo.name.split('|')[i] }}
                        </span>
                    </span>
                </div>
            </div>
        </div>
    </label>
</template>

<style scoped>
label {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    cursor: pointer;
    user-select: none;
}

.title {
    display: flex;
    flex: max-content 0 0;
    flex-direction: column;
    gap: 4px;
}

div.input {
    position: relative;
    height: 100%;
    width: 100%;
    max-width: 200px;
    font: 15px Arial, Helvetica, sans-serif;
    color: #000;
}

input {
    height: 100%;
    width: 100%;
    max-width: 200px;
    padding: 8px;
    padding-right: 0;
    font: 13px Arial, Helvetica, sans-serif;
    border: 1px solid #6d6e71;
    color: transparent;
    border-radius: 6px;
}

input:focus-visible {
    color: #000;
    outline: 1px solid #ffc426;
}

.words {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    position: absolute;
    top: 1px;
    right: 1px;
    bottom: 1px;
    left: 1px;
    overflow: hidden;
    cursor: text;
}

.words>.word {
    flex-shrink: 0;
    display: flex;
    align-items: stretch;
    height: 22px;
    padding-inline: 6px;
    border-radius: 4px;
    font: 13px Arial, Helvetica, sans-serif;

    &.valid {
        background-color: #ffc426;
        color: #000;
    }

    &:not(.valid) {
        background-color: #f0f0f0;
        color: #6d6e71;
    }

    &:has(span:only-child>.icon) {
        padding: 0;
        background-color: transparent;
    }

    &>span {
        display: inline-flex;
        align-items: center;
        gap: 2px;
    }

    &>span:not(:only-child):not(:last-child) {
        padding-right: 4px;
    }

    &>span+span {
        border-left: 2px solid #fff;
        padding-left: 4px;
    }
}
</style>