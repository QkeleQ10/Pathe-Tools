<script setup lang="ts">
import { inject, computed, Ref } from 'vue';

const props = defineProps<{
    categoryId: string;
    label: string;
}>();

const activeCategory = inject<Ref<string>>('activeCategory');
const scrollToCategory = inject<(id: string) => void>('scrollToCategory');

const isActive = computed(() => activeCategory?.value === props.categoryId);

const handleClick = () => {
    if (scrollToCategory) {
        scrollToCategory(props.categoryId);
    }
};
</script>

<template>
    <button 
        class="settings-category-button" 
        :class="{ active: isActive }"
        @click="handleClick"
    >
        {{ label }}
    </button>
</template>

<style scoped>
.settings-category-button {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 16px;
    border-radius: 6px;
    font-family: Heebo, arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    transition: background-color .15s ease-out, color .15s ease-out;
    cursor: pointer;
    color: #ffffffb3;
    background: transparent;
    border: none;
    text-align: left;
    outline: none;
    white-space: nowrap;

    &:hover {
        background: #ffffff0d;
        color: #fff;
    }

    &:focus-visible {
        outline: 2px solid var(--yellow2);
        outline-offset: 2px;
    }

    &.active {
        background: #ffffff1a;
        color: #fff;
        font-weight: 600;
    }
}
</style>
