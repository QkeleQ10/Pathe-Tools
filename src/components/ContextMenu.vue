<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { onClickOutside } from '@vueuse/core'

const { x, y } = defineProps(['x', 'y'])
const emit = defineEmits(['click-outside'])

const target = ref(null)

onClickOutside(target, event => emit('click-outside', event))
</script>

<template>
    <div class="context-menu" ref="target" :style="{ top: y + 'px', left: x + 'px' }">
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
    padding-inline: 12px;
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