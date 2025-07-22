<script setup lang="ts">
const model = defineModel();
defineProps<{type?: string}>();
</script>

<template>
    <select v-model="model">
        <slot></slot>
    </select>
</template>

<style>
select {
    height: 40px;
    width: 100%;
    padding: 0 12px;
    font: 16px Heebo, arial, sans-serif;
    border: 1px solid #30343d;
    background-color: #ffffff06;
    color: #fff;
    border-radius: 6px;
}

select:focus-visible {
    outline: 2px solid #feb91e;
}

select option {
    background-color: #30343d;
    color: #fff;
    font-size: 14px;
}
</style>