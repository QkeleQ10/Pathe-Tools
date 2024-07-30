<script setup>
import { RouterLink } from 'vue-router'

import ButtonPrimary from '@/components/ButtonPrimary.vue'
</script>

<template>
    <main>
        <section>
            <h2>Startpagina</h2>
            <RouterLink to="/timetable" style="text-decoration: none;">
                <ButtonPrimary>Tijdenlijstje maken</ButtonPrimary>
            </RouterLink>
        </section>
    </main>
</template>
