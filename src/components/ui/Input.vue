<script setup lang="ts">
const model = defineModel();
</script>

<template>
    <input v-model="model" />
</template>

<style scoped>
input:not(.contents-only) {
    height: 40px;
    width: 100%;
    padding: 0 12px;
    font: 16px Heebo, arial, sans-serif;
    border: 1px solid #ffffff14;
    background-color: #ffffff06;
    color: currentColor;
    border-radius: 6px;
}

input:not(.contents-only):focus-visible {
    outline: 2px solid var(--yellow2);
}

input.contents-only {
    all: unset;
}
</style>