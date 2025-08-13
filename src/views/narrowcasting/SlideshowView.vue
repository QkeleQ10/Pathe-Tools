<script setup lang="ts">
import { ref, computed, onUnmounted, useTemplateRef, onMounted, inject, Ref } from 'vue';
import { useMouse, useDropZone, useFullscreen, useLocalStorage, useUrlSearchParams } from '@vueuse/core';
import { format, parse } from 'date-fns';
import { nl } from 'date-fns/locale';
import { OmdbResponse, useSlideshowImagesStore } from '@/stores/slideshowImages';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';

const slideshowImagesStore = useSlideshowImagesStore();
const tmsScheduleStore = useTmsScheduleStore();
const now = inject<Ref<Date>>('now');

const currentSlide = ref(0);

const movieOmdbList = ref<OmdbResponse[]>([]);
const filmsPlayingSlideValid = computed(() => showFilmsPlayingSlide.value && movieOmdbList.value.length > 0);

async function fetchMovieOmdbList() {
    const shows = tmsScheduleStore.table.map(row => row.title);
    const freqMap = new Map<string, number>();
    shows.forEach(title => {
        freqMap.set(title, (freqMap.get(title) || 0) + 1);
    });
    const sortedTitles = Array.from(freqMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([title]) => title);
    const results = await Promise.allSettled(
        sortedTitles.map(title => slideshowImagesStore.omdb(title))
    );
    movieOmdbList.value = results
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => (result as PromiseFulfilledResult<OmdbResponse>).value)
        .sort((a, b) => parse(b.Released, 'dd MMM yyyy', new Date()).getTime() - parse(a.Released, 'dd MMM yyyy', new Date()).getTime()) as OmdbResponse[];
}

tmsScheduleStore.$subscribe(fetchMovieOmdbList);
onMounted(fetchMovieOmdbList);

const numSlides = computed(() => slideshowImagesStore.images.length + (filmsPlayingSlideValid.value ? 1 : 0));

// OPTIONS

const slideDuration = useLocalStorage('slideshow-duration', 60);
const showFilmsPlayingSlide = useLocalStorage('slideshow-films-playing', true);

// FULLSCREEN TOGGLE

const { isFullscreen, enter, exit, toggle } = useFullscreen(useTemplateRef('carousel'));
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

// MOUSE MOVE HANDLER

const shouldShowControls = ref(false);
let mouseMoveTimeout: ReturnType<typeof setTimeout>;
function handleMouseMove() {
    shouldShowControls.value = true;
    clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = setTimeout(() => {
        shouldShowControls.value = false;
    }, 2000);
};
handleMouseMove();

// DOTNAV PROXIMITY HOVER

const dotnav = useTemplateRef('dotnav');
const { x: mouseX, y: mouseY } = useMouse();
const proximityThreshold = 100;

const shouldExpandDotnav = computed(() => {
    if (!dotnav.value) return false

    const rect = dotnav.value.getBoundingClientRect()

    const withinX = mouseX.value >= rect.left - proximityThreshold &&
        mouseX.value <= rect.right + proximityThreshold

    const withinY = mouseY.value >= rect.top - proximityThreshold &&
        mouseY.value <= rect.bottom + proximityThreshold

    return withinX && withinY
})

// SLIDESHOW CONTROLS

function nextSlide() {
    currentSlide.value = ((currentSlide.value + 1) % numSlides.value) || 0;
}

function previousSlide() {
    currentSlide.value = ((currentSlide.value - 1 + numSlides.value) % numSlides.value) || 0;
}

let slideshowTimeout: ReturnType<typeof setTimeout>;
function startSlideshow() {
    clearTimeout(slideshowTimeout);
    if (slideDuration.value > 0) slideshowTimeout = setTimeout(() => {
        nextSlide();
        startSlideshow();
    }, slideDuration.value * 1000);
};
startSlideshow();

// KEYBOARD CONTROLS

function handleKeydown(event: KeyboardEvent) {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    switch (event.key) {
        case 'ArrowLeft': previousSlide(); break;
        case 'ArrowRight': nextSlide(); break;
        case 'Escape': case 'F11': case 'F5': case 'f': event.preventDefault(); toggleFullscreen(); break;
        default:
            if (!isNaN(Number(event.key))) {
                const slideIndex = Number(event.key) - 1;
                if (slideIndex >= 0 && slideIndex < numSlides.value) {
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

// DROP ZONE HANDLER

const { isOverDropZone } = useDropZone(useTemplateRef('main'), {
    onDrop: slideshowImagesStore.filesUploaded,
    dataTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/*'],
    multiple: true
})
</script>

<template>
    <main ref="main">
        <SlideshowUploadSection />
        <section id="pictures">
            <div class="section-content grid">
                <div>
                    <h2>Diavoorstelling</h2>
                    <div class="carousel" ref="carousel"
                        :class="{ 'mouse-moving': shouldShowControls, 'fake-fullscreen': fakeFullscreen }"
                        @mousemove="handleMouseMove" @mouseenter="shouldShowControls = true"
                        @mouseleave="shouldShowControls = false">

                        <TransitionGroup name="slide">
                            <img class="carousel-slide" v-for="(image, index) in slideshowImagesStore.images"
                                :key="image.name" :src="image.url" v-show="index === currentSlide">
                            <FilmsPlaying class="carousel-slide" v-if="filmsPlayingSlideValid"
                                v-show="currentSlide === numSlides - 1" :omdbMovies="movieOmdbList"
                                :shows="tmsScheduleStore.table">
                                <template #date v-if="'flags' in tmsScheduleStore.metadata">
                                    {{ tmsScheduleStore.metadata.flags.includes('times-only')
                                        ? 'Datum onbekend'
                                        : format(tmsScheduleStore.table[0]?.scheduledTime || 0, 'PPPP', { locale: nl }) }}
                                </template>
                            </FilmsPlaying>
                        </TransitionGroup>

                        <p v-if="['sending', 'receiving'].includes(slideshowImagesStore.status)" class="message">
                            Laden...</p>
                        <p v-else-if="!slideshowImagesStore.images?.length" class="message">Leeg</p>

                        <span class="clock">{{ format(now, 'HH:mm:ss') }}</span>
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
                        <div class="control dotnav" ref="dotnav"
                            :class="{ hoverNearby: shouldExpandDotnav && shouldShowControls }">
                            <button class="dot" v-for="(url, index) in slideshowImagesStore.images"
                                @click="currentSlide = index" :class="{ active: index === currentSlide }">
                                <img :src="url.url" />
                            </button>
                            <button class="dot" v-if="filmsPlayingSlideValid" @click="currentSlide = numSlides - 1"
                                :class="{ active: currentSlide === numSlides - 1 }">
                                <Icon fill>theaters</Icon>
                            </button>
                        </div>
                    </div>
                </div>

                <SidePanel>
                    <h2>Opties</h2>
                    <fieldset>
                        <legend>Algemeen</legend>
                        <InputGroup type="number" id="slideDuration" v-model.number="slideDuration"
                            @change="startSlideshow" step="1" min="1" max="240">
                            <template #label>Volgende dia elke</template>
                            <span class="unit">seconden</span>
                        </InputGroup>
                        <div>
                            <div class="label">Extra dia's</div>
                            <InputCheckbox class="enclose-box" v-model="showFilmsPlayingSlide"
                                identifier="filmsPlaying">
                                Wat draait er?
                            </InputCheckbox>
                        </div>
                        <Button class="secondary full" @click="currentSlide = 0; startSlideshow(); toggleFullscreen()">
                            <Icon>play_arrow</Icon>Automatische weergave starten
                        </Button>
                    </fieldset>
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
    container: size;

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

    .carousel-slide {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    &>.clock {
        position: absolute;
        top: 16px;
        right: 16px;
        color: #ffffffb3;
        font-size: 1.2em;
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
        border-radius: 6px;

        .dot {
            position: relative;
            height: 7px;
            width: 7px;
            padding: 0;

            background-color: #ffffff85;
            border: none;
            outline: none;
            border-radius: 6px;
            overflow: hidden;

            cursor: pointer;
            transition: width 150ms, height 150ms;

            img,
            .icon {
                opacity: 0;
                transition: opacity 150ms;
            }

            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                pointer-events: none;
                position: absolute;
                inset: 0;
                object-fit: cover;
            }

            .icon {
                --size: 32px;
                color: #000;
            }

            &.active {
                background-color: #fff;
            }
        }

        &:hover,
        &.hoverNearby {
            gap: 7px;
            padding: 7px 9px;

            .dot {
                height: 50px;
                width: calc(50px * 16 / 9);
                outline: 1px solid #ffffff33;

                img,
                .icon {
                    opacity: 1;
                }

                &.active {
                    outline-color: #feb91e;
                    outline-width: 2px;
                }
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
</style>
