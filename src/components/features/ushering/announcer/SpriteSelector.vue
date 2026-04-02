<script setup lang="ts">
import { computed } from 'vue';
import { getSoundInfo, voices } from '@/scripts/voices';

defineProps<{
    id: string;
    datalistId: string;
}>();

const model = defineModel<string>({ required: true });

const allSounds = computed(() => [...new Set(Object.values(voices).flatMap(voice => voice.sounds))]);

function sentenceCase(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
</script>

<template>
    <Input type="text" :id="id" v-model="model" :spellcheck="false" autocomplete="off" autocapitalize="off"
        :list="datalistId" v-bind="$attrs" />
    <datalist :id="datalistId">
        <option v-for="(key) in allSounds" :key="key" :value="key">
            {{ sentenceCase(getSoundInfo(key).name) }}
        </option>
    </datalist>
</template>