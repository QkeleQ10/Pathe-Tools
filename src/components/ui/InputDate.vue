<script setup lang="ts">
import { format } from 'date-fns';
import { computed } from 'vue';

const model = defineModel<Date>();

const transformedModel = computed<string>({
    get() {
        return model.value ? format(model.value, 'yyyy-MM-dd\'T\'HH:mm') : '';
    },
    set(value: string) {
        const date = new Date(value);
        if (isNaN(date.getTime())) return;
        model.value = date;
    }
})
</script>

<template>
    <input type="datetime-local" :value="transformedModel"
        @blur="transformedModel = ($event.target as HTMLInputElement).value" />
</template>

<style scoped>
input {
    height: 40px;
    padding: 0 12px;
    font: 16px Heebo, arial, sans-serif;
    border: 1px solid #30343d;
    background-color: #ffffff06;
    color: #fff;
    border-radius: 6px;
}

input:focus-visible {
    outline: 2px solid var(--yellow2);
}
</style>