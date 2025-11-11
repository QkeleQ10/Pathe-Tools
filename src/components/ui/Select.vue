<script setup lang="ts">
const model = defineModel();
defineProps<{ type?: string }>();
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
    border: 1px solid light-dark(#9da1ac, #30343d);
    background-color: #ffffff06;
    color: currentColor;
    border-radius: 6px;
}

select:focus-visible {
    outline: 2px solid var(--yellow2);
}

select option {
    background-color: light-dark(#fff, #30343d);
    color: light-dark(#000, #fff);
    font-size: 14px;
}
</style>