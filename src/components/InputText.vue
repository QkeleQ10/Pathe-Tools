<script setup>
const props = defineProps(['identifier'])
const model = defineModel()
</script>

<template>
    <label class="input" :for="identifier">
        <div class="title">
            <slot></slot>
        </div>
        <input type="text" inputmode="numeric" pattern="[0-9]+" name="" :id="identifier" v-model.number="model">
    </label>
</template>

<style scoped>
label {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 16px;
    margin-inline: 8px;
    padding-bottom: 8px;
    cursor: pointer;
    user-select: none;
}

.title {
    display: flex;
    flex: max-content 0 0;
    flex-direction: column;
    gap: 4px;
}

input {
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
    pointer-events: none;
}
</style>