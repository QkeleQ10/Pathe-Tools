<script setup lang="ts">
import { ref, inject, onMounted, watch, Ref } from 'vue';

const tabs = inject<Ref<{ value: string; label: string }[]>>('tabs');
const activeTab = inject<Ref<string>>('activeTab');

const props = defineProps<{
    value: string;
}>();

const isActive = ref(false);

onMounted(() => {
    tabs?.value.push({ value: props.value, label: props.value });
    isActive.value = activeTab?.value === props.value;
});

watch(activeTab, (newVal) => {
    isActive.value = newVal === props.value;
});
</script>

<template>
    <div v-if="isActive">
        <slot></slot>
    </div>
</template>

<style scoped>
div {
    position: relative;
}
</style>
