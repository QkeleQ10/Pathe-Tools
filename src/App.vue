<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
    <header>
        <div class="wrapper">
            <RouterLink to="/">
                <img alt="Pathé logo" class="logo" src="@/assets/logo-01.png" height="46" />
            </RouterLink>

            <nav>
                <RouterLink to="/timetable">Tijdenlijstje</RouterLink>
            </nav>
        </div>
    </header>

    <RouterView />

    <footer>
        <span>© 2024 Quinten Althues</span>
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
    padding-inline: 20px;

    display: grid;
    grid-template-columns: 80px 1fr;
    align-items: center;
}

img.logo {
    justify-self: center;
}

nav {
    display: flex;
}

nav a {
    padding: 20px;
    color: #4c3c0c;
    font: 700 16px Arial, Helvetica, sans-serif;
    text-decoration: none;
    text-shadow: 0 1px #ffda74;
}

main {
    min-height: calc(100vh - 70px);
}

footer {
    height: 70px;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: #ffc426;
    z-index: 10;
}

footer a,
footer span {
    color: #151515;
    text-decoration: none;
}
</style>
