<script setup lang="ts">
import { provide, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { format } from 'date-fns';
import { useStorage, useWindowSize } from '@vueuse/core';

const { width: windowWidth, height: windowHeight } = useWindowSize()

const now = ref(new Date())
setInterval(updateNowValue, 1000)
updateNowValue()
function updateNowValue() {
    now.value = new Date();
}
provide('now', now);

const userHasInteracted = ref(false);
document.addEventListener('click', () => userHasInteracted.value = true, { once: true });
provide('userHasInteracted', userHasInteracted);

const aboutOpen = ref(false);
</script>

<template>
    <header ref="header" v-if="$route.meta.showHeader ?? true">
        <div class="wrapper">
            <nav v-if="$route.meta.showNavigation ?? true">
                <!-- <RouterLink to="/">
                    <Icon>home</Icon>
                </RouterLink> -->

                <RouterLink to="/" id="logo-wrapper">
                    <img alt="Pathé logo" class="logo" src="@assets/logo-international-white.svg" height="42" />
                </RouterLink>

                <template v-if="windowWidth >= 768">
                    <RouterLink to="/ushering/schedule">Tijdenlijstje</RouterLink>
                    <RouterLink to="/ushering/announcer">Omroepen</RouterLink>
                    <RouterLink to="/ushering/planner">Planner</RouterLink>
                    <RouterLink to="/narrowcasting/timetable">Timetable</RouterLink>
                    <RouterLink to="/poc/intermission">Filmpauze</RouterLink>
                </template>
            </nav>
            <nav v-else>
            </nav>

            <div class="flex" style="align-items: center; gap: 0;">
                <a @click="aboutOpen = true" title="Over deze website">
                    <Icon>help</Icon>
                </a>
                <div id="clock">{{ format(now, 'HH:mm:ss') }}</div>
            </div>
        </div>
    </header>

    <HeroImage />

    <RouterView />

    <Transition>
        <ModalDialog v-if="aboutOpen" @dismiss="aboutOpen = false">
            <h3>Over</h3>
            <p>Quinten Althues © 2024-{{ new Date().getFullYear() }}</p>
            <p>
                Deze website is niet officieel verbonden aan Pathé.
            </p>
            <p>
                <b>Problemen of feedback?</b> Bereik me via e-mail (knop hieronder), stuur me een appje of zoek me eens
                op
                bij Pathé Utrecht Leidsche Rijn!
            </p>
            <div class="flex" style="gap: 24px;">
                <Button class="tertiary" title="E-mail" href="mailto:quinten@althues.nl">
                    E-mail
                </Button>
                <Button class="tertiary" title="GitHub" href="https://github.com/QkeleQ10/Pathe-Tools">
                    GitHub
                </Button>
            </div>
        </ModalDialog>
    </Transition>
</template>

<style>
#app {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100dvh;
    overflow: hidden;
}

header {
    top: 0;
    left: 0;
    right: 0;
    height: 72px;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: #111316;
    background-color: #111316dd;
    border-bottom: 1px solid #fff3;
    box-shadow: 0 2px 4px 0 #0008;

    z-index: 1;
    overflow-x: auto;

    div.wrapper {
        width: 100%;
        padding-inline: 32px;
        padding-block: 12px;

        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
    }
}

#logo-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;

    opacity: .7;

    &::after {
        position: absolute;
        bottom: 0;
        right: 0;
        content: "TOOLS";
        color: #fff;
        font: 11px "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    }

    &.router-link-active {
        opacity: 1;
    }
}

nav {
    display: flex;
    align-items: center;
}

header a {
    margin-right: 2em;
    color: #ffffffb3;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    z-index: 10;

    &>.icon {
        vertical-align: middle;
    }
}

header a:hover,
header a.router-link-active,
header a.active {
    color: #fff;
    text-shadow: 0px 0px 1px #fff;

    .icon {
        font-variation-settings: "FILL" 1;
    }
}

#app>.content {
    overflow-y: auto;
}

#clock {
    color: #ffffffb3;
}
</style>
