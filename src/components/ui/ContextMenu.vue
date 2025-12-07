<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';

const props = defineProps<{
    anchor?: HTMLElement | null;
    x?: number;
    y?: number;
}>();
const emit = defineEmits<{
    'click-outside': [MouseEvent];
}>();

const target = ref<HTMLElement | null>(null);

// Position the menu when anchor is available
const updatePosition = () => {
    if (!target.value || !props.anchor) return;

    const anchorRect = props.anchor.getBoundingClientRect();
    const menuRect = target.value.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Default: position below and to the right of the anchor
    let top = anchorRect.bottom;
    let left = anchorRect.right - menuRect.width;

    // Adjust if menu would overflow viewport
    if (left + menuRect.width > viewportWidth) {
        left = anchorRect.left;
    }
    if (left < 0) {
        left = 0;
    }

    if (top + menuRect.height > viewportHeight) {
        // Position above anchor instead
        top = anchorRect.top - menuRect.height;
    }
    if (top < 0) {
        top = 0;
    }

    target.value.style.top = `${top}px`;
    target.value.style.left = `${left}px`;
};

watch(() => props.anchor, () => {
    if (props.anchor) {
        nextTick(updatePosition);
    }
}, { immediate: true });

onMounted(() => {
    if (props.anchor) {
        updatePosition();
    }
});

onClickOutside(target, (event: MouseEvent) => emit('click-outside', event));
</script>

<template>
    <div 
        class="context-menu" 
        ref="target" 
        :style="props.anchor ? {} : { top: props.y + 'px', left: props.x + 'px' }"
    >
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
    z-index: 1000;
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