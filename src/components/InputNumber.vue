<script setup lang="ts">
const props = defineProps<{ unit?: string; identifier: string; disabled?: boolean }>();
const model = defineModel<number>();
</script>

<template>
    <label class="input number-input" :for="identifier">
        <div class="title">
            <slot></slot>
        </div>
        <div class="input" :class="{ 'has-unit': !!unit }">
            <input type="number" inputmode="numeric" pattern="[0-9]+" :id="identifier" :disabled="disabled"
                v-model.number="model">
            <span class="unit" v-if="unit">{{ unit }}</span>
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
    width: 52px;
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

div.input.has-unit {
    width: 82px;
}

div.input span.unit {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: #6d6e71;
    pointer-events: none;
}
</style>