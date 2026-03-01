<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
    <main>
        <h1>Voor theaters</h1>
        <h2>Ushering</h2>
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
        <h2>Narrowcasting</h2>
        <div class="flex">
            <RouterLink to="/narrowcasting/timetable" style="text-decoration: none;">
                <Button class="secondary">
                    <Icon>dvr</Icon>CineMec-timetable
                </Button>
            </RouterLink>
        </div>
        <br>
        <h1>Voor POC</h1>
        <div class="flex">
            <RouterLink to="/poc/intermission" style="text-decoration: none;">
                <Button class="secondary">
                    <Icon>camera_roll</Icon>Pauzemoment bepalen
                </Button>
            </RouterLink>
        </div>
    </main>
</template>

<style scoped>
main {
    padding: 32px;
    overflow: auto;
}

.title {
    font: 48px "Special Gothic Condensed One", Arial, Helvetica, sans-serif;
    text-transform: uppercase;
}
</style>