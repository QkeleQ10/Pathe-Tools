<script setup lang="ts">
import { useFullscreen, useLocalStorage } from '@vueuse/core';
import { ref, computed } from 'vue';

const carousel = ref<HTMLElement>(null);

const imgUrls = ref<string[]>([]);
const currentSlide = ref(0);

const slideDuration = useLocalStorage('slideshow-duration', 60);

const { isFullscreen, enter, exit, toggle } = useFullscreen(carousel);

const isMouseMoving = ref(false);

let mouseMoveTimeout: ReturnType<typeof setTimeout>;
let slideshowTimeout: ReturnType<typeof setTimeout>;

function handleMouseMove() {
    isMouseMoving.value = true;
    clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = setTimeout(() => {
        isMouseMoving.value = false;
    }, 2000);
};

function startSlideshow() {
    clearTimeout(slideshowTimeout);
    slideshowTimeout = setTimeout(() => {
        nextSlide();
        startSlideshow();
    }, slideDuration.value * 1000);
};

function nextSlide() {
    currentSlide.value = ((currentSlide.value + 1) % imgUrls.value.length) || 0;
}

function previousSlide() {
    currentSlide.value = ((currentSlide.value - 1 + imgUrls.value.length) % imgUrls.value.length) || 0;
}
startSlideshow();
</script>

<template>
    <HeroImage />
    <main class="container dark">
        <SlideshowUploadSection v-model="imgUrls" @slide-clicked="currentSlide = $event" />
        <section id="pictures">
            <div class="grid">
                <div>
                    <h2>Diavoorstelling</h2>
                    <div class="carousel" ref="carousel" :class="{ 'mouse-moving': isMouseMoving }"
                        @mousemove="handleMouseMove" @mouseenter="isMouseMoving = true"
                        @mouseleave="isMouseMoving = false">

                        <TransitionGroup name="slide">
                            <img v-for="(url, index) in imgUrls" :key="url" :src="url" v-show="index === currentSlide">
                        </TransitionGroup>


                        <p v-if="!imgUrls.length" class="message">Geen afbeeldingen geüpload</p>

                        <button class="control fullscreen" @click="toggle">
                            <Icon v-if="isFullscreen">fullscreen_exit</Icon>
                            <Icon v-else>fullscreen</Icon>
                        </button>
                        <button class="control previous" @click="previousSlide">
                            <Icon>chevron_left</Icon>
                        </button>
                        <button class="control next" @click="nextSlide">
                            <Icon>chevron_right</Icon>
                        </button>
                        <div class="control dotnav">
                            <button v-for="(url, index) in imgUrls" @click="currentSlide = index"
                                :class="{ active: index === currentSlide }"></button>
                        </div>
                    </div>
                </div>

                <SidePanel>
                    <Tabs>
                        <Tab value="Opties">
                            <fieldset>
                                <legend>Automatische weergave</legend>
                                <InputNumber v-model.number="slideDuration" @change="startSlideshow"
                                    identifier="slideDuration" step="1" min="0" max="240" unit="s">
                                    Seconden per dia
                                    <small v-if="slideDuration > 0">
                                        Elke {{ slideDuration }} seconden wordt de volgende dia getoond.
                                    </small>
                                    <small v-else>
                                        De automatische weergave is uitgeschakeld.
                                    </small>
                                </InputNumber>
                                <ButtonSecondary class="full" @click="currentSlide = 0; startSlideshow(); enter()">
                                    <Icon>play_arrow</Icon>Automatische weergave starten
                                </ButtonSecondary>
                            </fieldset>
                        </Tab>
                    </Tabs>
                </SidePanel>
            </div>
        </section>
    </main>
</template>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: 1fr max(300px, 30%);
    gap: 20px;
}

.carousel {
    position: relative;

    width: 100%;
    aspect-ratio: 16 / 9;

    background-color: #000;
    border: 1px solid #ffffff33;
    border-radius: 6px;

    overflow: hidden;
    cursor: none;

    &:fullscreen {
        border: none;
        border-radius: 0;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    &>.control {
        opacity: 0;
        transition: opacity 200ms;
    }

    &.mouse-moving {
        cursor: default;

        .control {
            opacity: 1;
        }
    }

    &>button {
        position: absolute;

        display: flex;
        justify-content: center;
        align-items: center;
        height: 36px;
        width: 36px;
        padding: 0;

        background-color: #0000008d;
        color: #fff;
        border: 1px solid #ffffff33;
        border-radius: 50%;
        cursor: pointer;

        --size: 22px;

        &.fullscreen {
            top: 16px;
            right: 16px;
        }

        &.previous {
            top: 50%;
            left: 16px;
            translate: 0 -50%;
            --size: 26px;
        }

        &.next {
            top: 50%;
            right: 16px;
            translate: 0 -50%;
            --size: 26px;
        }
    }

    &>.dotnav {
        position: absolute;
        bottom: 16px;
        left: 50%;
        translate: -50%;

        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
        padding: 5px 7px;

        background-color: #0000008d;
        color: #fff;
        border: none;
        border-radius: 50vmax;

        &>button {
            height: 7px;
            width: 7px;
            padding: 0;

            background-color: #ffffff85;
            border: none;
            border-radius: 50%;

            cursor: pointer;

            &.active {
                background-color: #fff;
            }
        }
    }

    .message {
        position: absolute;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        margin: 0;
        text-align: center;
    }
}

.slide-enter-active,
.slide-leave-active {
    position: absolute;
    transition: all 0.5s;
}

.slide-enter-from {
    transform: translateX(20%);
    opacity: 0;
}

.slide-enter-to {
    transform: none;
    opacity: 1;
}

.slide-leave-to {
    transform: scale(0.9);
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {

    .slide-enter-active,
    .slide-leave-active {
        transition: none;
    }
}
</style>
