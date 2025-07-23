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
    align-items: first center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
}

label.no-label {
    display: inline-block;

    .title {
        display: none;
    }
}

label.enclose-box {
    flex-direction: row-reverse;
    justify-content: start;
    height: 40px;
    width: 100%;
    padding: 0 12px;
    font: 16px Heebo, arial, sans-serif;
    border: 1px solid #30343d;
    /* background-color: #ffffff06; */
    color: currentColor;
    border-radius: 6px;
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
    border-radius: 4px;
}

input[type="checkbox"]::before {
    position: absolute;
    top: -3px;
    bottom: -3px;
    left: -3px;
    right: -3px;
    content: '';
    border-radius: 4px;

    background-color: #303030;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);

    transition: background-color 150ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

label:hover input[type="checkbox"]::before {
    background-color: #404040;
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
    content: 'check_small';
    position: absolute;
    top: 50%;
    left: 50%;
    translate: -50% -50%;

    opacity: 0;
    scale: 0;

    font-size: 24px;
    font-family: 'Material Symbols Outlined';
    font-weight: 700;
    font-variation-settings:
        'FILL' 0,
        'wght' 700,
        'GRAD' 0,
        'opsz' 20;

    color: #000;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);

    transition: opacity 300ms cubic-bezier(0.34, 1.56, 0.64, 1), scale 100ms;
}

input[type="checkbox"]:checked::after {
    opacity: 1;
    scale: 1;
}

label:hover input[type="checkbox"]:checked:after {
    scale: 1.2;
}
</style>