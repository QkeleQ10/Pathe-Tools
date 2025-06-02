<script setup lang="ts">
const props = defineProps<{ identifier: string }>();
const model = defineModel<boolean>();
</script>

<template>
    <label class="input checkbox-input" :for="identifier">
        <div class="title">
            <slot></slot>
        </div>
        <input type="checkbox" :id="identifier" v-model="model">
    </label>
</template>

<style scoped>
label {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: first baseline;
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

label.label-end {
    justify-content: start;

    &>input {
        order: -1;
    }
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
    top: -2px;
    bottom: -2px;
    left: -2px;
    right: -2px;
    content: '';
    transform: scale(0);
    border-radius: 3px;
    background-color: #ffc426;
    background-image: linear-gradient(to bottom, #f7da66, #ffc426);
}

label:hover input[type="checkbox"]::before,
input[type="checkbox"]:focus-visible::before {
    background-color: #e3af24;
    background-image: linear-gradient(to bottom, #dcc25c, #e3af24);
}

input[type="checkbox"]:checked::before {
    transform: scale(1);
}

input[type="checkbox"]::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
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