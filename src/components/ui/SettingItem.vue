<script setup lang="ts">
defineProps<{
    label?: string;
    description?: string;
}>();
</script>

<template>
    <div class="setting-item">
        <div v-if="label || description" class="setting-info">
            <label v-if="label" class="setting-label">{{ label }}</label>
            <p v-if="description" class="setting-description">{{ description }}</p>
        </div>
        <div class="setting-control">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 12px 16px;
    background: #1c2129;
    border-radius: 6px;
    min-height: 60px;
}

.setting-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.setting-label {
    font-size: 14px;
    font-weight: 500;
    color: #fff;
}

.setting-description {
    font-size: 12px;
    color: #ffffffb3;
    margin: 0;
}

.setting-control {
    flex-shrink: 0;
}
</style>
