<script setup lang="ts">
import { FastAverageColor } from 'fast-average-color';
import { ref } from 'vue';

const imageUrl = new URL(`../assets/heroes/${Math.floor(Math.random() * 13)}.webp`, import.meta.url).href
const color = ref('');

const fac = new FastAverageColor();

fac.getColorAsync(imageUrl, {
    ignoredColor: [
        [255, 255, 255, 255, 100]
    ]
})
    .then(result => {
        color.value = result.hex;
        fac.destroy();
    })
    .catch(console.error);

</script>

<template>
    <div class="hero">
        <div class="color-bleed" :style="{ backgroundColor: color }">{{ color }}</div>
        <div class="image" :style="`background-image: url(${imageUrl})`">
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
        height: 350px;
        z-index: -1;

        background-size: cover;
        background-position: center;
        mask-image: linear-gradient(to bottom, #000, #00000041 60%, transparent);
    }

    .color-bleed {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 750px;
        z-index: -1;

        mask-image: linear-gradient(to bottom, #00000031 60%, transparent);
    }

    &.large {
        height: 170px;

        .image {
            height: 450px;
        }

        .color-bleed {
            height: 850px;
        }
    }
}

/* @media (prefers-reduced-motion) {
    .hero {
        display: none;
    }
} */
</style>