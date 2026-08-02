import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import { Announcement, AnnouncementRule, AnnouncementState, Show } from '@/scripts/types.ts';
import { voices, Voice, defaultVoice, preloadVoiceAudio, findAuditoriumSound } from '@/scripts/voices';
import { assembleAudioClient } from '@/scripts/assembleAudio';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';

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
}) {
    const store = useTmsScheduleStore();

    const scheduledAnnouncements = ref<AnnouncementsSchedule>([]);
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

    const stopStoreSubscription = store.$subscribe(() => scheduleAnnouncements(), { deep: true });

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
        scheduleAnnouncements();
        interval = setInterval(() => updateScheduler(), 1000);
        updateScheduler();
    });

    onBeforeUnmount(() => {
        if (interval) clearInterval(interval);
        stopStoreSubscription();
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

    function cleanupAnnouncements() {
        playbackQueue.length = 0;
        isProcessingPlaybackQueue = false;

        for (const announcement of scheduledAnnouncements.value) {
            releaseAnnouncementAudio(announcement);
            announcement.generatePromise = undefined;
            if (announcement.state !== AnnouncementState.Finished) announcement.state = AnnouncementState.Pending;
        }
    }

    function createAnnouncement(time: Date, segments: AnnouncementSegment[], show?: Show): Announcement {
        return {
            time,
            show,
            segments: segments.map(segment => ({ ...segment })),
            state: AnnouncementState.Pending,
        };
    }

    function removeAnnouncementFromPlaybackQueue(announcement: Announcement) {
        for (let index = playbackQueue.length - 1; index >= 0; index--) {
            if (playbackQueue[index].announcement === announcement) {
                playbackQueue.splice(index, 1);
            }
        }
    }

    function scheduleAnnouncements(debug: boolean = false) {
        cleanupAnnouncements();

        let array: Announcement[] = [];

        for (const rule of [...options.presetRules.value, ...options.customRules.value]) {
            if (!rule.enabled) continue;

            let arr: Announcement[] = [];

            store.table.forEach((show, index) => {
                if (showMatchesFilter(show, index, rule)) {
                    const announcement = {
                        time: new Date(show[rule.trigger.property].getTime() - (rule.trigger.preponeMinutes || 0) * 60000 - 5000),
                        show,
                        segments: rule.segments.map(segment => ({
                            ...segment,
                            spriteName: segment.spriteName.replace('auditorium#', findAuditoriumSound(show.auditorium)),
                        })),
                        state: AnnouncementState.Pending,
                    };
                    if (debug || announcement.time.getTime() > options.internetTime.value.getTime()) {
                        arr.push(announcement);
                    }
                }
            });

            arr.sort((a, b) => a.time.getTime() - b.time.getTime());

            if (rule.filter.firstShowOnly) {
                arr = arr.slice(0, 1);
            }
            if (rule.filter.lastShowOnly) {
                arr = arr.slice(-1);
            }

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
        return {
            time: new Date(announcement.time),
            show: announcement.show,
            segments: announcement.segments.map(segment => ({ ...segment })),
            state: AnnouncementState.Pending,
        };
    }

    function previewScheduledAnnouncement(announcement: Announcement) {
        scheduledAnnouncements.value.push(createAnnouncement(new Date(options.internetTime.value), announcement.segments, announcement.show));
        updateScheduler();
    }

    async function previewAnnouncement(announcementOrSegments: Announcement | AnnouncementSegment[]) {
        const announcement = Array.isArray(announcementOrSegments)
            ? {
                time: new Date(options.internetTime.value),
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
        const updatedAnnouncement = createAnnouncement(editedAnnouncementDate.value, announcement.segments, announcement.show);
        const index = scheduledAnnouncements.value.indexOf(announcement);

        if (index < 0) {
            closeAnnouncementEditDialog();
            return;
        }

        removeAnnouncementFromPlaybackQueue(announcement);
        releaseAnnouncementAudio(announcement);
        scheduledAnnouncements.value.splice(index, 1, updatedAnnouncement);
        closeAnnouncementEditDialog();
        updateScheduler();
    }

    function deleteScheduledAnnouncement(announcement: Announcement) {
        const index = scheduledAnnouncements.value.indexOf(announcement);
        if (index < 0) return;

        removeAnnouncementFromPlaybackQueue(announcement);
        releaseAnnouncementAudio(announcement);
        scheduledAnnouncements.value.splice(index, 1);
        updateScheduler();
    }

    function previewCustomAnnouncementNow() {
        scheduledAnnouncements.value.push(createAnnouncement(new Date(options.internetTime.value), customAnnouncementSegments.value));

        updateScheduler();
    }

    function scheduleCustomAnnouncement() {
        if (!isCustomAnnouncementDateValid.value) return;

        scheduledAnnouncements.value.push(createAnnouncement(new Date(customAnnouncementDate.value), customAnnouncementSegments.value));
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
        });
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