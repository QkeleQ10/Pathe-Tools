<script setup lang="ts">
import { ref, inject, useTemplateRef, computed, type Ref } from 'vue';
import { useDropZone, useStorage } from '@vueuse/core';
import { AnnouncementRule } from '@/scripts/types.ts';
import { defaultVoiceKey } from '@/scripts/voices';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import { useAnnouncerScheduler } from '@/composables/useAnnouncerScheduler';
import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue';
import AnnouncementBuilder from '@features/ushering/announcer/AnnouncementBuilder.vue';
import AnnouncementTimingForm from '@features/ushering/announcer/AnnouncementTimingForm.vue';
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

const {
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
} = useAnnouncerScheduler({
    internetTime: internetTime as Ref<Date>,
    presetRules,
    customRules,
    preferredVoices,
    chimeSound,
});

const recentAnnouncementCount = computed(() =>
    scheduledAnnouncements.value.filter(announcement => internetTime.value.getTime() - announcement.time.getTime() < 10000).length
);

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
                            @preview="previewScheduledAnnouncement($event)" @edit="openAnnouncementEditDialog($event)"
                            @delete="deleteScheduledAnnouncement(announcement)" />
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
                            <h3 style="margin-bottom: -8px;">Timing</h3>
                            <div class="flex buttons">
                                <Button class="primary add-rule" @click="previewCustomAnnouncementNow()"
                                    style="align-self: end">
                                    <Icon>play_arrow</Icon>
                                    Nu afspelen
                                </Button>
                                <small style="align-self: center; margin-top: 28px;">of</small>
                                <AnnouncementTimingForm v-model="customAnnouncementDate" button-icon="timer"
                                    button-label="Inplannen" button-class="secondary" heading-tag="span"
                                    :disabled="!isCustomAnnouncementDateValid" title="Inplannen voor"
                                    @submit="scheduleCustomAnnouncement()" />
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

        <Teleport to="body">
            <Transition>
                <ModalDialog v-if="announcementBeingEdited" @dismiss="closeAnnouncementEditDialog">
                    <AnnouncementTimingForm v-model="editedAnnouncementDate" button-icon="timer" button-label="Opslaan"
                        description="De omroep wordt opnieuw ingepland op het gekozen tijdstip en de oude planning wordt verwijderd."
                        heading-tag="h3" :disabled="!isEditedAnnouncementDateValid" title="Omroep verplaatsen"
                        @submit="saveEditedAnnouncement" />
                </ModalDialog>
            </Transition>
        </Teleport>
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
