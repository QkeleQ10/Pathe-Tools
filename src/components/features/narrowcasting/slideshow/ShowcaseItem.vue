<script setup lang="ts">
import { format, parse } from 'date-fns';
import { nl } from 'date-fns/locale';
import { PatheApiShow, PatheApiShowDetails } from '@/scripts/types';
import IconRateBad from '@/assets/symbols/IconRateBad.vue';
import IconRate from '@/assets/symbols/IconRate.vue';
import IconRateHigh from '@/assets/symbols/IconRateHigh.vue';
import { computed } from 'vue';
import IconAdded from '@/assets/symbols/IconAdded.vue';
import IconNicam16 from '@/assets/symbols/IconNicam16.vue';
import IconNicam18 from '@/assets/symbols/IconNicam18.vue';

const props = defineProps<{
    movie: PatheApiShow & { frequency: number } & Pick<PatheApiShowDetails, 'synopsis' | 'feelings'>;
    i: number;
}>();

const cumulativeFeeling = computed(() => (props.movie.feelings.countEmotionDisappointed + props.movie.feelings.countEmotionLike + props.movie.feelings.countEmotionLove))

function formatDuration(minutes: number): string {
    return minutes < 60 ? `${minutes}` : `${Math.floor(minutes / 60)}h${minutes % 60 ? `${String(minutes % 60).padStart(2, '0')}` : ''}`;
}

function formatDate(date: string) {
    try {
        // Parse the input date string (assuming "YYYY-MM-DD" format)
        const parsedDate = parse(date, 'yyyy-MM-dd', new Date());

        // Format the date according to the specified pattern and locale
        return format(parsedDate, 'dd MMM yyyy', { locale: nl });
    } catch (error) {
        console.error('Error formatting date:', error);
        return date; // Return original string if parsing fails
    }
}

function formatSentenceCase(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatSynopsis(synopsis: string): string {
    return synopsis.replace(/<br\s*\/?>/g, '\n');
}
</script>

<template>
    <div class="showcase-item" :key="movie.slug"
        :style="{ backgroundColor: movie.backgroundDominantColor, '--animation-delay': `${0.2 * i + 0.2}s` }"
        :class="`i${i}`">
        <img class="background" :src="movie.backgroundPath.lg">
        <div class="image" :style="{ backgroundImage: `url(${movie.posterPath.lg})` }" alt="Movie Poster"></div>
        <div class="details">
            <h4 class="title">{{ movie.title }}</h4>
            <p class="metadata miscellaneous"><b>
                    {{ movie.frequency }}x &bull; {{ formatDuration(movie.duration)
                    }}
                    &bull; {{ formatSentenceCase(movie.genres.join(', ').toLowerCase()) }}
                </b>
                <IconNicam16 v-if="movie.contentRating.ref === '-16ans'" />
                <IconNicam18 v-if="movie.contentRating.ref === '-18ans'" />
            </p>
            <p class="metadata release">
                <em>Releasedatum: {{ formatDate(movie.releaseAt[0]) }}</em>
            </p>
            <div class="plot-wrapper">
                <p class="plot">{{ formatSynopsis(movie.synopsis) }}</p>
            </div>
            <div class="feelings" v-if="cumulativeFeeling > 10">
                <div class="feeling"
                    :style="{ flexBasis: `${(movie.feelings.countEmotionDisappointed + 1) / (cumulativeFeeling + 3) * 100}%` }">
                    <IconRateBad /> {{ movie.feelings.countEmotionDisappointed }}
                </div>
                <div class="feeling"
                    :style="{ flexBasis: `${(movie.feelings.countEmotionLike + 1) / (cumulativeFeeling + 3) * 100}%` }">
                    <IconRate /> {{ movie.feelings.countEmotionLike }}
                </div>
                <div class="feeling"
                    :style="{ flexBasis: `${(movie.feelings.countEmotionLove + 1) / (cumulativeFeeling + 3) * 100}%` }">
                    <IconRateHigh /> {{ movie.feelings.countEmotionLove }}
                </div>
            </div>
            <div class="feelings" v-else>
                <div>
                    <IconAdded /> {{ movie.feelings.countWishList }}x op watchlist
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.showcase-item {
    --accent: transparent;

    position: relative;
    overflow: hidden;

    display: grid;
    grid-template-columns: auto 1fr;
    gap: .7em;

    background-color: var(--accent);
    border-radius: .35vmax;
    padding: 1vmax;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

    /* Fade-in animation */
    animation: fadeInUp 0.6s ease-out both;
    animation-delay: var(--animation-delay, 0s);

    .background {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: -1;
        mask-image: linear-gradient(to right, rgba(0, 0, 0, .25) 50%, rgba(0, 0, 0, 0) 100%);
    }

    .image {
        max-width: 100%;
        max-height: 100%;
        aspect-ratio: 2 / 3;
        background-size: cover;
        background-position: center;
        border-radius: .25vmax;
        box-shadow: 0 0 0 1px #fff3, 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .details {
        display: grid;
        grid-template-rows: auto auto auto 1fr auto;
        height: 100%;
        overflow: hidden;

        svg {
            height: 1.3em;
            vertical-align: -0.25em;
            fill: #fff;
        }
    }

    .title {
        margin: 0;
    }

    .metadata {
        margin-top: 0;
        margin-bottom: 0;
        font-size: .5em;
        /* overflow: hidden; */
        /* text-wrap: nowrap; */
        text-overflow: ellipsis;

        em {
            opacity: .6;
            font-style: normal;
        }
    }

    .miscellaneous {
        margin-bottom: .5em;

        svg {
            margin-left: .5em;
        }
    }

    .plot-wrapper {
        overflow: hidden;
        mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) calc(100% - 1em), rgba(0, 0, 0, 0) 100%);
    }

    .plot {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        font-size: .45em;
        display: none;
    }

    .feelings {
        display: flex;
        gap: 5px;
        font-size: .45em;
        overflow: hidden;

        .feeling {
            position: relative;
            flex: 1 1 0px;
            overflow: visible;
            text-wrap: nowrap;
            padding-bottom: 5px;

            &::after {
                content: '';
                position: absolute;
                height: 5px;
                bottom: 0;
                left: 0;
                right: 0;
                background-color: #fff;
                border-radius: 50vmax;
            }
        }
    }

    &.i0,
    &.i1 {
        .plot {
            display: block;
        }
    }

    &.i0 {
        font-size: 1.3em;

        .title {
            font-size: 1.25em;
        }
    }

    &.i1 {
        font-size: 1.15em;
    }
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