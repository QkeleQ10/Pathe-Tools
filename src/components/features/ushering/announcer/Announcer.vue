<script setup lang="ts">
import { ref, inject, computed, type Ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

import { Announcement, AnnouncementRule, AnnouncementSegment } from '@/scripts/types.ts';
import { defaultVoiceKey } from '@/scripts/voices';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import { useTheAnyThingStore } from '@/stores/theAnyThing';
import { useAnnouncerScheduler } from '@/composables/useAnnouncerScheduler';

import AnnouncementBuilder from '@features/ushering/announcer/AnnouncementBuilder.vue';
import AnnouncementTimingForm from '@features/ushering/announcer/AnnouncementTimingForm.vue';
import ScheduledAnnouncement from '@features/ushering/announcer/ScheduledAnnouncement.vue';
import Settings, { presetRulesDefault } from '@/components/features/ushering/announcer/Settings.vue';

const tmsScheduleStore = useTmsScheduleStore();
const theAnyThingStore = useTheAnyThingStore();

const internetTime = inject<Ref<Date>>('internetTime', ref(new Date()));
const userHasInteracted = inject<Ref<boolean>>('userHasInteracted');

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

const {
    scheduledAnnouncements,
    customAnnouncementSegments,
    customAnnouncementDate,
    isCustomAnnouncementDateValid,
    scheduleAnnouncements,
    regenerate,
    queueAnnouncementNow,
    saveEditedAnnouncement: saveAnnouncementEdit,
    deleteScheduledAnnouncement,
    downloadAnnouncementAudio,
    scheduleCustomAnnouncement,
} = useAnnouncerScheduler({
    internetTime: internetTime as Ref<Date>,
    presetRules,
    customRules,
    preferredVoices,
    chimeSound,
    announceTheAnythingStart: useStorage('announce-the-anything-start', false),
    announceTheAnythingEnd: useStorage('announce-the-anything-end', true),
    announceTheAnythingNextBooking: useStorage<'none' | 'time' | 'duration'>('announce-the-anything-next', 'time')
});

const recentAnnouncementCount = computed(() =>
    scheduledAnnouncements.value.filter(announcement => internetTime.value.getTime() - announcement.time.getTime() < 10000).length
);
const showCustomAnnouncementBuilder = ref(false);
const announcementBeingEdited = ref<Announcement | null>(null);
const editedAnnouncementSegments = ref<AnnouncementSegment[]>([]);
const editedAnnouncementDate = ref(new Date());
const isEditedAnnouncementDateValid = computed(() =>
    editedAnnouncementDate.value.getTime() >= internetTime.value.getTime()
);

function editAnnouncement(announcement: Announcement) {
    announcementBeingEdited.value = announcement;
    editedAnnouncementSegments.value = announcement.segments.map(segment => ({ ...segment }));
    editedAnnouncementDate.value = new Date(announcement.time);
}

function saveEditedAnnouncement() {
    if (!announcementBeingEdited.value || !isEditedAnnouncementDateValid.value) return;

    saveAnnouncementEdit(
        announcementBeingEdited.value,
        editedAnnouncementDate.value,
        editedAnnouncementSegments.value,
    );
    announcementBeingEdited.value = null;
}
</script>

<template>
    <Teleport defer to="#announcer-main-tp-target">
        <h1>Omroepen</h1>
        <template v-if="tmsScheduleStore.table.length < 1">
            <p>
                <template v-if="recentAnnouncementCount < 1">Er
                    zijn geen omroepen gepland. <br></template>
                Upload eerst een <b>TSV</b>-bestand uit RosettaBridge (optie <b>Dates - ISO</b>) door hem naar
                deze pagina te slepen. <br>
                Je kunt ook handmatig omroepen inplannen.
            </p>
        </template>
        <template v-else-if="recentAnnouncementCount < 1">
            <p>
                Er zijn geen omroepen gepland. <br>
                Het geüploade bestand bevat voorstellingen van {{
                    format(tmsScheduleStore.table[0].endTime, 'PPPP', {
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
                    :key="announcement.source + announcement.time.getTime() + announcement.segments.map(s => s.spriteName).join(',')"
                    @preview="queueAnnouncementNow($event)" @edit="editAnnouncement($event)"
                    @delete="deleteScheduledAnnouncement(announcement)" />
            </TransitionGroup>
        </ul>
    </Teleport>


    <Teleport defer to="#announcer-settings-tp-target">
        <div class="flex" style="flex-direction: column;">

            <StatusBox v-if="theAnyThingStore.theatreId" :health="theAnyThingStore.status === 'OPEN'
                ? 'healthy'
                : theAnyThingStore.status === 'CONNECTING'
                    ? 'neutral'
                    : 'unhealthy'" :working="theAnyThingStore.status === 'CONNECTING'">
                <template #label v-if="theAnyThingStore.bookings.length > 0">TheAnyThing x {{
                    theAnyThingStore.bookings[0]?.locationName || '' }}</template>
                <template #label v-else>TheAnyThing</template>
                <template #description v-if="theAnyThingStore.bookings.length > 0">
                    {{ theAnyThingStore.bookings.length }} boekingen
                    &bull;
                    Bijgewerkt om {{ format(theAnyThingStore.timestamp, 'HH:mm:ss') }}
                </template>
                <template #description v-else>Geen gegevens</template>
            </StatusBox>

            <Button class="secondary full left" @click="showCustomAnnouncementBuilder = true">
                <Icon>add</Icon>
                <span>Nieuwe omroep</span>
            </Button>
            <AnnouncementBuilder v-if="showCustomAnnouncementBuilder" v-model="customAnnouncementSegments"
                @preview="queueAnnouncementNow" @download="downloadAnnouncementAudio"
                :schedule-disabled="!isCustomAnnouncementDateValid" @schedule="scheduleCustomAnnouncement()"
                @dismiss="showCustomAnnouncementBuilder = false">
                <template #title>Nieuwe omroep</template>
                <template #schedule>
                    <div>
                        <span class="label">
                            Geplande tijd
                        </span>
                        <AnnouncementTimingForm v-model="customAnnouncementDate" :initialise-date="true" />
                    </div>
                </template>
            </AnnouncementBuilder>

            <Settings @regenerate="regenerate" @scheduleAnnouncements="scheduleAnnouncements" />

        </div>
    </Teleport>

    <Transition>
        <div class="snackbar warning" v-if="!userHasInteracted">
            <h3>Let op: klik om geluid te activeren</h3>
            <p>
                De browser blokkeert geluiden tot er op de pagina is geklikt.
            </p>
        </div>
    </Transition>

    <Teleport to="body">
        <Transition>
            <AnnouncementBuilder v-if="announcementBeingEdited" v-model="editedAnnouncementSegments"
                @preview="queueAnnouncementNow" @download="downloadAnnouncementAudio"
                :schedule-disabled="!isEditedAnnouncementDateValid || !editedAnnouncementSegments.length"
                @schedule="saveEditedAnnouncement" @dismiss="announcementBeingEdited = null">
                <template #title>Omroep bewerken</template>
                <template #description>
                    <p>De omroep wordt opnieuw ingepland op het gekozen tijdstip en de oude planning wordt verwijderd.
                    </p>
                </template>
                <template #schedule>
                    <div>
                        <span class="label">
                            Geplande tijd
                        </span>
                        <AnnouncementTimingForm v-model="editedAnnouncementDate" :initialise-date="false" />
                    </div>
                </template>
                <template #schedule-submit>
                    <Icon>save</Icon>
                    Opslaan
                </template>
            </AnnouncementBuilder>
        </Transition>
    </Teleport>
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