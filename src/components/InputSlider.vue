<script setup>
const props = defineProps(['min', 'max', 'step', 'unit'])
const model = defineModel()
</script>

<template>
    <label class="input-slider" :for="this._uid">
        <div class="title">
            <slot></slot>
        </div>
        <div class="indicator"
            :style="{ '--normalised-position': (model - Number(min)) / (Number(max) - Number(min)) }">
            {{ model + (unit ? ` ${unit}` : '') }}
        </div>
        <input type="range" name="" :id="this._uid" v-model="model" :min="min" :max="max" :step="step">
    </label>
</template>

<style scoped>
label {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-inline: 8px;
    padding-bottom: 8px;
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
    translate: -50%;
    pointer-events: none;
    opacity: 0;
    text-wrap: nowrap;
}

label:hover .indicator {
    opacity: 1;
}

input[type="range"] {
    appearance: none;
    background: transparent;
    cursor: pointer;
    width: 100%;
}

input[type="range"]::-webkit-slider-runnable-track {
    background-color: #ffc426;
    background-image: linear-gradient(to bottom, #f7da66, #ffc426);
    height: 6px;
    border-radius: 3px;
}

input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    margin-top: -5px;
    background-color: #ffc426;
    background-image: linear-gradient(to bottom, #f7da66, #ffc426);
    height: 16px;
    width: 16px;
    border-radius: 50%;
}
</style>