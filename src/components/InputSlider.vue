<script setup lang="ts">
const props = defineProps<{
    min: number;
    max: number;
    step: number;
    unit?: string;
    identifier: string;
}>();

const model = defineModel<number>();
</script>

<template>
    <label class="input slider-input" :for="identifier">
        <div class="title">
            <slot></slot>
        </div>
        <div class="indicator"
            :style="{ '--normalised-position': (Number(model) - Number(min)) / (Number(max) - Number(min)) }">
            {{ model + (unit ? ` ${unit}` : '') }}
        </div>
        <input type="range" :id="identifier" v-model="model" :min="min" :max="max" :step="step" />
    </label>
</template>

<style scoped>
label {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
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

.indicator {
    --normalised-position: 0.5;
    position: absolute;
    border-radius: 5px;
    padding: 6px;
    background-color: #fff;
    color: #000;
    left: calc(var(--normalised-position) * 100%);
    bottom: -28px;
    transform: translateX(-50%);
    pointer-events: none;
    opacity: 0;
    text-wrap: nowrap;
}

label:hover .indicator {
    opacity: 1;
}

input[type='range'] {
    appearance: none;
    background: transparent;
    cursor: pointer;
    width: 100%;
}

input[type='range']::-webkit-slider-runnable-track {
    background-color: #ffc426;
    background-image: linear-gradient(to bottom, #f7da66, #ffc426);
    height: 6px;
    border-radius: 3px;
}

input[type='range']::-webkit-slider-thumb {
    appearance: none;
    margin-top: -5px;
    background-color: #ffc426;
    background-image: linear-gradient(to bottom, #f7da66, #ffc426);
    height: 16px;
    width: 16px;
    border-radius: 50%;
}
</style>