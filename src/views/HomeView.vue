<script setup lang="ts">
import { RouterLink } from 'vue-router';

import Button from '@/components/Button.vue';
</script>

<template>
    <HeroImage class="large" />
    <main>
        <section>
            <div>
                <h2>Voor theaters</h2>
                <div class="flex">
                    <RouterLink to="/timetable" style="text-decoration: none;">
                        <Button class="primary">
                            <Icon>list_alt</Icon>Tijdenlijstje maken
                        </Button>
                    </RouterLink>
                    <RouterLink to="/announcer" style="text-decoration: none;">
                        <Button class="secondary">
                            <Icon>text_to_speech</Icon>Serviceomroepen
                        </Button>
                    </RouterLink>
                    <RouterLink to="/slideshow" style="text-decoration: none;">
                        <Button class="secondary">
                            <Icon>present_to_all</Icon>Diavoorstelling
                        </Button>
                    </RouterLink>
                    <RouterLink to="/narrowcasting" style="opacity: 0.1; text-decoration: none;">
                        <Button class="secondary">
                            <Icon>code</Icon>Datadump
                        </Button>
                    </RouterLink>
                </div>
            </div>
        </section>
        <section>
            <div>
                <h2>Voor POC</h2>
                <div class="flex">
                    <RouterLink to="/intermission-finder" style="text-decoration: none;">
                        <Button class="secondary">
                            <Icon>camera_roll</Icon>Pauzemoment bepalen
                        </Button>
                    </RouterLink>
                </div>
            </div>
        </section>
    </main>
</template>
