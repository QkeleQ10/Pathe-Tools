<script setup lang="ts">
import { ref } from 'vue';
import { FastAverageColor } from 'fast-average-color';

const imageUrl = ref('');
const color = ref('');

const files = import.meta.glob('../assets/heroes/*.webp', { eager: true });
console.log("files", files);
const randomKey = Object.keys(files)[Math.floor(Math.random() * Object.keys(files).length)];
console.log("randomKey", randomKey);
console.log("default", files[randomKey].default);
imageUrl.value = new URL(randomKey, import.meta.url).href;

const fac = new FastAverageColor();

fac.getColorAsync(imageUrl.value, {
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
    <div id="hero">
        <div class="color-bleed" :style="{ backgroundColor: color }">{{ color }}</div>
        <div class="image" :style="`background-image: url(${imageUrl})`">
        </div>
    </div>
</template>

<style scoped>
#hero {
    height: 70px;
    pointer-events: none;

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

        transition: height 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
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
            height: 900px;
        }
    }

    &.small {
        height: 50px;

        .image {
            height: 250px;
        }

        .color-bleed {
            height: 550px;
        }
    }

    &.zero-height {
        height: 0;
    }
}

/* @media (prefers-reduced-motion) {
    #hero {
        display: none;
    }
} */
</style>