<script setup lang="ts">
import { provide, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { format } from 'date-fns';

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
</script>

<template>
    <header ref="header" v-if="$route.meta.showHeader ?? true">
        <div class="wrapper">
            <RouterLink to="/" id="logo-wrapper">
                <img alt="Pathé logo" class="logo" src="@assets/logo-international-white.svg" height="46" />
            </RouterLink>

            <nav v-if="$route.meta.showNavigation ?? true">
                <RouterLink to="/ushering/schedule">Tijdenlijstje</RouterLink>
                <RouterLink to="/ushering/announcer">Omroepen</RouterLink>
                <RouterLink to="/narrowcasting/timetable">Timetable</RouterLink>
                <RouterLink to="/narrowcasting/slideshow">Diavoorstelling</RouterLink>
                <RouterLink to="/poc/intermission">Filmpauze</RouterLink>
                <RouterLink to="/splitscreen" id="splitscreen-link">
                    <Icon>split_scene</Icon>
                </RouterLink>
            </nav>
            <nav v-else>
                <RouterLink to="/" id="splitscreen-link" class="active">
                    <Icon>split_scene</Icon>
                </RouterLink>
            </nav>

            <div id="clock">{{ format(now, 'HH:mm:ss') }}</div>
        </div>
    </header>

    <HeroImage v-if="$route.meta.showHero !== false"
        :class="{ large: $route.meta.largeHero, small: $route.meta.smallHero, 'zero-height': $route.meta.heroZeroHeight }" />

    <RouterView />

    <footer v-if="$route.meta.showFooter ?? true">

        <div class="block" id="faq">
            <div class="svg-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                    <path fill="#f3d269" style="fill: var(--color17, #f3d269)"
                        d="M27.101 8.292c0.067-0.8-0.529-1.449-1.333-1.449h-17.996c-0.803 0-1.509 0.649-1.577 1.449l-0.884 10.502c-0.067 0.801 0.529 1.449 1.333 1.449h6.443c0.148 0 0.285 0.061 0.378 0.169l3.24 3.761c0.304 0.353 0.92 0.118 0.961-0.368l0.255-3.026c0.025-0.296 0.286-0.536 0.583-0.536h6.137c0.803 0 1.509-0.649 1.577-1.449l0.884-10.502z" />
                    <path fill="#fff" style="fill: var(--color3, #fff)" opacity="0.05"
                        d="M18.337 20.269c-0.215 0.067-0.385 0.258-0.415 0.487-0.001 0.008-0.002 0.016-0.003 0.024l-0.255 3.026c-0.041 0.485-0.657 0.721-0.961 0.368l-3.24-3.761c-0.093-0.108-0.229-0.169-0.378-0.169h-6.443c-0.803 0-1.4-0.649-1.332-1.449l0.884-10.502c0.067-0.8 0.773-1.449 1.577-1.449h17.996c0.803 0 1.4 0.649 1.333 1.449l-0.884 10.502c-0.067 0.801-0.773 1.449-1.577 1.449h-6.137c-0.057 0-0.113 0.009-0.166 0.025zM26.074 3.219h-17.996c-2.812 0-5.282 2.271-5.518 5.073l-0.884 10.502c-0.236 2.802 1.852 5.073 4.664 5.073h5.105l2.404 2.791c2.348 2.726 7.084 0.933 7.448-2.791h3.039c2.812 0 5.282-2.271 5.518-5.073l0.884-10.502c0.236-2.802-1.852-5.073-4.664-5.073z" />
                </svg>
            </div>
            <div class="content">
                <h3>Problemen of feedback?</h3>
                <p>Spreek me aan, stuur me een appje of bereik me via e-mail.</p>
                <!-- <Button class="secondary" @click="sendEmail">E-mail verzenden</Button> -->
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
    </footer>
</template>

<style>
header {
    top: 0;
    left: 0;
    right: 0;
    height: 72px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: linear-gradient(180deg, rgba(28, 29, 31, .5) 26.11%, rgba(28, 29, 31, 0) 100%);

    /* transition: background 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);

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
    } */

    div.wrapper {
        width: 100%;
        /* max-width: 1180px; */
        padding-inline: 32px;
        padding-block: 12px;

        display: grid;
        grid-template-columns: 80px 1fr auto;
        align-items: center;
    }
}

#logo-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    z-index: 10;

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
    margin-right: 2em;
    color: #ffffffb3;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    z-index: 10;

    &#splitscreen-link {
        margin-left: auto;
        margin-right: 16px;

        .icon {
            vertical-align: middle;
        }
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

footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;

    padding-block: 32px;
    margin-top: 164px;

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
