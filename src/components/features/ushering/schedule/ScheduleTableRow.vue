<script setup lang="ts">
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { format } from 'date-fns';
import { TimetableShow } from '@/scripts/types.ts';
import Icon4dx from '@/assets/symbols/Icon4dx.vue';
import { defaultColumns, colTypes } from './ColsBuilder.vue';

defineProps<{ show: TimetableShow }>();

const stingers = useStorage<string[]>('credits-stingers', []);

const columns = useStorage<{ type: string; width: number }[]>('schedule-columns', defaultColumns);

const displayPreshowDuration = useStorage('show-preshow-duration', 1);
const displayCreditsDuration = useStorage('show-credits-duration', 1);
const shortGapInterval = useStorage('short-gap-interval', 10);
const longGapInterval = useStorage('long-gap-interval', 35);

const displayContextMenu = ref(false);
const printRow = ref(true);

function toggleCreditsStinger(title: string) {
    const trimmedTitle = title?.trim()
    if (!trimmedTitle) return

    try {
        if (stingers.value.includes(trimmedTitle)) {
            stingers.value.splice(stingers.value.indexOf(trimmedTitle), 1)
        } else {
            stingers.value.push(trimmedTitle)
        }
    } catch (error) {
        console.error('Failed to toggle post-credits:', error)
    }
}
</script>

<template>
    <InvokableContextMenu v-model:active="displayContextMenu" menu-class="dark">
        <template #anchor>
            <tr :class="{
                targeting: displayContextMenu,
                'no-print': !printRow,
                italic: show.auditorium?.includes('4DX'), bold: show.featureRating === '16' || show.featureRating === '18',
                'final-show': !show.nextStartTime
            }">
        <template v-for="col in columns" :key="col.type">
            <td nowrap :class="{
                ['td-' + col.type]: true,
                translucent: col.type === 'ageRating' && ['AL', '6', '9', '12', '14'].includes(show.featureRating)
            }" :style="col.type === 'nextStartTime' ? 'font-weight: normal; font-style: normal;' : ''">

                <template v-if="col.type === 'scheduledTime'">

                    <span contenteditable>
                        {{ show.scheduledTime
                            ? format(show.scheduledTime, 'HH:mm')
                            : '' }}
                    </span>
                    <span class="preshow-duration" contenteditable
                        v-if="(show.scheduledTime && show.mainShowTime) && ((displayPreshowDuration === 1 && show.auditorium?.includes('4DX')) || displayPreshowDuration === 2)">
                        +{{ Math.round((show.mainShowTime.getTime() - show.scheduledTime.getTime()) /
                            60000) }}
                    </span>

                </template>

                <template v-else-if="col.type === 'creditsTime'">

                    <Icon4dx class="plf-icon" src="@assets/symbols/icon-4dx.svg" v-if="show.isNearPlf" />
                    <div class="double-usherout"
                        v-if="show.timeToNextUsherout <= shortGapInterval * 60000 && shortGapInterval > 0">
                    </div>
                    <div class="long-gap"
                        v-if="show.timeToNextUsherout >= longGapInterval * 60000 && longGapInterval > 0">
                    </div>
                    <div class="plf-overlap" v-if="show.overlapWithPlf"></div>
                    <span class="credits-time">
                        <span contenteditable
                            :style="{ opacity: show.creditsTime.getTime() === show.endTime.getTime() ? '.5' : '1' }">
                            {{ show.creditsTime
                                ? format(show.creditsTime, 'HH:mm:ss')
                                : '' }}
                        </span>
                        <span class="credits-duration" contenteditable
                            v-if="(show.creditsTime && show.endTime) && ((displayCreditsDuration === 1 && show.hasCreditsStinger) || displayCreditsDuration === 2)">
                            +{{ Math.round((show.endTime.getTime() - show.creditsTime.getTime()) /
                                60000) }}
                        </span>
                    </span>
                    <Icon v-if="!show.nextStartTime" class="final-show">dark_mode</Icon>

                </template>

                <template v-else-if="col.type === 'title'">

                    <span contenteditable>
                        {{colTypes.find(c => c.value === col.type).content(show)}}
                    </span>

                    <span contenteditable>
                        {{ show.extras.join(' ') }}
                    </span>

                </template>

                <template v-else>
                    <span contenteditable>
                        {{colTypes.find(c => c.value === col.type).content(show)}}
                    </span>
                </template>

            </td>
        </template>
            </tr>
        </template>
        
        <template #menu>
            <button @click="toggleCreditsStinger(show.title); displayContextMenu = false">
                <div class="check" :class="{ 'empty': !stingers.includes(show.title?.trim()) }">
                </div>
                Post-credits-scène bij {{ show.title }}
            </button>
            <button @click="printRow = !printRow; displayContextMenu = false">
                <div class="check" :class="{ 'empty': printRow }"></div>
                Voorstelling verwijderen uit lijst
            </button>
        </template>
    </InvokableContextMenu>
</template>

<style scoped>
tr {
    font: inherit;
    height: var(--row-height);
    background-color: var(--row-color);

    &:nth-of-type(even) {
        background-color: var(--banded-row-color);
    }

    &.no-print {
        display: none;
    }

    &.targeting {
        background-color: #ffc52631;
    }

    &.italic {
        font-style: italic;
    }

    &.bold {
        font-weight: bold;
    }
}

tr:first-of-type>td .plf-icon {
    transform: translateY(50%);
}

td {
    position: relative;
    padding: 2px 6px;

    .plf-icon {
        position: absolute;
        top: 0;
        left: -3em;
        height: .88em;
        translate: 0 -50%;
        fill: var(--color);
    }

    .double-usherout {
        position: absolute;
        top: 50%;
        left: 0em;
        height: 100%;
        width: 1.76em;
        border-radius: 50%;
        outline: 2px solid var(--color);
        clip-path: inset(-.24em calc(100% - 5px) -.24em -.24em);
        opacity: .5;
    }

    .long-gap {
        position: absolute;
        bottom: -1px;
        left: 0em;
        width: 4.96em;
        border-bottom: 2px dotted var(--color);
        opacity: .5;
    }

    .plf-overlap {
        position: absolute;
        top: 0;
        bottom: 0;
        left: -0.5em;
        border-left: 2px dashed var(--color);
        opacity: .5;
    }

    .credits-duration,
    .preshow-duration {
        opacity: .4;
        font-weight: normal;
        font-style: normal;
    }

    .nicam-icon {
        fill: var(--color);
        position: absolute;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        width: 1.28em;
        height: 1.28em;
    }

    .final-show {
        position: absolute;
        left: 6.4em;
        --size: 12px;
        opacity: .5;
    }
}

.td-auditorium {
    overflow: hidden;
}

.td-mainShowTime,
.td-endTime,
.td-nextStartTime {
    opacity: .5;
}

.td-title {
    height: var(--row-height);
    overflow: hidden;
    text-overflow: ellipsis;

    &>span:last-child {
        float: right;
    }
}

.td-ageRating {
    text-align: end;
    min-width: 1.68em;
    padding-left: 0;
}

[contenteditable]:hover {
    outline: 1px solid #ffffff88;
    outline-offset: -1px;
    background-color: #ffc52631;
}

[contenteditable]:focus-visible {
    outline: 1px solid var(--yellow1);
    outline-offset: -1px;
    background-color: #ffc52631;
}

.check {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    border: 2px solid currentColor;
    border-radius: 3px;
    position: relative;
}

.check:not(.empty)::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
}
</style>