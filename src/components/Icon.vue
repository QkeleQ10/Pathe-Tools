<script setup lang="ts">
const props = defineProps<{
    fill?: boolean;
}>();
</script>

<template>
    <span aria-hidden="true" class="icon material-symbols-outlined" :class="props.fill ? 'fill' : ''">
        <slot></slot>
    </span>
</template>

<style>
@property --size {
    syntax: '<length>';
    inherits: true;
    initial-value: 18px;
}

.icon {
    -webkit-user-select: none;
    user-select: none;
    font-variation-settings: 'FILL' 0;
    font-size: var(--size);
    min-width: var(--size);
    max-width: var(--size);
    min-height: var(--size);
    max-height: var(--size);
    overflow: hidden;
    box-sizing: content-box;
    transition: font-variation-settings 200ms ease-out;
}

.icon.fill {
    font-variation-settings: 'FILL' 1;
}

button.primary .icon,
button.secondary .icon {
    vertical-align: middle;
    --size: 22px;
    margin-right: 8px;
}
</style>