<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useElementSize } from '@vueuse/core';
import Input from './Input.vue';
import Select from './Select.vue';

defineOptions({
    inheritAttrs: false
})
defineProps<{ id: string, type: string }>();
const model = defineModel();

const { width } = useElementSize(useTemplateRef('ghostRef'));
</script>

<template>
    <div class="input-group">
        <label :for="id" class="label">
            <slot name="label"></slot>
        </label>
        <component :is="type === 'select' ? Select : Input" :type="type" :id="id" v-model="model" v-bind="$attrs">
            <slot name="input"></slot>
        </component>
        <slot></slot>

        <!-- Hidden span to measure text width -->
        <span ref="ghostRef" class="ghost-span">{{ model }}</span>
    </div>
</template>

<style scoped>
.input-group {
    position: relative;
}

.ghost-span {
    width: max-content;
    max-width: calc(100% - 48px);
    position: absolute;
    left: 0;
    visibility: hidden;
    white-space: pre;
    font: inherit;
    pointer-events: none;
}

:slotted(.unit) {
    position: absolute;
    left: 18px;
    translate: calc(v-bind(width) * 1px);
    top: 38px;
    opacity: .5;
    font-size: 12px;
    pointer-events: none;
}
</style>