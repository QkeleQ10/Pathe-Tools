<script setup lang="ts">
const props = defineProps<{ identifier: string }>();
const model = defineModel<boolean>();
</script>

<template>
    <label class="input switch-input" :for="identifier">
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
    align-items: start;
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
    width: 40px;
    height: 22px;
    border: 1px solid currentColor;
    border-radius: 16px;
}

input[type="checkbox"]::before {
    position: absolute;
    top: -3px;
    bottom: -3px;
    left: -3px;
    right: -3px;
    content: '';
    border-radius: 16px;

    background-color: light-dark(#cfcfcf, #303030);
    box-shadow: inset 0 2px 4px light-dark(#40404066, #00000066);

    transition: background-color 150ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

label:hover input[type="checkbox"]::before {
    background-color: light-dark(#e6e6e6, #404040);
}

input[type="checkbox"]:checked::before {
    background-color: #feb91e;
}

label:hover input[type="checkbox"]:checked::before {
    background-color: #fece61;
}

input[type="checkbox"]:focus-visible::before {
    outline: 2px solid #feb91e;
    outline-offset: 2px;
}

input[type="checkbox"]::after {
    content: '';
    position: absolute;
    top: 1.5px;
    left: 1.5px;
    height: 18px;
    width: 18px;
    border-radius: 12px;

    background-color: #fff;
    box-shadow: 0 2px 6px light-dark(#40404066, #00000066);

    transition: left 300ms cubic-bezier(0.34, 1.56, 0.64, 1), scale 100ms;
}

input[type="checkbox"]:checked::after {
    left: calc(100% - 19.5px);
}

label:hover input[type="checkbox"]::after {
    scale: 1.2;
}
</style>