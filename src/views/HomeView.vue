<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
    <main>
        <section>
            <div class="section-content flex">
                <div style="flex: 50%">
                    <h2>Voor theaters</h2>
                    <h3>Ushering</h3>
                    <div class="flex">
                        <RouterLink to="/ushering/schedule" style="text-decoration: none;">
                            <Button class="primary">
                                <Icon>print</Icon>Tijdenlijstje maken
                            </Button>
                        </RouterLink>
                        <RouterLink to="/ushering/announcer" style="text-decoration: none;">
                            <Button class="secondary">
                                <Icon>alarm</Icon>Omroepen
                            </Button>
                        </RouterLink>
                        <RouterLink to="/ushering/planner" style="text-decoration: none;">
                            <Button class="secondary">
                                <Icon>note_alt</Icon>Planner (bèta)
                            </Button>
                        </RouterLink>
                    </div>
                    <h3>Narrowcasting</h3>
                    <div class="flex">
                        <RouterLink to="/narrowcasting/timetable" style="text-decoration: none;">
                            <Button class="secondary">
                                <Icon>dvr</Icon>CineMec-timetable
                            </Button>
                        </RouterLink>
                    </div>
                </div>
                <div style="flex: 50%">
                    <h2>Voor POC</h2>
                    <div class="flex">
                        <RouterLink to="/poc/intermission" style="text-decoration: none;">
                            <Button class="secondary">
                                <Icon>camera_roll</Icon>Pauzemoment bepalen
                            </Button>
                        </RouterLink>
                    </div>
                </div>
            </div>
        </section>
    </main>
</template>
