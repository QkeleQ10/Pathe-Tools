<script setup lang="ts">
import { ref, inject, useTemplateRef, onMounted, onBeforeUnmount, Ref, watch, computed } from 'vue';
import { useDropZone, useStorage } from '@vueuse/core';
import { Announcement, AnnouncementRule, AnnouncementState, Show } from '@/scripts/types.ts';
import { voices, Voice, defaultVoice, defaultVoiceKey, preloadVoiceAudio, findAuditoriumSound } from '@/scripts/voices';
import { assembleAudioClient } from '@/scripts/assembleAudio';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue';
import AnnouncementBuilder from '@features/ushering/announcer/AnnouncementBuilder.vue';
import ScheduledAnnouncement from '@features/ushering/announcer/ScheduledAnnouncement.vue';
import Settings, { presetRulesDefault } from '@/components/features/ushering/announcer/Settings.vue';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const store = useTmsScheduleStore();
const internetTime = inject<Ref<Date>>('internetTime');

const userHasInteracted = inject<Ref<boolean>>('userHasInteracted');

const main = useTemplateRef('main');

const presetRulesOverrides = useStorage<{ [key: string]: boolean }>('announcement-rules-overrides', {});
const presetRules = computed<AnnouncementRule[]>({
    get: () => presetRulesDefault.map(rule => ({
        ...rule,
        enabled: presetRulesOverrides.value[rule.id] ?? rule.enabled,
    })),
    set: (rules) => {
        presetRulesOverrides.value = Object.fromEntries(
            rules
                .filter(rule => rule.enabled !== presetRulesDefault.find(r => r.id === rule.id)?.enabled)
                .map(rule => [rule.id, rule.enabled])
        );
    },
});

const customRules = useStorage<AnnouncementRule[]>('custom-rules', []);

const preferredVoices = useStorage<string[]>('preferred-voices', [defaultVoiceKey]);

const chimeSound = useStorage('chime-sound-str', 'chime01'); // which chime sound to use before announcements

const customAnnouncementSegments = ref<{ spriteName: string; offset: number }[]>([]);
const customAnnouncementDate = ref<Date>(new Date(internetTime.value.getTime() + 5 * 60000)); // default to 5 minutes from now

const scheduledAnnouncements = ref<Announcement[]>([])
store.$subscribe(() => scheduleAnnouncements(), { deep: true })

const playbackQueue: { announcement?: Announcement; audio: HTMLAudioElement }[] = [];
const MAX_GENERATORS = 2;
const MAX_BUFFERED_ANNOUNCEMENTS = 3;
const PREFETCH_WINDOW_MS = 60_000;

let interval: ReturnType<typeof setInterval> | null = null;
let isProcessingPlaybackQueue = false;

onMounted(() => {
    scheduleAnnouncements();
    interval = setInterval(() => updateScheduler(), 1000);
    updateScheduler();
})

onBeforeUnmount(() => {
    if (interval) clearInterval(interval);
    cleanupAnnouncements();
})

const enabledVoices = computed(() =>
    preferredVoices.value
        .map(id => voices[id])
        .filter((voice): voice is Voice => !!voice)
);

const preloadedVoices = computed(() => [voices.chimes, ...enabledVoices.value]);

watch(
    () => [Object.keys(voices).join('|'), preferredVoices.value.join('|')],
    sanitizePreferredVoices,
    { immediate: true }
);

watch(
    () => [Object.keys(voices).join('|'), ...preloadedVoices.value.map(voice => voice.file)],
    () => {
        for (const voice of preloadedVoices.value) {
            preloadVoiceAudio(voice).catch(error => console.warn('Kon voice niet preloaden', error));
        }
    },
    { immediate: true }
);

function sanitizePreferredVoices() {
    const normalized = [...new Set(preferredVoices.value.filter(key => !!voices[key] && key !== 'chimes'))];
    const hasChanged =
        normalized.length !== preferredVoices.value.length ||
        normalized.some((value, index) => value !== preferredVoices.value[index]);
    if (hasChanged) {
        preferredVoices.value = normalized;
    }
}

/**
 * Clean up all scheduled announcements and audio elements
 */
function cleanupAnnouncements() {
    playbackQueue.length = 0;
    isProcessingPlaybackQueue = false;

    for (const announcement of scheduledAnnouncements.value) {
        releaseAnnouncementAudio(announcement);
        announcement.generatePromise = undefined;
        if (announcement.state !== AnnouncementState.Finished) announcement.state = AnnouncementState.Pending;
    }
}

/**
 * Schedule all announcements based on the rules and the imported timetable
 */
function scheduleAnnouncements(debug: boolean = false) {
    // Clean up previously scheduled announcements before creating new ones
    cleanupAnnouncements();

    let array: Announcement[] = [];

    for (const rule of [...presetRules.value, ...customRules.value]) {
        if (!rule.enabled) continue;

        let arr: Announcement[] = [];

        store.table.forEach((show, index) => {
            if (showMatchesFilter(show, index, rule)) {
                const announcement = {
                    time: new Date(show[rule.trigger.property].getTime() - (rule.trigger.preponeMinutes || 0) * 60000 - 5000),
                    show: show,
                    segments: rule.segments.map(segment => ({
                        ...segment,
                        spriteName: segment.spriteName.replace('auditorium#', findAuditoriumSound(show.auditorium)),
                    })),
                    state: AnnouncementState.Pending,
                };
                if (debug || announcement.time.getTime() > internetTime.value.getTime()) {
                    arr.push(announcement);
                }
            }
        })

        arr.sort((a, b) => a.time.getTime() - b.time.getTime());

        if (rule.filter.firstShowOnly)
            arr = arr.slice(0, 1); // keep only the first element of the announcementsForRule array
        if (rule.filter.lastShowOnly)
            arr = arr.slice(-1); // keep only the last element of the announcementsForRule array

        array.push(...arr);
    }

    scheduledAnnouncements.value = array.sort((a, b) => a.time.getTime() - b.time.getTime());

    if (debug) console.log(scheduledAnnouncements.value);

    updateScheduler();
}

async function regenerate() {
    for (const announcement of scheduledAnnouncements.value) {
        releaseAnnouncementAudio(announcement);
        announcement.generatePromise = undefined;
        if (announcement.state !== AnnouncementState.Finished) {
            announcement.state = AnnouncementState.Pending;
        }
    }
    updateScheduler();
}

function updateScheduler() {
    const now = internetTime.value.getTime();
    const orderedAnnouncements = [...scheduledAnnouncements.value].sort((a, b) => a.time.getTime() - b.time.getTime());
    let generatingAnnouncements = orderedAnnouncements.filter(announcement =>
        announcement.state === AnnouncementState.Generating
    ).length;

    for (const announcement of orderedAnnouncements) {
        if (announcement.state === AnnouncementState.Ready && announcement.time.getTime() <= (now + 1000)) {
            queueAnnouncementForPlayback(announcement);
        }
    }

    let bufferedAnnouncements = orderedAnnouncements.filter(announcement =>
        announcement.state === AnnouncementState.Generating ||
        announcement.state === AnnouncementState.Ready ||
        announcement.state === AnnouncementState.Playing
    ).length;

    for (const announcement of orderedAnnouncements) {
        if (bufferedAnnouncements >= MAX_BUFFERED_ANNOUNCEMENTS) break;
        if (announcement.state !== AnnouncementState.Pending) continue;
        if (generatingAnnouncements >= MAX_GENERATORS) break;

        const timeUntilAnnouncement = announcement.time.getTime() - now;
        if (timeUntilAnnouncement > PREFETCH_WINDOW_MS) break;

        if (startGenerating(announcement)) {
            bufferedAnnouncements += 1;
            generatingAnnouncements += 1;
        }
    }

    void processPlaybackQueue();
}

function startGenerating(announcement: Announcement) {
    if (announcement.state !== AnnouncementState.Pending || announcement.generatePromise) return false;

    announcement.state = AnnouncementState.Generating;
    announcement.generatePromise = (async () => {
        const segmentsWithVoices = prepareSegments(announcement.segments, enabledVoices.value);
        announcement.audio = await assembleAudio(segmentsWithVoices);
        announcement.state = AnnouncementState.Ready;
    })()
        .catch(error => {
            console.warn('Kon omroep niet genereren', error);
            announcement.state = AnnouncementState.Pending;
        })
        .finally(() => {
            announcement.generatePromise = undefined;
            updateScheduler();
        });

    return true;
}

function queueAnnouncementForPlayback(announcement: Announcement) {
    if (announcement.state === AnnouncementState.Playing || announcement.state === AnnouncementState.Finished) return;
    if (playbackQueue.some(job => job.announcement === announcement)) return;

    playbackQueue.push({ announcement, audio: announcement.audio as HTMLAudioElement });
}

function queueStandalonePlayback(audio: HTMLAudioElement) {
    playbackQueue.push({ audio });
}

async function processPlaybackQueue() {
    if (isProcessingPlaybackQueue) return;

    isProcessingPlaybackQueue = true;

    try {
        while (true) {
            const job = playbackQueue.shift();
            if (!job) return;

            if (job.announcement) {
                if (job.announcement.state !== AnnouncementState.Ready || !job.announcement.audio) continue;

                job.announcement.state = AnnouncementState.Playing;

                try {
                    await playAudioElement(job.announcement.audio);
                } catch (error) {
                    console.warn('Kon omroep niet afspelen', error);
                }

                finishAnnouncement(job.announcement);
            } else {
                try {
                    await playAudioElement(job.audio);
                } catch (error) {
                    console.warn('Kon preview niet afspelen', error);
                }

                releaseStandaloneAudio(job.audio);
            }
            updateScheduler();
        }
    } finally {
        isProcessingPlaybackQueue = false;
    }
}

function playAudioElement(audio: HTMLAudioElement) {
    return new Promise<void>((resolve, reject) => {
        const onEnded = () => resolve();
        const onError = () => reject(new Error('Audio playback failed'));

        audio.addEventListener('ended', onEnded, { once: true });
        audio.addEventListener('error', onError, { once: true });

        const result = audio.play();
        if (result) {
            result.catch(error => {
                audio.removeEventListener('ended', onEnded);
                audio.removeEventListener('error', onError);
                reject(error);
            });
        }
    });
}

function releaseAnnouncementAudio(announcement: Announcement) {
    if (!announcement.audio) return;

    const audio = announcement.audio;
    const source = audio.src;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    audio.remove();

    if (source.startsWith('blob:')) {
        URL.revokeObjectURL(source);
    }

    announcement.audio = undefined;
}

function releaseStandaloneAudio(audio: HTMLAudioElement) {
    const source = audio.src;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    audio.remove();

    if (source.startsWith('blob:')) {
        URL.revokeObjectURL(source);
    }
}

function finishAnnouncement(announcement: Announcement) {
    releaseAnnouncementAudio(announcement);
    announcement.state = AnnouncementState.Finished;
}

function cloneAnnouncementForPreview(announcement: Announcement): Announcement {
    return {
        time: new Date(announcement.time),
        show: announcement.show,
        segments: announcement.segments.map(segment => ({ ...segment })),
        state: AnnouncementState.Pending,
    };
}

async function previewAnnouncement(announcementOrSegments: Announcement | { spriteName: string; offset: number }[]) {
    const announcement = Array.isArray(announcementOrSegments)
        ? {
            time: new Date(internetTime.value),
            segments: announcementOrSegments.map(segment => ({ ...segment })),
            state: AnnouncementState.Pending,
        } satisfies Announcement
        : cloneAnnouncementForPreview(announcementOrSegments);

    startGenerating(announcement);
    await announcement.generatePromise;

    if (announcement.state === AnnouncementState.Ready && announcement.audio) {
        queueStandalonePlayback(announcement.audio);
        void processPlaybackQueue();
    }
}

function previewCustomAnnouncementNow() {
    scheduledAnnouncements.value.push({
        time: new Date(internetTime.value),
        segments: customAnnouncementSegments.value.map(segment => ({ ...segment })),
        state: AnnouncementState.Pending,
    });

    updateScheduler();
}

function showMatchesFilter(show: Show, index: number, rule: AnnouncementRule) {
    let matches = true;

    if (!show[rule.trigger.property] || !show[rule.trigger.property].getTime()) return false;

    if (rule.filter.plfOnly && !show.auditorium.includes('4DX')) matches = false;
    if (rule.filter.playlistTitleIncludes && !show.title.toLowerCase().includes(rule.filter.playlistTitleIncludes.toLowerCase())) matches = false;
    if (rule.filter.playlistTitleExcludes && show.title.toLowerCase().includes(rule.filter.playlistTitleExcludes.toLowerCase())) matches = false;

    return matches;
}

/**
 * Add an optional chime sound to the segments and assign voices to each segment
 * @param segments The segments without voice assigned
 * @param selectedVoices The preferred voices to use
 */
function prepareSegments(
    segments: { spriteName: string; offset: number }[],
    selectedVoices: Voice[],
    includeChime: boolean = true
): { voice: Voice; spriteName: string; offset: number }[] {

    const preferredVoices = selectedVoices.sort(() => 0.5 - Math.random());
    const allVoices = Object.values(voices);

    let preparedSegments: { voice: Voice; spriteName: string; offset: number }[] = [];

    if (includeChime && chimeSound.value !== 'chime00') preparedSegments.push({
        voice: voices.chimes,
        spriteName: chimeSound.value,
        offset: -1600
    });

    // Loop through the voices (preferred first) in random order to find one that has all the required sprites
    for (const voice of [...preferredVoices, ...allVoices]) {
        // Check if the voice has all the required sprites
        if (segments.every(segment => segment.spriteName.startsWith('chime') || voice.sprite[segment.spriteName])) {
            preparedSegments.push(...segments.map(segment => ({
                ...segment,
                voice: segment.spriteName.startsWith('chime') ? voices.chimes : voice
            })));

            return preparedSegments;
        }
    }

    // If no voice has all the required sprites, use a mix of voices (preferred voices first)
    preparedSegments.push(...segments.map(segment => {
        const voice = [...preferredVoices, ...allVoices].find(v => v.sprite[segment.spriteName]);
        return {
            ...segment,
            voice: (segment.spriteName.startsWith('chime') ? voices.chimes : voice) || defaultVoice
        };
    }));

    return preparedSegments;
}

function assembleAudio(segments: { voice: Voice; spriteName: string; offset: number }[]) {
    return new Promise<HTMLAudioElement>(async (resolve) => {
        const url = await assembleAudioClient(segments);
        const audio = new Audio(url);
        resolve(audio);
    })
}

const { isOverDropZone } = useDropZone(main, {
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
})
</script>

<template>
    <div ref="main" class="content">
        <div class="layout">
            <main>
                <h1>Omroepen</h1>
                <template v-if="store.table.length < 1">
                    <p>
                        <template
                            v-if="scheduledAnnouncements.filter(announcement => internetTime.getTime() - announcement.time.getTime() < 10000).length < 1">Er
                            zijn geen omroepen gepland. <br></template>
                        Upload eerst een <b>TSV</b>-bestand uit RosettaBridge (optie <b>Dates - ISO</b>) door hem naar
                        deze pagina te slepen. <br>
                        Je kunt ook handmatig omroepen inplannen.
                    </p>
                </template>
                <template
                    v-else-if="scheduledAnnouncements.filter(announcement => internetTime.getTime() - announcement.time.getTime() < 10000).length < 1">
                    <p>
                        Er zijn geen omroepen gepland. <br>
                        Het geüploade bestand bevat voorstellingen van {{
                            format(store.table[0].endTime, 'PPPP', {
                                locale: nl
                            }) }}. <br>
                        Upload eventueel een recenter bestand of plan handmatig omroepen in.
                    </p>
                </template>
                <ul id="upcoming-announcements" class="list scroll" style="max-height: none;">
                    <TransitionGroup name="list">
                        <ScheduledAnnouncement
                            v-for="announcement in [...scheduledAnnouncements].sort((a, b) => a.time.getTime() - b.time.getTime())"
                            :announcement="announcement"
                            :key="announcement.time.getTime() + announcement.segments.map(s => s.spriteName).join(',')"
                            @preview="previewAnnouncement($event)"
                            @delete="scheduledAnnouncements.splice(scheduledAnnouncements.indexOf(announcement), 1)" />
                    </TransitionGroup>
                </ul>
            </main>

            <SidePanel>
                <div class="flex" style="flex-direction: column;">

                    <TimetableUploadSection />

                    <AnnouncementBuilder v-model="customAnnouncementSegments">
                        <Icon>add</Icon>
                        <span>Nieuwe omroep</span>
                        <template #footer>
                            <br>
                            <h3>Timing</h3>
                            <div class="flex buttons">
                                <Button class="primary add-rule" @click="previewCustomAnnouncementNow()">
                                    <Icon>play_arrow</Icon>
                                    Nu afspelen
                                </Button>
                                <small style="align-self: center;">of</small>
                                <InputDate identifier="customAnnouncementDate" v-model="customAnnouncementDate"
                                    style="height: 48px">
                                    Inplannen voor</InputDate>
                                <Button class="secondary"
                                    @click="scheduledAnnouncements.push({ time: new Date(customAnnouncementDate), segments: customAnnouncementSegments.map(segment => ({ ...segment })), state: AnnouncementState.Pending })">
                                    <Icon>timer</Icon>
                                    Omroep inplannen
                                </Button>
                            </div>
                        </template>
                    </AnnouncementBuilder>

                    <Button class="secondary full left" @click="scheduleAnnouncements()"
                        @contextmenu="scheduleAnnouncements(true)">
                        <Icon>refresh</Icon>
                        <span>Omroepen vernieuwen</span>
                    </Button>

                    <Settings @regenerate="regenerate" @previewAnnouncement="previewAnnouncement"
                        @scheduleAnnouncements="scheduleAnnouncements" />

                </div>

                <div class="spacer"></div>

                <div class="flex" style="flex-direction: column;">
                </div>
            </SidePanel>
        </div>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>

        <Transition>
            <div class="snackbar warning" v-if="!userHasInteracted">
                <h3>Let op: klik om geluid te activeren</h3>
                <p>
                    De browser blokkeert geluiden tot er op de pagina is geklikt.
                </p>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
#upcoming-announcements {
    list-style: none;
    padding: 0;
    margin: 0;
    position: relative;

    background-color: #11131677;
}

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

    .announcement {
        grid-column: 1 / -1;
        grid-row: -1;
        padding-top: 6px;
        padding-bottom: 6px;
        background-color: #ffffff14;

        .word.announcing {
            background-color: var(--yellow1);
            color: #000;
        }

        .icon {
            justify-self: center;
            opacity: 0.5;
        }
    }
}
</style>
