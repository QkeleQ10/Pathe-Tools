<script setup>
function getImageUrl(name) {
    return new URL(`../assets/heroes/${name}.webp`, import.meta.url).href
}
</script>

<template>
    <div class="hero">
        <div class="image" :style="`background-image: url(${getImageUrl(Math.floor(Math.random() * 13))})`">
        </div>
    </div>
</template>

<style scoped>
.hero {
    height: 70px;

    .image {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 370px;
        z-index: -1;

        background-size: cover;
        background-position: center;
        mask-image: linear-gradient(to bottom, #000, #00000041 60%, transparent);
    }

    &.large {
        height: 170px;

        .image {
            height: 500px;
        }
    }
}

@media (prefers-reduced-motion) {
    .hero {
        display: none;
    }
}
</style>