<script setup lang="ts">
const model = defineModel<{
    type: string;
    width: number;
}[]>();

const colTypes = [
    { label: 'Zaal', value: 'auditorium', icon: 'text_fields' },
    { label: 'Inloop', value: 'scheduledTime', icon: 'schedule' },
    { label: 'Start hoofdfilm', value: 'mainShowTime', icon: 'schedule' },
    { label: 'Pauze', value: 'intermissionTime', icon: 'schedule' },
    { label: 'Aftiteling', value: 'creditsTime', icon: 'schedule' },
    { label: 'Einde voorstelling', value: 'endTime', icon: 'schedule' },
    { label: 'Volgende inloop', value: 'nextStartTime', icon: 'schedule' },
    { label: 'Filmtitel', value: 'title', icon: 'text_fields' },
    { label: 'Leeftijdskeuring', value: 'ageRating', icon: 'text_fields' },
];

const totalWidth = 183;
</script>

<template>

</template>

<style scoped></style>