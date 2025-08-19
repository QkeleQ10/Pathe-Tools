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
    margin-left: -8px;
}

.tabs button {
    all: unset;
    padding: 8px;
    padding-bottom: 12px;
    cursor: pointer;
    position: relative;

    transition: color 150ms;

    &:focus-visible {
        outline: 2px solid #feb91e;
        outline-offset: 2px;
    }
}

.tabs button.active {
    color: #ffc426;
}

.tabs button:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    translate: -50%;
    background: currentColor;
    height: 3px;
    border-radius: 50vmax;
    transition: width 150ms;
}

.tabs button:hover:after {
    left: 50%;
    right: auto;
    width: 16px;
}

.tabs button.active:after {
    width: calc(100% - 16px);
}

.tab-content {
    margin-top: 16px;
}
</style>