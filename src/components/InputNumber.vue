<script setup>
const props = defineProps(['unit', 'identifier'])
const model = defineModel()
</script>

<template>
    <label class="input-slider" :for="identifier">
        <div class="title">
            <slot></slot>
        </div>
        <div class="input" :class="{ 'has-unit': !!unit }">
            <input type="number" inputmode="numeric" pattern="[0-9]+" name="" :id="identifier" v-model.number="model">
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
    margin-inline: 8px;
    padding-bottom: 8px;
    cursor: pointer;
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

div.input.has-unit {
    width: 82px;
}

div.input span.unit {
    position: absolute;
    right: 18px;
    top: 50%;
    translate: 0 -50%;
    color: #6d6e71;
}
</style>