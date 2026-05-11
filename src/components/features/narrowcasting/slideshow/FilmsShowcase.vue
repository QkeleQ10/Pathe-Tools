<script setup lang="ts">
import { computed } from 'vue';
import { parse } from 'date-fns';
import { PatheApiShow, PatheApiShowDetails, Show } from '@/scripts/types.ts';
import ShowcaseItem from './ShowcaseItem.vue';

const props = defineProps<{
    movies: (PatheApiShow & { frequency: number } & Pick<PatheApiShowDetails, 'synopsis' | 'feelings'>)[];
    shows?: Show[];
}>();

const sortedMovies = computed(() => {
    return props.movies.slice().sort((a, b) => parse(b.releaseAt[0], 'yyyy-MM-dd', new Date()).getTime() - parse(a.releaseAt[0], 'yyyy-MM-dd', new Date()).getTime()).slice(0, 5);
});
</script>

<template>
    <div id="films-playing">
        <div id="header">
            <h3>Wat draait er?</h3>
            <small>
                <slot name="date"></slot>
            </small>
        </div>
        <ShowcaseItem v-for="(movie, i) in sortedMovies" :key="movie.slug" :movie="movie" :i="i" />
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
    font-size: 1.7rem;
}

#header {
    grid-column: 1 / -1;

    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

h3 {
    font: 2.5em "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    text-transform: uppercase;
    margin: 0;
}

.showcase-item {
    grid-column: span 3;

    &.i0 {
        grid-column: span 5;
    }

    &.i1 {
        grid-column: span 4;
    }
}
</style>