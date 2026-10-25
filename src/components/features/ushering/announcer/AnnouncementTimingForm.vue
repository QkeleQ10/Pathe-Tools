<script setup lang="ts">
import { onMounted } from 'vue';

const props = defineProps<{
    initialiseDate?: boolean;
}>();

const date = defineModel<Date>({ required: true });

onMounted(() => {
    if (props.initialiseDate) {
        date.value = new Date(Math.ceil((Date.now() + 1) / (5 * 60 * 1000)) * (5 * 60 * 1000));
    }
});

</script>

<template>
    <InputDate v-model="date" class="date-field" />
</template>

<style scoped>
.date-field {
    height: 48px;
    width: 100%;
}
</style>