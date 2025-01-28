<script setup>
import { inject, onMounted, watch } from 'vue';
import { ref } from 'vue';

const tabs = inject('tabs');
const activeTab = inject('activeTab');

const props = defineProps({
    value: {
        type: String,
        required: true,
    },
});

const isActive = ref(false);

onMounted(() => {
    tabs.value.push({ value: props.value, label: props.value });
    isActive.value = activeTab.value === props.value;
});

watch(activeTab, (newVal) => {
    isActive.value = newVal === props.value;
});
</script>

<style scoped>
div {
    position: relative;
}
</style>

<template>
    <div v-if="isActive">
        <slot></slot>
    </div>
</template>