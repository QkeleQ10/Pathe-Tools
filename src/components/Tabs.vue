<script setup lang="ts">
import { ref, provide, onMounted } from 'vue';

const tabs = ref<{ value: string; label: string; }[]>([]);
const activeTab = ref<string>('');

const selectTab = (value: string): void => {
    activeTab.value = value;
};

provide('tabs', tabs);
provide('activeTab', activeTab);
provide('selectTab', selectTab);

onMounted((): void => {
    if (tabs.value.length > 0) {
        activeTab.value = tabs.value[0].value;
    }
});
</script>

<template>
    <div>
        <div class="tabs">
            <button v-for="tab in tabs" :key="tab.value" :class="{ active: tab.value === activeTab }"
                @click="selectTab(tab.value)">
                {{ tab.label }}
            </button>
        </div>
        <div class="tab-content">
            <slot :activeTab="activeTab"></slot>
        </div>
    </div>
</template>

<style scoped>
.tabs {
    position: relative;
    display: flex;
    gap: 10px;
}

.tabs button {
    all: unset;
    padding: 8px;
    padding-bottom: 12px;
    cursor: pointer;
    position: relative;
}

.tabs button.active {
    color: #ffc426;
}

.tabs button:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    right: 50%;
    background: #ffc426;
    height: 3px;
    border-radius: 50vmax;
    transition: left 200ms, right 200ms;
}

.tabs button.active:after {
    right: 8px;
    left: 8px;
}

.tab-content {
    margin-top: 16px;
}
</style>