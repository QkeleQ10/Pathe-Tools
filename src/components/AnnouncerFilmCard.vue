<script setup lang="ts">
import { format } from 'date-fns';
import { AnnouncementTypes, AnnouncerShow } from '@/classes/classes';

const props = defineProps<{
    show: AnnouncerShow;
}>();

function formatTimeLeft(timeInMs: number) {
    if (timeInMs < 60000) {
        return Math.floor(timeInMs / 1000) + ' s'
    } else if (timeInMs < 600000) {
        return Math.floor(timeInMs / 60000) + ':' + String(Math.floor((timeInMs % 60000) / 1000)).padStart(2, '0') + ' min'
    } else if (timeInMs < 3600000) {
        return Math.floor(timeInMs / 60000) + ' min'
    } else {
        return Math.floor(timeInMs / 3600000) + ':' + String(Math.floor((timeInMs % 3600000) / 60000)).padStart(2, '0') + ' h'
    }
}
</script>

<template>
    <div class="film">
        <div class="room">
            {{ (show.auditorium === 'PULR 8' || show.auditorium
                ===
                'Rooftop') ? 'RT' :
                show.auditoriumNumber }}
        </div>
        <div class="title">{{ show.title }}</div>
        <div class="time">
            {{ format(show.scheduledTime, 'HH:mm') }} –
            {{ format(show.endTime, 'HH:mm:ss') }}</div>
        <div class="flex chips">
            <Chip v-for="extra in show.extras" :class="{ 'translucent-white': extra !== '4DX' }">
                {{ extra }}
            </Chip>
        </div>
        <div class="announcements">
            <TransitionGroup>
                <div class="announcement" v-for="announcement in show.announcements">
                    <span>{{ announcement.type }}</span><span>{{ format(announcement.time, 'HH:mm:ss') }}</span>
                </div>
            </TransitionGroup>
            <!-- <Icon v-if="announcement.type === AnnouncementTypes.PlfStart"
                :class="{ pulsate: announcement.status === 'scheduled' }">line_start_diamond
            </Icon>
            <Icon v-else-if="announcement.type === AnnouncementTypes.Start"
                :class="{ pulsate: announcement.status === 'scheduled' }">line_start_square
            </Icon>
            <Icon v-else-if="announcement.type === AnnouncementTypes.MainShow"
                :class="{ pulsate: announcement.status === 'scheduled' }">line_start_circle
            </Icon>
            <Icon v-else-if="announcement.type === AnnouncementTypes.Credits"
                :class="{ pulsate: announcement.status === 'scheduled' }">line_end_circle
            </Icon>
            <Icon v-else-if="announcement.type === AnnouncementTypes.End"
                :class="{ pulsate: announcement.status === 'scheduled' }">line_end_square
            </Icon>
            <Icon v-else>schedule</Icon>
            <div>
                {{ format(announcement.time, 'HH:mm:ss') }}
                ({{ formatTimeLeft(announcement.time.getTime() - now.getTime()) }})
            </div>
            <div :style="{ opacity: announcement.status === 'announcing' ? 1 : 0.35 }">
                '<span v-for="(id, i) in announcement.sprites" v-show="id !== 'chime'" class="word">
                    {{ getSoundInfo(id).name }}{{ i < announcement.sprites.length - 1 ? '&nbsp;' : '' }} </span>'
            </div> -->
        </div>
    </div>
</template>

<style scoped>
.film {
    display: grid;
    grid-template-columns: 64px 1fr;
    grid-template-rows: auto auto auto;
    position: relative;
    width: 100%;
    min-height: 72px;
    margin-bottom: 8px;

    border-radius: 5px;
    background-color: #ffffff14;
    color: #fff;
    font-size: 14px;
    overflow: hidden;

    &.announcing {
        background-color: #ffffff96;
        color: #000;
    }

    .room {
        grid-column: 1;
        grid-row: 1 / -1;
        padding-left: 8px;
        padding-right: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        overflow: hidden;
        font: 18px/34px "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    }

    .title {
        font-weight: 600;
        margin-top: 6px;
    }

    .time {
        opacity: 0.5;
        margin-bottom: 6px;
    }

    .chips {
        position: absolute;
        top: 8px;
        right: 8px;
        gap: 4px;
    }

    .announcements {
        grid-column: 1 / -1;
        grid-row: -1;
        padding-top: 6px;
        padding-bottom: 6px;
        padding-left: 64px;
        background-color: #ffffff14;

        .announcement {
            display: grid;
            grid-template-columns: 100px 1fr;
        }
    }
}
</style>