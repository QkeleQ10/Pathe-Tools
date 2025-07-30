<script setup lang="ts">
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { format } from 'date-fns';
import { TimetableShow } from '@/classes/classes';
import { useCreditsStingersStore } from '@/stores/creditsStingers.ts';

defineProps<{ show: TimetableShow }>();

const stingersStore = useCreditsStingersStore();

const displayScheduledTime = useStorage('display-scheduled-time', true);
const displayMainShowTime = useStorage('display-main-show-time', false);
const displayIntermissionTime = useStorage('display-intermission-time', true);
const displayCreditsTime = useStorage('display-credits-time', true);
const displayEndTime = useStorage('display-end-time', false);
const displayNextStartTime = useStorage('display-next-start-time', false);

const splitExtra = ref(true);
const displayPreshowDuration = useStorage('show-preshow-duration', 1);
const displayCreditsDuration = useStorage('show-credits-duration', 1);
const shortGapInterval = useStorage('short-gap-interval', 10);
const longGapInterval = useStorage('long-gap-interval', 35);

const displayContextMenu = ref(false);
const printRow = ref(true);

async function toggleCreditsStinger(title: string) {
    const trimmedTitle = title?.trim()
    if (!trimmedTitle) return

    try {
        if (stingersStore.stingers.includes(trimmedTitle)) {
            await stingersStore.deleteStinger(trimmedTitle)
        } else {
            await stingersStore.addStinger(trimmedTitle)
        }
    } catch (error) {
        console.error('Failed to toggle post-credits:', error)
    }
}

</script>

<template>
    <tr :class="{
        targeting: displayContextMenu,
        'no-print': !printRow,
        italic: show.auditorium?.includes('4DX'), bold: show.featureRating === '16' || show.featureRating === '18'
    }" @contextmenu.prevent="displayContextMenu = true">
        <td nowrap class="td-auditorium">
            <span contenteditable>
                {{ show.auditorium === 'Rooftop' ? 'RT' :
                    show.auditorium.replace(/^\w+\s/, '') }}
            </span>
        </td>
        <td nowrap class="td-scheduled">
            <span contenteditable>
                {{ displayScheduledTime && show.scheduledTime
                    ? format(show.scheduledTime, 'HH:mm')
                    : '' }}
            </span>
            <span class="preshow-duration" contenteditable
                v-if="displayScheduledTime && (show.scheduledTime && show.mainShowTime) && ((displayPreshowDuration === 1 && show.auditorium?.includes('4DX')) || displayPreshowDuration === 2)">
                +{{ Math.round((show.mainShowTime.getTime() - show.scheduledTime.getTime()) /
                    60000) }}
            </span>
        </td>
        <td nowrap class="td-main">
            <span contenteditable>
                {{ displayMainShowTime && show.mainShowTime
                    ? format(show.mainShowTime, 'HH:mm:ss')
                    : '' }}
            </span>
        </td>
        <td nowrap class="td-intermission">
            <span contenteditable>
                {{ displayIntermissionTime && show.intermissionTime
                    ? format(show.intermissionTime, 'HH:mm:ss')
                    : '' }}
            </span>
        </td>
        <td nowrap class="td-credits">
            <Icon4dx class="plf-icon" src="@/assets/symbols/icon-4dx.svg" v-if="show.isNearPlf" />
            <div class="double-usherout"
                v-if="show.timeToNextUsherout <= shortGapInterval * 60000 && shortGapInterval > 0">
            </div>
            <div class="long-gap" v-if="show.timeToNextUsherout >= longGapInterval * 60000 && longGapInterval > 0">
            </div>
            <div class="plf-overlap" v-if="show.overlapWithPlf"></div>
            <span class="credits-time">
                <span contenteditable>
                    {{ displayCreditsTime && show.creditsTime
                        ? format(show.creditsTime, 'HH:mm:ss')
                        : '' }}
                </span>
                <span class="credits-duration" contenteditable
                    v-if="displayCreditsTime && (show.creditsTime && show.endTime) && ((displayCreditsDuration === 1 && show.hasCreditsStinger) || displayCreditsDuration === 2)">
                    +{{ Math.round((show.endTime.getTime() - show.creditsTime.getTime()) /
                        60000) }}
                </span>
            </span>
        </td>
        <td nowrap class="td-end">
            <span contenteditable>
                {{ displayEndTime && show.endTime
                    ? format(show.endTime, 'HH:mm')
                    : '' }}
            </span>
        </td>
        <td nowrap class="td-next" style="font-weight: normal; font-style: normal;">
            <span contenteditable>
                {{ displayNextStartTime && show.nextStartTime
                    ? format(show.nextStartTime, 'HH:mm')
                    : '' }}
            </span>
        </td>
        <td nowrap class="td-title">
            <span contenteditable>{{ splitExtra ? show.title : show.playlist }}</span>
            <span v-if="splitExtra" contenteditable>{{ show.extras.join(' ') }}</span>
        </td>
        <td nowrap class="age-rating"
            :class="{ translucent: ['AL', '6', '9', '12', '14'].includes(show.featureRating) }">
            <span contenteditable>{{ show.featureRating }}</span>
            <!-- <IconNicamAL class="nicam-icon" v-if="show.featureRating === 'AL'" />
                <IconNicam6 class="nicam-icon" v-else-if="show.featureRating === '6'" />
                <IconNicam9 class="nicam-icon" v-else-if="show.featureRating === '9'" />
                <IconNicam12 class="nicam-icon" v-else-if="show.featureRating === '12'" />
                <IconNicam14 class="nicam-icon" v-else-if="show.featureRating === '14'" />
                <IconNicam16 class="nicam-icon" v-else-if="show.featureRating === '16'" />
                <IconNicam18 class="nicam-icon" v-else-if="show.featureRating === '18'" />
                <span v-else>{{ show.featureRating }}</span> -->
        </td>
    </tr>

    <Transition>
        <ContextMenu v-if="displayContextMenu" class="dark" @click-outside="displayContextMenu = false">
            <button @click="toggleCreditsStinger(show.title); displayContextMenu = false">
                <div class="check" :class="{ 'empty': !stingersStore.stingers.includes(show.title?.trim()) }">
                </div>
                Post-credits-scène bij {{ show.title }}
            </button>
            <button @click="printRow = !printRow; displayContextMenu = false">
                <div class="check" :class="{ 'empty': printRow }"></div>
                Voorstelling verwijderen uit lijst
            </button>
        </ContextMenu>
    </Transition>
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
        left: -14px;
        height: 11px;
        translate: 0 -50%;
        fill: var(--color);
    }

    .double-usherout {
        position: absolute;
        top: 50%;
        left: 25px;
        height: 100%;
        width: 22px;
        border-radius: 50%;
        outline: 2px solid var(--color);
        clip-path: inset(-3px calc(100% - 5px) -3px -3px);
        opacity: .5;
    }

    .long-gap {
        position: absolute;
        bottom: -1px;
        left: 26px;
        width: 62px;
        border-bottom: 2px dotted var(--color);
        opacity: .5;
    }

    .plf-overlap {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 18px;
        border-left: 2px dashed var(--color);
        opacity: .5;
    }

    .credits-duration,
    .preshow-duration {
        opacity: .4;
        font-weight: normal;
        font-style: normal;
    }

    &.age-rating {
        text-align: end;
        min-width: 21px;
    }

    .nicam-icon {
        fill: var(--color);
        position: absolute;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        width: 16px;
        height: 16px;
    }
}

.td-main,
.td-end,
.td-next {
    opacity: .5;
}

.td-credits {
    padding-left: 32px;
}

.td-title {
    display: flex;
    height: var(--row-height);
    align-items: center;
    justify-content: space-between;
}

[contenteditable]:hover {
    outline: 1px solid #ffffff88;
    outline-offset: -1px;
    background-color: #ffc52631;
}

[contenteditable]:focus-visible {
    outline: 1px solid #ffc426;
    outline-offset: -1px;
    background-color: #ffc52631;
}
</style>