<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useWindowScroll } from '@vueuse/core';
import { format } from 'date-fns';

const now = ref(new Date())
setInterval(updateNowValue, 1000)
updateNowValue()
function updateNowValue() {
    now.value = new Date();

    // Reload the page at 05:00:00
    if (now.value.getHours() === 5 && now.value.getMinutes() === 0 && now.value.getSeconds() === 0) location.reload();
}
</script>

<template>
    <header ref="header">
        <div class="wrapper">
            <RouterLink to="/" class="logo-wrapper">
                <img alt="Pathé logo" class="logo" src="@/assets/logo-international-white.svg" height="46" />
            </RouterLink>

            <nav>
                <RouterLink to="/timetable">Tijdenlijstje</RouterLink>
                <RouterLink to="/announcer">Omroepen</RouterLink>
                <RouterLink to="/slideshow">Diavoorstelling</RouterLink>
                <RouterLink to="/intermission-finder">Filmpauze</RouterLink>
            </nav>

            <div class="clock">{{ format(now, 'HH:mm:ss') }}</div>
        </div>
    </header>

    <RouterView />

    <footer>
        <div class="flex icons">
            <a title="E-mail" href="mailto:quinten@althues.nl">
                <Icon>mail</Icon>
            </a>
            <a title="GitHub" href="https://github.com/QkeleQ10/Pathe-Tools">
                <Icon>code</Icon>
            </a>
        </div>
        <p>Quinten Althues © 2024-{{ new Date().getFullYear() }}</p>
    </footer>
</template>

<style scoped>
header {
    top: 0;
    left: 0;
    right: 0;
    height: 72px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: linear-gradient(180deg, rgba(28, 29, 31, .5) 26.11%, rgba(28, 29, 31, 0) 100%);

    z-index: 10;
    transition: background 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);

    &.is-sticky {
        position: sticky;
        pointer-events: none;
        background: #1b1d23;
        opacity: 1;
        transform: translateY(-100%);
        transition: all cubic-bezier(.25, .1, .25, 1) .3s allow-discrete;
    }

    &.is-visible {
        transform: translateY(0);
        pointer-events: all;
    }
}

div.wrapper {
    width: 100%;
    /* max-width: 1180px; */
    padding-inline: 32px;
    padding-block: 12px;

    display: grid;
    grid-template-columns: 80px 1fr auto;
    align-items: center;
}

.logo-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;

    &::after {
        position: absolute;
        bottom: 0;
        right: 0;
        content: "TOOLS";
        color: #fff;
        font: 12px "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    }
}

nav {
    margin-left: 32px;
    display: flex;
}

nav a {
    margin-right: 32px;
    color: #ffffffb3;
    font-weight: 500;
    text-decoration: none;
}

nav a:hover,
nav a.router-link-active {
    color: #fff;
    text-shadow: 0px 0px 1px #fff;
}

footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;

    padding-block: 32px;

    background-color: #101114;
    color: #fff;
    z-index: 10;
}

footer a {
    cursor: pointer;
    color: currentColor;
    text-decoration: none;
}

footer .icon {
    vertical-align: middle;
    --size: 24px;
}

footer p {
    font-size: 12px;
    margin: 0;
}

.clock {
    color: #ffffffb3;
    font: 700 16px Arial, Helvetica, sans-serif;
}
</style>
