<script setup lang="ts">
import { RouterLink } from 'vue-router';

import Button from '@/components/Button.vue';
</script>

<template>
    <HeroImage class="large" />
    <main>
        <section class="flex">
            <div style="flex: 50%;">
                <h2>Voor theaters</h2>
                <div class="flex">
                    <RouterLink to="/timetable" style="text-decoration: none;">
                        <Button class="primary">Tijdenlijstje maken</Button>
                    </RouterLink>
                    <RouterLink to="/announcer" style="text-decoration: none;">
                        <Button class="primary">Serviceomroepen</Button>
                    </RouterLink>
                    <RouterLink to="/slideshow" style="text-decoration: none;">
                        <Button class="primary">Diavoorstelling</Button>
                    </RouterLink>
                </div>
            </div>
            <div style="flex: 50%;">
                <h2>Voor POC</h2>
                <div class="flex">
                    <RouterLink to="/intermission-finder" style="text-decoration: none;">
                        <Button class="primary">Pauzemoment bepalen</Button>
                    </RouterLink>
                </div>
            </div>
        </section>
    </main>
</template>
