<script setup lang="ts">
import { ref, inject, Ref, onMounted, watch, watchEffect } from 'vue';
import { format } from 'date-fns';
import { Announcement } from '@/scripts/types.ts';
import { getSoundInfo } from '@/scripts/voices';

const now = inject<Ref<Date>>('now');

const props = defineProps<{
    announcement: Announcement;
}>();
defineEmits<{
    (e: 'preview', segments: { spriteName: string; offset: number; }[]): void;
    (e: 'delete'): void;
}>();

const isPlaying = ref<boolean>(false);
const currentTime = ref<number>(0);

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

watchEffect(() => {
    if (props.announcement.audio) {
        props.announcement.audio.addEventListener("timeupdate", function () {
            currentTime.value = props.announcement.audio.currentTime;
        });
        props.announcement.audio.addEventListener('play', () => {
            isPlaying.value = true;
        });
        props.announcement.audio.addEventListener('pause', () => {
            isPlaying.value = false;
        });
    } else isPlaying.value = false;
});
</script>

<template>
    <li class="announcement" v-if="announcement.time.getTime() > now.getTime() || announcement.audio">

        <div class="contents" style="flex: 60% 1 1;" :class="{ 'playing': isPlaying }" :style="{
            '--progress': (currentTime / announcement.audio?.duration * 100) + '%'
        }">
            <div style="font-size: 14px;">
                {{ format(announcement.time, 'HH:mm:ss') }}
                (over {{ formatTimeLeft(announcement.time.getTime() - now.getTime()) }})
            </div>
            <div class="bar">
                <Icon class="fill" v-if="announcement.audio && !isPlaying" @click="announcement.audio.play()">
                    play_arrow
                </Icon>
                <Icon class="fill" v-else-if="announcement.audio && isPlaying" @click="announcement.audio.pause()">
                    pause
                </Icon>
                <Icon class="icon" v-else @click="$emit('preview', announcement.segments)">
                    play_circle
                </Icon>
                <div class="segments">
                    '{{announcement.segments
                        .map(segment => getSoundInfo(segment.spriteName).name)
                        .join(' ')}}'
                </div>
            </div>
        </div>

        <Icon class="divider-icon">{{ announcement.show ? 'link' : 'link_off' }}</Icon>

        <div class="film" style="flex: 40% 1 1;" v-if="announcement.show">
            <div>{{ announcement.show.playlist }}</div>
            <div>{{ format(announcement.show.scheduledTime, 'HH:mm') }} –
                {{ format(announcement.show.endTime, 'HH:mm:ss') }} (zaal {{ announcement.show.auditorium }})</div>
        </div>

        <div style="flex: 40% 1 1; opacity: .5;" v-else>
            Handmatig toegevoegd
        </div>

        <Icon class="delete" @click="$emit('delete')">close</Icon>
    </li>
</template>

<style scoped>
@property --progress {
    syntax: '<length>';
    inherits: true;
    initial-value: 0%;
}

.announcement {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;

    .contents {
        --progress: 0%;

        .bar {
            margin-block: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
            position: relative;
            padding: 4px 8px;
            background-color: #ffffff06;
            border: 1px solid #ffffff33;
            border-radius: 5px;
            overflow: hidden;

            .icon {
                cursor: pointer;
            }

            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                width: var(--progress);
                background: var(--yellow2);
                z-index: -1;
                border-radius: 6px;
                transition: --progress 250ms linear, width 250ms linear, opacity 150ms 150ms;
                opacity: 0;
            }
        }

        &.playing>.bar::after {
            opacity: 1;
            transition-delay: 0ms;
        }
    }

    .divider-icon {
        opacity: .5;
    }

    .film {
        opacity: .5;
        font-size: 14px;
    }
}
</style>