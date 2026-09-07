import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';

import {
    Announcement,
    AnnouncementRule,
    AnnouncementSource,
    AnnouncementState,
    Show,
    TheAnyThingAnnouncement,
    TmsAnnouncement,
} from '@/scripts/types.ts';
import { voices, Voice, defaultVoice, preloadVoiceAudio, findAuditoriumSound } from '@/scripts/voices';
import { assembleAudioClient } from '@/scripts/assembleAudio';

import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import { useTheAnyThingStore } from '@/stores/theAnyThing';
import { format } from 'date-fns';

type AnnouncementSegment = { spriteName: string; offset: number };
type AnnouncementsSchedule = Announcement[];
type PlaybackJob = { announcement?: Announcement; audio: HTMLAudioElement };

const MAX_GENERATORS = 2;
const MAX_BUFFERED_ANNOUNCEMENTS = 3;
const PREFETCH_WINDOW_MS = 60_000;

export function useAnnouncerScheduler(options: {
    internetTime: Ref<Date>;
    presetRules: Ref<AnnouncementRule[]>;
    customRules: Ref<AnnouncementRule[]>;
    preferredVoices: Ref<string[]>;
    chimeSound: Ref<string>;
    announceTheAnythingEnd: Ref<boolean>;
    announceTheAnythingNextBooking: Ref<boolean>;
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

    const announcementBeingEdited = ref<Announcement | null>(null);
    const editedAnnouncementDate = ref<Date>(new Date());
    const isEditedAnnouncementDateValid = computed(() => editedAnnouncementDate.value.getTime() >= options.internetTime.value.getTime());

    const enabledVoices = computed(() =>
        options.preferredVoices.value
            .map(id => voices[id])
            .filter((voice): voice is Voice => !!voice)
    );

    const preloadedVoices = computed(() => [voices.chimes, ...enabledVoices.value]);

    const playbackQueue: PlaybackJob[] = [];
    let interval: ReturnType<typeof setInterval> | null = null;
    let isProcessingPlaybackQueue = false;

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
        removeAnnouncementFromPlaybackQueue(announcement);
        releaseAnnouncementAudio(announcement);
        announcement.generatePromise = undefined;
        if (announcement.state !== AnnouncementState.Finished) announcement.state = AnnouncementState.Pending;
    }

    function cleanupAnnouncements() {
        playbackQueue.length = 0;
        isProcessingPlaybackQueue = false;
        for (const announcement of scheduledAnnouncements.value) {
            cleanupAnnouncement(announcement);
        }
    }

    function clearAnnouncements(source: AnnouncementSource) {
        const announcements = getAnnouncementCollection(source);
        for (const announcement of announcements) {
            cleanupAnnouncement(announcement);
        }
        announcements.length = 0;
    }

    function getAnnouncementCollection(source: AnnouncementSource) {
        if (source === 'manual') return manualAnnouncements.value;
        if (source === 'show') return showAnnouncements.value;
        return theAnyThingAnnouncements.value;
    }

    function scheduleShowAnnouncements() {
        clearAnnouncements('show');

        const array: Announcement[] = [];
        for (const rule of [...options.presetRules.value, ...options.customRules.value]) {
            if (!rule.enabled) continue;

            let arr: Announcement[] = [];
            tmsScheduleStore.table.forEach((show, index) => {
                if (showMatchesFilter(show, index, rule)) {
                    const triggerTime = show[rule.trigger.property];
                    if (!triggerTime) return;
                    const announcement = new TmsAnnouncement(
                        new Date(triggerTime.getTime() - (rule.trigger.preponeMinutes || 0) * 60000 - 5000),
                        rule.segments.map(segment => ({
                            ...segment,
                            spriteName: segment.spriteName.replace('auditorium#', findAuditoriumSound(show.auditorium)),
                        })),
                        show
                    );
                    if (announcement.time.getTime() > options.internetTime.value.getTime()) arr.push(announcement);
                }
            });

            arr.sort((a, b) => a.time.getTime() - b.time.getTime());
            if (rule.filter.firstShowOnly) arr = arr.slice(0, 1);
            if (rule.filter.lastShowOnly) arr = arr.slice(-1);
            array.push(...arr);
        }

        showAnnouncements.value = array.sort((a, b) => a.time.getTime() - b.time.getTime());
        updateScheduler();
    }

    function scheduleTheAnyThingAnnouncements() {
        const announcementsByBookingId = new Map(
            theAnyThingAnnouncements.value.map(announcement => [(announcement as TheAnyThingAnnouncement).theAnyThingBooking.bookingId, announcement])
        );
        const updatedAnnouncements: AnnouncementsSchedule = [];

        if (options.announceTheAnythingEnd.value === true) {
            for (const booking of theAnyThingStore.bookings) {
                if (booking.estimatedEndTime.getTime() <= options.internetTime.value.getTime()) continue;

                const segments = [
                    { spriteName: 'endshow', offset: 0 },
                    { spriteName: 'theanything', offset: 0 },
                    { spriteName: `num${String(booking.roomNumber).padStart(2, '0')}`, offset: 400 },
                ];

                if (booking.nextBookingStartTime && options.announceTheAnythingNextBooking.value === true) {
                    const timeUntilNextBooking = Math.max(0, booking.nextBookingStartTime.getTime() - booking.estimatedEndTime.getTime());

                    segments.push(
                        { spriteName: 'nextbookingin', offset: 0 },
                        ...durationToSegments(timeUntilNextBooking)
                    );
                }

                const announcement = announcementsByBookingId.get(booking.bookingId) as TheAnyThingAnnouncement | undefined;

                if (!announcement) {
                    updatedAnnouncements.push(new TheAnyThingAnnouncement(
                        booking.estimatedEndTime,
                        segments,
                        booking
                    ));
                    continue;
                }

                const hasChanged =
                    announcement.time.getTime() !== booking.estimatedEndTime.getTime() ||
                    announcement.segments.some((segment, index) =>
                        segment.spriteName !== segments[index]?.spriteName || segment.offset !== segments[index]?.offset
                    ) ||
                    announcement.segments.length !== segments.length;

                if (hasChanged) {
                    cleanupAnnouncement(announcement);
                    announcement.time = new Date(booking.estimatedEndTime);
                    announcement.segments = segments.map(segment => ({ ...segment }));
                    if (announcement.state === AnnouncementState.Finished) {
                        announcement.state = AnnouncementState.Pending;
                    }
                }

                announcement.theAnyThingBooking = booking;
                updatedAnnouncements.push(announcement);
                announcementsByBookingId.delete(booking.bookingId);
            }
        }

        for (const announcement of announcementsByBookingId.values()) {
            cleanupAnnouncement(announcement);
        }

        theAnyThingAnnouncements.value = updatedAnnouncements;
        updateScheduler();
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
            releaseAnnouncementAudio(announcement);
            announcement.generatePromise = undefined;
            if (announcement.state !== AnnouncementState.Finished) {
                announcement.state = AnnouncementState.Pending;
            }
        }
        updateScheduler();
    }

    function updateScheduler() {
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

    function cloneAnnouncementForPreview(announcement: Announcement): Announcement {
        return new Announcement(announcement.time, announcement.segments);
    }

    function previewScheduledAnnouncement(announcement: Announcement) {
        manualAnnouncements.value.push(new Announcement(options.internetTime.value, announcement.segments));
        updateScheduler();
    }

    async function previewAnnouncement(announcementOrSegments: Announcement | AnnouncementSegment[]) {
        const announcement = Array.isArray(announcementOrSegments)
            ? new Announcement(options.internetTime.value, announcementOrSegments)
            : cloneAnnouncementForPreview(announcementOrSegments);

        startGenerating(announcement);
        await announcement.generatePromise;

        if (announcement.state === AnnouncementState.Ready && announcement.audio) {
            queueStandalonePlayback(announcement.audio);
            void processPlaybackQueue();
        }
    }

    function openAnnouncementEditDialog(announcement: Announcement) {
        announcementBeingEdited.value = announcement;
        editedAnnouncementDate.value = new Date(announcement.time);
    }

    function closeAnnouncementEditDialog() {
        announcementBeingEdited.value = null;
    }

    function saveEditedAnnouncement() {
        if (!announcementBeingEdited.value || !isEditedAnnouncementDateValid.value) return;

        const announcement = announcementBeingEdited.value;
        const collection = getAnnouncementCollection(announcement.source);
        const index = collection.indexOf(announcement);

        if (index < 0) {
            closeAnnouncementEditDialog();
            return;
        }

        cleanupAnnouncement(announcement);
        collection.splice(index, 1);
        manualAnnouncements.value.push(new Announcement(editedAnnouncementDate.value, announcement.segments));
        closeAnnouncementEditDialog();
        updateScheduler();
    }

    function deleteScheduledAnnouncement(announcement: Announcement) {
        const collection = getAnnouncementCollection(announcement.source);
        const index = collection.indexOf(announcement);
        if (index < 0) return;

        cleanupAnnouncement(announcement);
        collection.splice(index, 1);
        updateScheduler();
    }

    function previewCustomAnnouncementNow() {
        manualAnnouncements.value.push(new Announcement(options.internetTime.value, customAnnouncementSegments.value));

        updateScheduler();
    }

    function scheduleCustomAnnouncement() {
        if (!isCustomAnnouncementDateValid.value) return;

        manualAnnouncements.value.push(new Announcement(customAnnouncementDate.value, customAnnouncementSegments.value));
        updateScheduler();
    }

    function showMatchesFilter(show: Show, index: number, rule: AnnouncementRule) {
        let matches = true;

        const triggerTime = show[rule.trigger.property];
        if (!triggerTime || !triggerTime.getTime()) return false;

        if (rule.filter.plfOnly && !show.auditorium.includes('4DX')) matches = false;
        if (rule.filter.playlistTitleIncludes && !show.title.toLowerCase().includes(rule.filter.playlistTitleIncludes.toLowerCase())) matches = false;
        if (rule.filter.playlistTitleExcludes && show.title.toLowerCase().includes(rule.filter.playlistTitleExcludes.toLowerCase())) matches = false;

        return matches;
    }

    function prepareSegments(
        segments: AnnouncementSegment[],
        selectedVoices: Voice[],
        includeChime: boolean = true
    ): { voice: Voice; spriteName: string; offset: number }[] {

        const preferredVoices = selectedVoices.sort(() => 0.5 - Math.random());
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

    function assembleAudio(segments: { voice: Voice; spriteName: string; offset: number }[]) {
        return new Promise<HTMLAudioElement>(async (resolve) => {
            const url = await assembleAudioClient(segments);
            const audio = new Audio(url);
            resolve(audio);
            //download the audio
            const a = document.createElement('a');
            a.href = url;
            a.download = `announcement-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.mp3`;
            a.click();
        });
    }

    function durationToSegments(durationMs: number, includeSeconds: boolean = false): AnnouncementSegment[] {
        const segments: AnnouncementSegment[] = [];

        const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const addUnit = (value: number, unit: 'hours' | 'minutes' | 'seconds') => {
            if (value <= 0) return;

            segments.push(
                { spriteName: `num${String(value).padStart(2, '0')}`, offset: 0 },
                { spriteName: `time${unit}`, offset: 0 },
            );
        };

        addUnit(hours, 'hours');
        if (hours < 2) addUnit(minutes, 'minutes');
        if (includeSeconds && hours < 1) addUnit(seconds, 'seconds');

        return segments;
    }

    return {
        scheduledAnnouncements,
        customAnnouncementSegments,
        customAnnouncementDate,
        isCustomAnnouncementDateValid,
        announcementBeingEdited,
        editedAnnouncementDate,
        isEditedAnnouncementDateValid,
        scheduleAnnouncements,
        regenerate,
        previewAnnouncement,
        previewScheduledAnnouncement,
        openAnnouncementEditDialog,
        closeAnnouncementEditDialog,
        saveEditedAnnouncement,
        deleteScheduledAnnouncement,
        previewCustomAnnouncementNow,
        scheduleCustomAnnouncement,
    };
}