<script setup>
const props = defineProps(['identifier'])
const model = defineModel()
</script>

<template>
    <label class="input-slider" :for="identifier">
        <div class="title">
            <slot></slot>
        </div>
        <input type="checkbox" name="" :id="identifier" v-model="model">
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
    user-select: none;
}

.title {
    display: flex;
    align-items: start;
    flex-direction: column;
    gap: 4px;
}

input[type="checkbox"] {
    flex-shrink: 0;
    position: relative;
    appearance: none;
    background: transparent;
    cursor: pointer;
    margin: 0;
    font: inherit;
    color: currentColor;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-radius: 3px;
}

input[type="checkbox"]::before {
    position: absolute;
    inset: -2px;
    content: '';
    transform: scale(0);
    border-radius: 3px;
    background-color: #ffc426;
    background-image: linear-gradient(to bottom, #f7da66, #ffc426);
}

label:hover input[type="checkbox"]::before,
input[type="checkbox"]:focus-visible:before {
    background-color: #e3af24;
    background-image: -webkit-linear-gradient(top, #dcc25c, #e3af24);
    background-image: linear-gradient(to bottom, #dcc25c, #e3af24);
}

input[type="checkbox"]:checked::before {
    transform: scale(1);
}

input[type="checkbox"]::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: scale(0);
    border-radius: 3px;
    background-color: #000;
    transform-origin: bottom left;
    clip-path: polygon(16% 46%, 0 62%, 39% 100%, 100% 20%, 83% 6%, 38% 65%);
}

input[type="checkbox"]:checked::after {
    transform: scale(1);
}
</style>