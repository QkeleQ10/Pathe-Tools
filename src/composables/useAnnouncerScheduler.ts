import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

import {
    Announcement,
    AnnouncementSegment,
    AnnouncementRule,
    ScheduledAnnouncementDefinition,
    AnnouncementSource,
    AnnouncementState,
    TheAnyThingAnnouncement,
    TmsAnnouncement,
} from '@/scripts/types.ts';
import { voices, Voice, defaultVoice, preloadVoiceAudio } from '@/scripts/voices';
import { assembleAudioClient } from '@/scripts/assembleAudio';
import { createTheAnyThingAnnouncementDefinition, createTmsAnnouncementDefinitions } from '@/scripts/announcementSchedule';

import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import { useTheAnyThingStore } from '@/stores/theAnyThing';
import { format } from 'date-fns';

type AnnouncementsSchedule = Announcement[];
type PlaybackJob = {
    announcement: Announcement;
    audio: HTMLAudioElement;
    revision: number;
};

const MAX_GENERATORS = 2;
const MAX_BUFFERED_ANNOUNCEMENTS = 3;
const PREFETCH_WINDOW_MS = 60_000;

export function useAnnouncerScheduler(options: {
    internetTime: Ref<Date>;
    presetRules: Ref<AnnouncementRule[]>;
    customRules: Ref<AnnouncementRule[]>;
    preferredVoices: Ref<string[]>;
    chimeSound: Ref<string>;
    announceTheAnythingStart: Ref<boolean>;
    announceTheAnythingEnd: Ref<boolean>;
    announceTheAnythingNextBooking: Ref<'none' | 'time' | 'duration'>;
}) {
    const tmsScheduleStore = useTmsScheduleStore();
    const theAnyThingStore = useTheAnyThingStore();

    const manualAnnouncements = ref<AnnouncementsSchedule>([]);
    const showAnnouncements = ref<AnnouncementsSchedule>([]);
    const theAnyThingAnnouncements = ref<AnnouncementsSchedule>([]);
    const scheduledAnnouncements = computed(() =>
        [...manualAnnouncements.value, ...showAnnouncements.value, ...theAnyThingAnnouncements.value]
            .sort((a, b) => a.time.getTime() - b.time.getTime())
    );
    const customAnnouncementSegments = ref<AnnouncementSegment[]>([]);
    const customAnnouncementDate = ref<Date>(new Date(options.internetTime.value.getTime() + 5 * 60000));
    const isCustomAnnouncementDateValid = computed(() => customAnnouncementDate.value.getTime() >= options.internetTime.value.getTime());

    const enabledVoices = computed(() =>
        options.preferredVoices.value
            .map(id => voices[id])
            .filter((voice): voice is Voice => !!voice)
    );

    const preloadedVoices = computed(() => [voices.chimes, ...enabledVoices.value]);

    const playbackQueue: PlaybackJob[] = [];
    const dismissedOriginKeys = {
        show: new Set<string>(),
        theanything: new Set<string>(),
    };
    let interval: ReturnType<typeof setInterval> | null = null;
    let isProcessingPlaybackQueue = false;
    let isDisposed = false;

    const stopTmsScheduleSubscription = tmsScheduleStore.$subscribe(() => scheduleShowAnnouncements(), { deep: true });
    const stopTheAnyThingSubscription = theAnyThingStore.$subscribe(() => scheduleTheAnyThingAnnouncements(), { deep: true });

    watch(
        () => [options.presetRules.value, options.customRules.value],
        () => scheduleShowAnnouncements(),
        { deep: true }
    );

    watch(
        () => [Object.keys(voices).join('|'), options.preferredVoices.value.join('|')],
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

    onMounted(() => {
        scheduleShowAnnouncements();
        scheduleTheAnyThingAnnouncements();
        interval = setInterval(() => updateScheduler(), 1000);
        updateScheduler();
    });

    onBeforeUnmount(() => {
        isDisposed = true;
        if (interval) clearInterval(interval);
        stopTmsScheduleSubscription();
        stopTheAnyThingSubscription();
        cleanupAnnouncements();
    });

    function sanitizePreferredVoices() {
        const normalized = [...new Set(options.preferredVoices.value.filter(key => !!voices[key] && key !== 'chimes'))];
        const hasChanged =
            normalized.length !== options.preferredVoices.value.length ||
            normalized.some((value, index) => value !== options.preferredVoices.value[index]);
        if (hasChanged) {
            options.preferredVoices.value = normalized;
        }
    }

    function cleanupAnnouncement(announcement: Announcement) {
        announcement.revision += 1;
        removeAnnouncementFromPlaybackQueue(announcement);
        releaseAnnouncementAudio(announcement);
        announcement.generatePromise = undefined;
        announcement.state = AnnouncementState.Pending;
    }

    function cleanupAnnouncements() {
        playbackQueue.length = 0;
        for (const announcement of scheduledAnnouncements.value) {
            cleanupAnnouncement(announcement);
        }
    }

    function getAnnouncementCollection(source: AnnouncementSource) {
        if (source === 'manual') return manualAnnouncements.value;
        if (source === 'show') return showAnnouncements.value;
        return theAnyThingAnnouncements.value;
    }

    function scheduleShowAnnouncements() {
        const retainedOriginKeys = new Set(
            showAnnouncements.value
                .filter(announcement => announcement.state !== AnnouncementState.Finished)
                .map(announcement => announcement.originKey)
        );
        const desired = createTmsAnnouncementDefinitions(
            tmsScheduleStore.table,
            [...options.presetRules.value, ...options.customRules.value],
            options.internetTime.value.getTime(),
            retainedOriginKeys
        );
        showAnnouncements.value = reconcileAnnouncements(showAnnouncements.value, desired, 'show');
        updateScheduler();
    }

    function scheduleTheAnyThingAnnouncements() {
        const existingByOriginKey = new Map(
            theAnyThingAnnouncements.value.map(announcement => [announcement.originKey, announcement])
        );
        const desired = options.announceTheAnythingEnd.value
            ? theAnyThingStore.bookings
                .map(booking => createTheAnyThingAnnouncementDefinition(booking, options.announceTheAnythingNextBooking.value))
                .filter(definition => {
                    if (definition.source !== 'theanything') return false;
                    if (!theAnyThingStore.hasStartedAnnouncement(definition.theAnyThingBooking.bookingId)) return true;
                    const existing = existingByOriginKey.get(definition.originKey);
                    return !!existing && existing.state !== AnnouncementState.Finished;
                })
            : [];

        theAnyThingAnnouncements.value = reconcileAnnouncements(theAnyThingAnnouncements.value, desired, 'theanything');
        updateScheduler();
    }

    function reconcileAnnouncements(
        current: Announcement[],
        desired: ScheduledAnnouncementDefinition[],
        source: 'show' | 'theanything'
    ): Announcement[] {
        const dismissedKeys = dismissedOriginKeys[source];
        const desiredOriginKeys = new Set(desired.map(definition => definition.originKey));
        for (const originKey of dismissedKeys) {
            if (!desiredOriginKeys.has(originKey)) dismissedKeys.delete(originKey);
        }

        const currentByOriginKey = new Map(current.map(announcement => [announcement.originKey, announcement]));
        const next: Announcement[] = [];

        for (const definition of desired) {
            if (dismissedKeys.has(definition.originKey)) continue;

            const existing = currentByOriginKey.get(definition.originKey);
            if (!existing) {
                if (definition.time.getTime() > options.internetTime.value.getTime()) {
                    next.push(createAnnouncement(definition));
                }
                continue;
            }

            currentByOriginKey.delete(definition.originKey);
            const hasChanged = announcementDefinitionChanged(existing, definition);
            if (existing.state === AnnouncementState.Finished &&
                (!hasChanged || existing.isOverridden || definition.time.getTime() <= options.internetTime.value.getTime())) {
                continue;
            }

            updateAnnouncementSource(existing, definition);
            if (hasChanged && !existing.isOverridden) {
                cleanupAnnouncement(existing);
                existing.time = new Date(definition.time);
                existing.segments = definition.segments.map(segment => ({ ...segment }));
            }
            next.push(existing);
        }

        for (const removed of currentByOriginKey.values()) {
            cleanupAnnouncement(removed);
        }

        return next.sort((a, b) => a.time.getTime() - b.time.getTime());
    }

    function createAnnouncement(definition: ScheduledAnnouncementDefinition) {
        if (definition.source === 'show') {
            return new TmsAnnouncement(definition.time, definition.segments, definition.tmsShow, definition.originKey);
        }
        return new TheAnyThingAnnouncement(
            definition.time,
            definition.segments,
            definition.theAnyThingBooking,
            definition.originKey
        );
    }

    function announcementDefinitionChanged(current: Announcement, definition: ScheduledAnnouncementDefinition) {
        return current.time.getTime() !== definition.time.getTime() ||
            current.segments.length !== definition.segments.length ||
            current.segments.some((segment, index) =>
                segment.spriteName !== definition.segments[index]?.spriteName ||
                segment.offset !== definition.segments[index]?.offset
            );
    }

    function updateAnnouncementSource(current: Announcement, definition: ScheduledAnnouncementDefinition) {
        if (definition.source === 'show' && current instanceof TmsAnnouncement) {
            current.tmsShow = definition.tmsShow;
        } else if (definition.source === 'theanything' && current instanceof TheAnyThingAnnouncement) {
            current.theAnyThingBooking = definition.theAnyThingBooking;
        } else {
            throw new Error(`Announcement origin type mismatch for ${definition.originKey}`);
        }
    }

    function scheduleAnnouncements() {
        scheduleShowAnnouncements();
        scheduleTheAnyThingAnnouncements();
    }

    function removeAnnouncementFromPlaybackQueue(announcement: Announcement) {
        for (let index = playbackQueue.length - 1; index >= 0; index--) {
            if (playbackQueue[index].announcement === announcement) {
                playbackQueue.splice(index, 1);
            }
        }
    }


    async function regenerate() {
        for (const announcement of scheduledAnnouncements.value) {
            if (announcement.state !== AnnouncementState.Finished) cleanupAnnouncement(announcement);
        }
        updateScheduler();
    }

    function updateScheduler() {
        if (isDisposed) return;

        const now = options.internetTime.value.getTime();
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
        const revision = announcement.revision;
        let generatePromise: Promise<void>;
        generatePromise = (async () => {
            const segmentsWithVoices = prepareSegments(announcement.segments, enabledVoices.value);
            const audio = await assembleAudio(segmentsWithVoices);
            if (announcement.revision !== revision) {
                releaseStandaloneAudio(audio);
                return;
            }
            announcement.audio = audio;
            announcement.state = AnnouncementState.Ready;
        })()
            .catch(error => {
                if (announcement.revision !== revision) return;
                console.warn('Kon omroep niet genereren', error);
                announcement.state = AnnouncementState.Pending;
            })
            .finally(() => {
                if (announcement.revision === revision) {
                    if (announcement.generatePromise === generatePromise) announcement.generatePromise = undefined;
                    updateScheduler();
                }
            });
        announcement.generatePromise = generatePromise;

        return true;
    }

    function queueAnnouncementForPlayback(announcement: Announcement) {
        if (announcement.state === AnnouncementState.Playing || announcement.state === AnnouncementState.Finished) return;
        if (playbackQueue.some(job => job.announcement === announcement)) return;
        if (!announcement.audio) return;

        playbackQueue.push({
            announcement,
            audio: announcement.audio,
            revision: announcement.revision,
        });
    }

    async function processPlaybackQueue() {
        if (isProcessingPlaybackQueue) return;

        isProcessingPlaybackQueue = true;

        try {
            while (true) {
                const job = playbackQueue.shift();
                if (!job) return;

                const { announcement, audio, revision } = job;
                if (
                    announcement.revision !== revision ||
                    announcement.state !== AnnouncementState.Ready ||
                    announcement.audio !== audio
                ) continue;

                announcement.state = AnnouncementState.Playing;
                if (announcement instanceof TheAnyThingAnnouncement) {
                    theAnyThingStore.markAnnouncementStarted(announcement.theAnyThingBooking.bookingId);
                }

                try {
                    await playAudioElement(audio);
                } catch (error) {
                    console.warn('Kon omroep niet afspelen', error);
                }

                if (announcement.revision === revision) {
                    finishAnnouncement(announcement);
                }
                updateScheduler();
            }
        } finally {
            isProcessingPlaybackQueue = false;
        }
    }

    function playAudioElement(audio: HTMLAudioElement) {
        return new Promise<void>((resolve, reject) => {
            const cleanup = () => {
                audio.removeEventListener('ended', onEnded);
                audio.removeEventListener('error', onError);
            };
            const onEnded = () => {
                cleanup();
                resolve();
            };
            const onError = () => {
                cleanup();
                reject(new Error('Audio playback failed'));
            };

            audio.addEventListener('ended', onEnded, { once: true });
            audio.addEventListener('error', onError, { once: true });

            const result = audio.play();
            if (result) {
                result.catch(error => {
                    cleanup();
                    reject(error);
                });
            }
        });
    }

    function releaseAnnouncementAudio(announcement: Announcement) {
        if (!announcement.audio) return;

        const audio = announcement.audio;
        const source = audio.src;
        const wasPlaying = !audio.paused && !audio.ended;
        audio.pause();
        if (wasPlaying) {
            audio.dispatchEvent(new Event('ended'));
        }
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

    function queueAnnouncementNow(announcementOrSegments: Announcement | AnnouncementSegment[]) {
        const segments = Array.isArray(announcementOrSegments)
            ? announcementOrSegments
            : announcementOrSegments.segments;
        manualAnnouncements.value.push(new Announcement(options.internetTime.value, segments));
        updateScheduler();
    }

    function saveEditedAnnouncement(
        announcement: Announcement,
        editedDate: Date,
        editedSegments: AnnouncementSegment[],
    ) {
        const collection = getAnnouncementCollection(announcement.source);
        const index = collection.indexOf(announcement);

        if (index < 0) {
            return;
        }

        cleanupAnnouncement(announcement);
        announcement.time = new Date(editedDate);
        announcement.segments = editedSegments.map(segment => ({ ...segment }));
        announcement.isOverridden = true;
        updateScheduler();
    }

    function deleteScheduledAnnouncement(announcement: Announcement) {
        const collection = getAnnouncementCollection(announcement.source);
        const index = collection.indexOf(announcement);
        if (index < 0) return;

        cleanupAnnouncement(announcement);
        collection.splice(index, 1);
        if (announcement.source !== 'manual') {
            dismissedOriginKeys[announcement.source].add(announcement.originKey);
        }
        updateScheduler();
    }

    async function downloadAnnouncementAudio(segments: AnnouncementSegment[]) {
        if (!segments.length) return;

        const segmentsWithVoices = prepareSegments(segments, enabledVoices.value);
        const url = await assembleAudioClient(segmentsWithVoices);
        const link = document.createElement('a');
        link.href = url;
        link.download = `announcement-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.wav`;
        try {
            link.click();
        } finally {
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    }

    function scheduleCustomAnnouncement() {
        if (!isCustomAnnouncementDateValid.value) return;

        manualAnnouncements.value.push(new Announcement(customAnnouncementDate.value, customAnnouncementSegments.value));
        updateScheduler();
    }

    function prepareSegments(
        segments: AnnouncementSegment[],
        selectedVoices: Voice[],
        includeChime: boolean = true
    ): { voice: Voice; spriteName: string; offset: number }[] {

        const preferredVoices = [...selectedVoices].sort(() => 0.5 - Math.random());
        const allVoices = Object.values(voices);

        let preparedSegments: { voice: Voice; spriteName: string; offset: number }[] = [];

        if (includeChime && options.chimeSound.value !== 'chime00') preparedSegments.push({
            voice: voices.chimes,
            spriteName: options.chimeSound.value,
            offset: -1600,
        });

        for (const voice of [...preferredVoices, ...allVoices]) {
            if (segments.every(segment => segment.spriteName.startsWith('chime') || voice.sprite[segment.spriteName])) {
                preparedSegments.push(...segments.map(segment => ({
                    ...segment,
                    voice: segment.spriteName.startsWith('chime') ? voices.chimes : voice,
                })));

                return preparedSegments;
            }
        }

        preparedSegments.push(...segments.map(segment => {
            const voice = [...preferredVoices, ...allVoices].find(v => v.sprite[segment.spriteName]);
            return {
                ...segment,
                voice: (segment.spriteName.startsWith('chime') ? voices.chimes : voice) || defaultVoice,
            };
        }));

        return preparedSegments;
    }

    async function assembleAudio(segments: { voice: Voice; spriteName: string; offset: number }[]) {
        const url = await assembleAudioClient(segments);
        return new Audio(url);
    }

    return {
        scheduledAnnouncements,
        customAnnouncementSegments,
        customAnnouncementDate,
        isCustomAnnouncementDateValid,
        scheduleAnnouncements,
        regenerate,
        queueAnnouncementNow,
        saveEditedAnnouncement,
        deleteScheduledAnnouncement,
        downloadAnnouncementAudio,
        scheduleCustomAnnouncement,
    };
}