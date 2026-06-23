<script setup lang="ts">
const props = defineProps<{
    fill?: boolean;
}>();
</script>

<template>
    <button class="icon-button" :class="$attrs.class">
        <Icon v-bind="$attrs">
            <slot></slot>
        </Icon>
    </button>
</template>

<style scoped>
.icon-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: inherit;

    &.edit {
        color: var(--yellow2);
        cursor: pointer;
    }

    &.delete {
        color: #ff6b6b;
        cursor: pointer;
    }
}
</style>