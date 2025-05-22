<script setup lang="ts">
import { format } from 'date-fns';
import { computed } from 'vue';

const props = defineProps<{ identifier: string; disabled?: boolean }>();
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
    <label class="input time-input" :for="identifier">
        <div class="title">
            <slot></slot>
        </div>
        <div class="input">
            <input type="datetime-local" :id="identifier" :disabled="disabled" :value="transformedModel"
                @blur="transformedModel = ($event.target as HTMLInputElement).value" />
        </div>
    </label>
</template>

<style scoped>
label {
    position: relative;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    cursor: pointer;
    user-select: none;
}

label.no-label {
    display: inline-block;

    .title {
        display: none;
    }
}

.title {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

div.input {
    position: relative;
    height: 34px;
    width: 175px;
    flex-shrink: 0;
    font: 15px Arial, Helvetica, sans-serif;
    color: #000;
}

input {
    height: 100%;
    width: 100%;
    padding: 8px;
    padding-right: 0;
    font: 15px Arial, Helvetica, sans-serif;
    border: 1px solid #6d6e71;
    border-radius: 6px;
}

input:focus-visible {
    outline: 1px solid #ffc426;
}
</style>