<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
    <header>
        <div class="wrapper">
            <RouterLink to="/" class="logo-wrapper">
                <img alt="Pathé logo" class="logo" src="@/assets/logo-01.png" height="46" />
            </RouterLink>

            <nav>
                <RouterLink to="/timetable">Tijdenlijstje</RouterLink>
                <RouterLink to="/announcer">Omroepen</RouterLink>
                <RouterLink to="/intermission-finder">Filmpauze</RouterLink>
            </nav>
        </div>
    </header>

    <RouterView />

    <footer>
        <span>© 2024 Quinten Althues</span>
        <a title="E-mail" href="mailto:quinten@althues.nl">
            <Icon>mail</Icon>
        </a>
        <a title="GitHub" href="https://github.com/QkeleQ10/Pathe-Tools">
            <Icon>code</Icon>
        </a>
    </footer>
</template>

<style scoped>
header {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    height: 70px;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: #ffc426;
    z-index: 10;
}

div.wrapper {
    width: 100%;
    max-width: 1180px;
    padding-left: 20px;
    padding-right: 20px;

    display: grid;
    grid-template-columns: 80px 1fr;
    align-items: center;
}

.logo-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
}

nav {
    display: flex;
}

nav a {
    position: relative;
    padding: 20px;
    color: #4c3c0c;
    font: 700 16px Arial, Helvetica, sans-serif;
    text-decoration: none;
    text-shadow: 0 1px #ffda74;
}

nav a:hover,
nav a.router-link-active {
    color: #151515;
}

nav > a:not(:first-of-type):before {
    border-left: 1px solid #f2b000;
    content: "";
    display: inline-block;
    height: 40px;
    left: 0;
    position: absolute;
    top: 9px;
}

footer {
    height: 70px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;

    background-color: #ffc426;
    z-index: 10;
}

footer a {
    cursor: pointer;
}

footer .icon {
    vertical-align: middle;
}

footer a,
footer span {
    color: #151515;
    text-decoration: none;
}
</style>
