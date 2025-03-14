<script setup lang="ts">
import { RouterLink } from 'vue-router';

import ButtonPrimary from '@/components/ButtonPrimary.vue';
</script>

<template>
    <HeroImage class="large" />
    <main class="container dark">
        <section class="flex">
            <div style="flex: 50%;">
                <h2>Voor theaters</h2>
                <div class="flex">
                    <RouterLink to="/timetable" style="text-decoration: none;">
                        <ButtonPrimary>Tijdenlijstje maken</ButtonPrimary>
                    </RouterLink>
                    <RouterLink to="/announcer" style="text-decoration: none;">
                        <ButtonPrimary>Serviceomroepen</ButtonPrimary>
                    </RouterLink>
                    <!-- <RouterLink to="/slideshow" style="text-decoration: none;">
                        <ButtonPrimary>Diavoorstelling</ButtonPrimary>
                    </RouterLink> -->
                </div>
            </div>
            <div style="flex: 50%;">
                <h2>Voor POC</h2>
                <div class="flex">
                    <RouterLink to="/intermission-finder" style="text-decoration: none;">
                        <ButtonPrimary>Pauzemoment bepalen</ButtonPrimary>
                    </RouterLink>
                </div>
            </div>
        </section>
    </main>
</template>
