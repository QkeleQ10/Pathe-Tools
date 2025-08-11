<script setup lang="ts">
import { ref } from 'vue';
import { format, parse } from 'date-fns';
import { nl } from 'date-fns/locale';
import { OmdbResponse } from '@/stores/slideshowImages';
import { FastAverageColor } from 'fast-average-color';
import { Show } from '@/classes/classes';

const props = defineProps<{
    omdbMovies: OmdbResponse[];
    shows?: Show[];
}>();

const colors = ref<string[]>([]);

const fac = new FastAverageColor();

async function updateColors() {
    colors.value = await Promise.all(
        props.omdbMovies.map(async (movie) => {
            if (movie?.Poster?.startsWith('http')) {
                try {
                    const result = await fac.getColorAsync(movie.Poster, {
                        ignoredColor: [
                            [255, 255, 255, 255, 100]
                        ]
                    });
                    return result.hex;
                } catch (e) {
                    console.warn(e);
                    return '';
                }
            }
            return '';
        })
    );
    fac.destroy();
}

updateColors();

function formatDuration(duration: string): string {
    const m = duration.match(/(\d+)/);
    if (!m) return duration;
    const mins = +m[1];
    return mins < 60 ? duration : `${Math.floor(mins / 60)}h${mins % 60 ? `${String(mins % 60).padStart(2, '0')}` : ''}`;
}

function formatDate(date: string) {
    try {
        // Parse the input date string (assuming "DD MMM YYYY" format)
        const parsedDate = parse(date, 'dd MMM yyyy', new Date());

        // Format the date according to the specified pattern and locale
        return format(parsedDate, 'dd MMM yyyy', { locale: nl });
    } catch (error) {
        console.error('Error formatting date:', error);
        return date; // Return original string if parsing fails
    }
}
</script>

<template>
    <div id="films-playing">
        <div id="header">
            <h3>Wat draait er?</h3>
            <small>
                <slot name="date"></slot>
            </small>
        </div>
        <div class="showcase-item" v-for="(movie, i) in props.omdbMovies.slice(0, 5)" :key="movie.imdbID"
            :style="{ '--background-color': colors[i], '--animation-delay': `${0.2 * i + 0.2}s` }" :class="`i${i}`">
            <div class="image" :style="{ backgroundImage: `url(${movie.Poster})` }" alt="Movie Poster"></div>
            <div class="details">
                <h4 class="title">{{ movie.Title }}</h4>
                <p class="metadata miscellaneous"><b>
                        {{shows.filter(s => s.title === movie.Title).length}}x &bull; {{ formatDuration(movie.Runtime)
                        }}
                        &bull; {{ movie.Genre }}
                    </b></p>
                <p class="metadata release">
                    <em>Releasedatum: {{ formatDate(movie.Released) }}</em>
                </p>
                <p class="metadata director-actors">
                    <em>Van</em> {{ movie.Director }} <em>met</em> {{ movie.Actors }}
                </p>
                <p class="metadata">
                    {{
                        movie.Ratings.slice(0, 3)
                            .map(item => `${item.Source.replace("Internet Movie Database", "IMDb")}: ${item.Value}`)
                            .join(' • ')
                    }}
                </p>
                <p class="plot">{{ movie.Plot }}</p>
            </div>
        </div>
        <!-- <marquee>{{shows.filter(s => !omdbMovies.find(m => m.Title === s.title)).map(s => s.title).join(' • ')}}
        </marquee> -->
    </div>
</template>

<style scoped>
#films-playing {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: auto 3fr 2fr auto;
    gap: 2.5%;

    height: 100%;

    padding: 5%;
    background-color: #1b1d23;
    background-image: radial-gradient(90% 90% at 0% 100%, #ffffff1a 0%, transparent 100%);
    background-repeat: no-repeat;
    background-size: 340px 100%;
    color: #ffffff;
    font-size: 1.8rem;
}

#header {
    grid-column: 1 / -1;

    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

h3 {
    font: 3em "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    text-transform: uppercase;
    margin: 0;
}

.showcase-item {
    position: relative;
    overflow: hidden;

    grid-column: span 3;

    display: grid;
    grid-template-columns: auto 1fr;
    gap: .7em;

    background-color: var(--background-color);
    border-radius: .25vmax;
    padding: 1vmax;

    /* Fade-in animation */
    animation: fadeInUp 0.6s ease-out both;
    animation-delay: var(--animation-delay, 0s);

    .image {
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: 2 / 3;
        background-size: cover;
        background-position: center;
        border-radius: .25vmax;
    }

    .details {
        overflow: hidden;
    }

    .title {
        margin: 0;
    }

    .metadata {
        margin-block: .25em;
        font-size: .5em;
        overflow: hidden;
        text-wrap: nowrap;
        text-overflow: ellipsis;

        em {
            opacity: .6;
            font-style: normal;
        }
    }

    .miscellaneous {
        margin-bottom: .5em;
    }

    .plot {
        font-size: .6em;
        display: none;
    }

    &.i0,
    &.i1 {
        .plot {
            display: block;
        }
    }

    &.i0 {
        grid-column: span 5;
        font-size: 1.5em;

        .title {
            font-size: 1.25em;
        }
    }

    &.i1 {
        grid-column: span 4;
        font-size: 1.2em;
    }
}

marquee {
    grid-column: 1 / -1;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(20%);
    }

    to {
        opacity: 1;
        transform: none;
    }
}
</style>