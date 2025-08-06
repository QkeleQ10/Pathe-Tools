<script setup lang="ts">
const model = defineModel();
</script>

<template>
    <input v-model="model" />
</template>

<style scoped>
input {
    height: 40px;
    width: 100%;
    padding: 0 12px;
    font: 16px Heebo, arial, sans-serif;
    border: 1px solid light-dark(#9da1ac, #30343d);
    background-color: #ffffff06;
    color: currentColor;
    border-radius: 6px;
}

input:focus-visible {
    outline: 2px solid #feb91e;
}
</style>