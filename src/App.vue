<script setup lang="ts">
import { provide, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { format } from 'date-fns';
import { useStorage } from '@vueuse/core';

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

const dismissedNotification = useStorage('dismissedNotification', false);

const aboutOpen = ref(false);
</script>

<template>
    <header ref="header" v-if="$route.meta.showHeader ?? true">
        <div class="wrapper">
            <nav v-if="$route.meta.showNavigation ?? true">
                <RouterLink to="/">
                    <Icon>home</Icon>
                </RouterLink>
                <RouterLink to="/ushering/schedule">Tijdenlijstje</RouterLink>
                <RouterLink to="/ushering/announcer">Omroepen</RouterLink>
                <RouterLink to="/narrowcasting/timetable">Timetable</RouterLink>
                <RouterLink to="/poc/intermission">Filmpauze</RouterLink>
            </nav>
            <nav v-else>
            </nav>

            <a @click="aboutOpen = true">
                <Icon>info</Icon>
            </a>

            <div id="clock">{{ format(now, 'HH:mm:ss') }}</div>
        </div>
    </header>

    <RouterView />

    <Transition>
        <ModalDialog v-if="aboutOpen" @dismiss="aboutOpen = false">
            <div class="block" id="faq">
                <div class="svg-icon">
                </div>
                <div class="content">
                    <h3>Problemen of feedback?</h3>
                    <p>Spreek me aan, stuur me een appje of bereik me via e-mail (selecteer het envelop-icoon
                        hieronder).
                    </p>
                    <p><a @click="dismissedNotification = false"
                            style="text-decoration: underline; color: var(--yellow1)">
                            Waarom is de website niet meer zoals eerst?
                        </a></p>
                </div>
            </div>

            <div class="flex icons">
                <a title="E-mail" href="mailto:quinten@althues.nl">
                    <Icon>mail</Icon>
                </a>
                <a title="GitHub" href="https://github.com/QkeleQ10/Pathe-Tools">
                    <Icon>code</Icon>
                </a>
            </div>
            <p>Quinten Althues © 2024-{{ new Date().getFullYear() }}</p>
        </ModalDialog>
    </Transition>

    <Transition>
        <ModalDialog v-if="!dismissedNotification" @dismiss="dismissedNotification = true">
            <p>
                Beste collega,<br>
                <br>
                De website ziet er iets anders (deprimerender) uit dan je gewend bent.
                Dit is zo om te benadrukken dat deze site extern is en geen onderdeel van de Pathé-werkomgevingen.<br>
                <br>
                Ook ontbreekt de cloudfunctionaliteit. Dit om te verzekeren dat interne gegevens (zoals tijdenlijsten)
                nooit met derden kunnen worden gedeeld.<br>
                <br>
                Sommige voorkeuren zijn gereset en synchronisatie werkt niet meer.<br>
                <br>
                Het genereren van tijdenlijstjes en omroepen werkt nog steeds. Sorry voor het ongemak.<br>
                <br>
                Groetjes,<br>
                Quinten
            </p>
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

    border-bottom: 1px solid #fff3;
    box-shadow: 0 2px 4px 0 #0008;

    z-index: 1;

    div.wrapper {
        width: 100%;
        padding-inline: 32px;
        padding-block: 12px;

        display: grid;
        grid-template-columns: 1fr auto auto;
        align-items: center;
    }
}

nav {
    display: flex;
}

nav a {
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

nav a:hover,
nav a.router-link-active,
nav a.active {
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

#faq {
    width: 70%;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 32px;
    margin-top: -132px;
    padding: 48px 64px;

    .svg-icon {
        float: left;
        width: 82px;
        margin-right: 16px;

        svg {
            rotate: -14deg;
        }
    }

    .content {
        margin-top: 8px;

        button {
            margin-top: 16px;
        }
    }

    h3 {
        font-size: 24px;
        margin: 0;
        color: #fff;
    }

    p {
        font-size: 16px;
        margin-block: 8px;
        color: #ffffffb3;
    }
}
</style>
