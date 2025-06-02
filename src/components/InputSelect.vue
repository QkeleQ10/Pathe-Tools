<script setup lang="ts">
const props = defineProps<{ identifier: string }>();
const model = defineModel<any>();
</script>

<template>
    <label class="input select-input" :for="identifier">
        <div class="title">
            <slot></slot>
        </div>
        <select :id="identifier" v-model="model">
            <slot name="options"></slot>
        </select>
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

label.no-label {
    display: inline-block;

    .title {
        display: none;
    }
}

.title {
    display: flex;
    flex: max-content 0 0;
    flex-direction: column;
    gap: 4px;
}

select {
    height: 100%;
    width: 100%;
    max-width: 200px;
    padding: 8px;
    padding-right: 0;
    font: 15px Arial, Helvetica, sans-serif;
    border: 1px solid #6d6e71;
    color: #000;
    border-radius: 6px;
}

select:focus-visible {
    outline: 1px solid #ffc426;
}
</style>