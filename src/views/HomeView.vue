<script setup>
import { RouterLink } from 'vue-router'

import ButtonPrimary from '@/components/ButtonPrimary.vue'
</script>

<template>
    <main>
        <div class="flex">
            <section>
                <h2>Voor theaters</h2>
                <br>
                <div class="flex">
                    <RouterLink to="/timetable" style="text-decoration: none;">
                        <ButtonPrimary>Tijdenlijstje maken</ButtonPrimary>
                    </RouterLink>
                    <RouterLink to="/announcer" style="text-decoration: none;">
                        <ButtonPrimary style="opacity: 0.05"> </ButtonPrimary>
                    </RouterLink>
                </div>
            </section>
            <section>
                <h2>Voor POC</h2>
                <br>
                <div class="flex">
                    <RouterLink to="/intermission-finder" style="text-decoration: none;">
                        <ButtonPrimary style="opacity: 0.05"> </ButtonPrimary>
                    </RouterLink>
                </div>
            </section>
        </div>
    </main>
</template>
