<script setup lang="ts">
import { ref, inject, Ref, watchEffect } from 'vue';
import { format } from 'date-fns';
import { Announcement, AnnouncementState } from '@/scripts/types.ts';
import { getSoundName } from '@/scripts/voices';

const internetTime = inject<Ref<Date>>('internetTime')!;

const props = defineProps<{
    announcement: Announcement;
}>();
defineEmits<{
    (e: 'preview', announcement: Announcement): void;
    (e: 'edit', announcement: Announcement): void;
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

watchEffect((onCleanup) => {
    const audio = props.announcement.audio;

    if (!audio) {
        isPlaying.value = props.announcement.state === AnnouncementState.Playing;
        currentTime.value = 0;
        return;
    }

    const onTimeUpdate = () => {
        currentTime.value = audio.currentTime;
    };
    const onPlay = () => {
        isPlaying.value = true;
    };
    const onPause = () => {
        isPlaying.value = false;
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    isPlaying.value = props.announcement.state === AnnouncementState.Playing;

    onCleanup(() => {
        audio.removeEventListener('timeupdate', onTimeUpdate);
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
    });
});
</script>

<template>
    <li class="announcement" v-if="announcement.state !== AnnouncementState.Finished">

        <div class="contents" style="flex: 60% 1 1;" :class="{ 'playing': isPlaying }" :style="{
            '--progress': (currentTime / (announcement.audio?.duration || 1) * 100) + '%'
        }">
            <div class="status">
                {{ format(announcement.time, 'HH:mm:ss') }}
                (over {{ formatTimeLeft(announcement.time.getTime() - internetTime.getTime()) }})
            </div>
            <div class="bar">
                <!-- this is the preview button -->
                <div class="status-light" @click="$emit('preview', announcement)" :class="{
                    inactive: announcement.state === AnnouncementState.Pending,
                    neutral: announcement.state === AnnouncementState.Ready,
                    healthy: announcement.state === AnnouncementState.Playing,
                    working: announcement.state === AnnouncementState.Playing || announcement.state === AnnouncementState.Generating
                }" title="Voorbeeld afspelen"></div>
                <div class="segments">
                    '{{announcement.segments
                        .map(segment => getSoundName(segment.spriteName))
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

        <div style="display: flex; flex-direction: column; gap: 8px">
            <IconButton class="edit" @click="$emit('edit', announcement)" title="Tijd bewerken">edit</IconButton>
            <IconButton class="delete" @click="$emit('delete')" title="Verwijderen">close</IconButton>
        </div>
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

        .status {
            font-size: 14px;
        }

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

            .status-light {
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