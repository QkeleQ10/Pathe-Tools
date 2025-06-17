<script setup lang="ts">
const props = defineProps<{ identifier: string; disabled?: boolean }>();
const model = defineModel<string>();
</script>

<template>
    <label class="input time-input" :for="identifier">
        <div class="title">
            <slot></slot>
        </div>
        <div class="input">
            <input type="time" :id="identifier" :disabled="disabled" v-model="model" />
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
    width: 86px;
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
    outline: 2px solid #feb91e;
}
</style>