<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';

const props = defineProps<{
    x?: number;
    y?: number;
}>();
const emit = defineEmits<{
    'click-outside': [MouseEvent];
}>();

const target = ref<HTMLElement | null>(null);

onClickOutside(target, (event: MouseEvent) => emit('click-outside', event));
</script>

<template>
    <div class="context-menu" ref="target" :style="{ top: props.y + 'px', left: props.x + 'px' }">
        <slot></slot>
    </div>
</template>

<style>
.context-menu {
    --background: #fff;
    --background-hover: #f0f0f0;
    --color: #000;
    position: fixed;
    min-width: 150px;
    min-height: 32px;
    background: var(--background);
    color: var(--color);
    border: 1px solid #6d6e71;
    border-radius: 5px;
    box-shadow: 2px 2px 8px 2px #00000070;
    overflow: hidden;
    z-index: 1;
}

.context-menu.dark {
    --background: #171717;
    --background-hover: #292929;
    --color: #fff;
}

.context-menu>button {
    display: flex;
    align-items: center;
    justify-content: start;
    height: 32px;
    width: 100%;
    padding-left: 12px;
    padding-right: 12px;
    cursor: pointer;
    background-color: var(--background);
    color: var(--color);
    border: none;
    font: 14px Arial, Helvetica, sans-serif;
}

.context-menu>button:hover {
    background-color: var(--background-hover);
}
</style>