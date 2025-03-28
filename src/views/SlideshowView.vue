<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useDropZone, useFullscreen, useLocalStorage, useUrlSearchParams } from '@vueuse/core';
import { useSlideshowImagesStore } from '@/stores/slideshowImages';

const carousel = ref<HTMLElement>(null);
const main = ref<HTMLElement>(null)

const store = useSlideshowImagesStore();
const currentSlide = ref(0);

const slideDuration = useLocalStorage('slideshow-duration', 60);

const { isFullscreen, enter, exit, toggle } = useFullscreen(carousel);

const params = useUrlSearchParams('history');
const fakeFullscreen = ref(params.fullscreen === 'true');

function toggleFullscreen() {
    if (isFullscreen.value || fakeFullscreen.value) {
        fakeFullscreen.value = false;
        exit();
    } else {
        enter();
    }
}

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
handleMouseMove();

function nextSlide() {
    currentSlide.value = ((currentSlide.value + 1) % store.images.length) || 0;
}

function previousSlide() {
    currentSlide.value = ((currentSlide.value - 1 + store.images.length) % store.images.length) || 0;
}

function startSlideshow() {
    clearTimeout(slideshowTimeout);
    slideshowTimeout = setTimeout(() => {
        nextSlide();
        startSlideshow();
    }, slideDuration.value * 1000);
};
startSlideshow();

function handleKeydown(event: KeyboardEvent) {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    switch (event.key) {
        case 'ArrowLeft': previousSlide(); break;
        case 'ArrowRight': nextSlide(); break;
        case 'Escape': case 'F11': case 'F5': case 'f': event.preventDefault(); toggleFullscreen(); break;
        default:
            if (!isNaN(Number(event.key))) {
                const slideIndex = Number(event.key) - 1;
                if (slideIndex >= 0 && slideIndex < store.images.length) {
                    currentSlide.value = slideIndex;
                }
            }
            break;
    }
}

window.addEventListener('keydown', handleKeydown);

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
});

const { isOverDropZone } = useDropZone(main, {
    onDrop: store.filesUploaded,
    dataTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/*'],
    multiple: true
})
</script>

<template>
    <main ref="main">
        <HeroImage />
        <SlideshowUploadSection @slide-clicked="currentSlide = $event" />
        <section id="pictures">
            <div class="grid">
                <div>
                    <h2>Diavoorstelling</h2>
                    <div class="carousel" ref="carousel"
                        :class="{ 'mouse-moving': isMouseMoving, 'fake-fullscreen': fakeFullscreen }"
                        @mousemove="handleMouseMove" @mouseenter="isMouseMoving = true"
                        @mouseleave="isMouseMoving = false">

                        <TransitionGroup name="slide">
                            <img v-for="(url, index) in store.images" :key="url" :src="url"
                                v-show="index === currentSlide">
                        </TransitionGroup>

                        <p v-if="['sending', 'receiving'].includes(store.status)" class="message">Laden...</p>
                        <p v-else-if="!store.images?.length" class="message">Leeg</p>

                        <button class="control fullscreen" @click="toggleFullscreen">
                            <Icon v-if="isFullscreen || fakeFullscreen">fullscreen_exit</Icon>
                            <Icon v-else>fullscreen</Icon>
                        </button>
                        <button class="control previous" @click="previousSlide">
                            <Icon>chevron_left</Icon>
                        </button>
                        <button class="control next" @click="nextSlide">
                            <Icon>chevron_right</Icon>
                        </button>
                        <div class="control dotnav">
                            <button v-for="(url, index) in store.images" @click="currentSlide = index"
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
                                    identifier="slideDuration" step="1" min="1" max="240" unit="s">
                                    Seconden per dia
                                    <small v-if="slideDuration > 0">
                                        Elke {{ slideDuration }} seconden wordt de volgende dia getoond.
                                    </small>
                                    <small v-else>
                                        De automatische weergave is uitgeschakeld.
                                    </small>
                                </InputNumber>
                                <Button class="secondary full"
                                    @click="currentSlide = 0; startSlideshow(); toggleFullscreen()">
                                    <Icon>play_arrow</Icon>Automatische weergave starten
                                </Button>
                            </fieldset>
                        </Tab>
                    </Tabs>
                </SidePanel>
            </div>
        </section>
        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand(en) te uploaden
        </div>
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

    &:fullscreen,
    &.fake-fullscreen {
        border: none;
        border-radius: 0;
    }

    &.fake-fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        aspect-ratio: unset;
        z-index: 1000;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        pointer-events: none;
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
