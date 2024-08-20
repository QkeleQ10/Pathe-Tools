<script setup>
import { RouterLink } from 'vue-router'

import ButtonPrimary from '@/components/ButtonPrimary.vue'
</script>

<template>
    <main>
        <section>
            <h2>Startpagina</h2>
            <br>
            <RouterLink to="/timetable" style="text-decoration: none;">
                <ButtonPrimary>Tijdenlijstje maken</ButtonPrimary>
            </RouterLink>
            <br>
            <RouterLink to="/announcer" style="text-decoration: none;">
                <!-- <ButtonPrimary>Omroepsysteem</ButtonPrimary> -->
            </RouterLink>
        </section>
    </main>
</template>
