<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStorage } from '@vueuse/core';
import { AnnouncementRule } from '@/scripts/types';
import { defaultVoiceKey } from '@/scripts/voices';

import RuleList from './RuleList.vue';
import VoicesSelector from './VoicesSelector.vue';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import SpriteSelector from './SpriteSelector.vue';
import AuditoriumMappings from '../../sections/AuditoriumMappings.vue';

const store = useTmsScheduleStore();

const dialogActive = ref(false);

const emit = defineEmits(['regenerate', 'previewAnnouncement', 'scheduleAnnouncements']);

const defaultIntermissionDuration = useStorage('default-intermission-duration', 12) // duration of intermissions in minutes
const specialIntermissionDuration = useStorage('special-intermission-duration', 20) // duration of intermissions in minutes

const preferredVoices = useStorage<string[]>('preferred-voices', [defaultVoiceKey]);
const voiceBehaviour = useStorage<'roundrobin'>('voice-behaviour', 'roundrobin'); // only one behaviour for now, but maybe more in the future

const chimeSound = useStorage('chime-sound-str', 'chime01'); // which chime sound to use before announcements

const dead = computed(() => '');

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
</script>

<template>
    <SettingsDialog v-model:active="dialogActive">
        <template #button-content>
            <Icon>settings</Icon>
            Instellingen
            <small v-if="customRules.filter(r => r.enabled).length === 1" style="margin-left: 4px;">
                ({{customRules.filter(r => r.enabled).length}} eigen regel actief)
            </small>
            <small v-else-if="customRules.filter(r => r.enabled).length > 1" style="margin-left: 4px;">
                ({{customRules.filter(r => r.enabled).length}} eigen regels actief)
            </small>
        </template>

        <template #navigation>
            <SettingsCategoryButton category-id="general" label="Algemeen" icon="settings" />
            <SettingsCategoryButton category-id="voice" label="Geluid" icon="voice_selection" />
            <SettingsCategoryButton category-id="sprites" label="Geluidsfragmenten" icon="audio_file" />
            <SettingsCategoryButton category-id="auditoriums" label="Zalen" icon="room_preferences" />
            <SettingsCategoryButton category-id="rules" label="Regels" icon="flowchart" />
        </template>

        <template #content>

            <SettingsSection category-id="general" title="Algemeen">

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <InputGroup type="number" id="defaultIntermissionDuration"
                        v-model.number="defaultIntermissionDuration" min="0" max="30">
                        <template #label>Standaardduur filmpauzes</template>
                        <span class="unit">minuten</span>
                    </InputGroup>
                    <InputGroup type="number" id="specialIntermissionDuration"
                        v-model.number="specialIntermissionDuration" min="0" max="30">
                        <template #label>Duur filmpauzes FILM+</template>
                        <span class="unit">minuten</span>
                    </InputGroup>
                </div>
            </SettingsSection>

            <SettingsSection category-id="voice" title="Geluid">
                <div>
                    <span class="label">Geluid vóór omroep</span>
                    <SpriteSelector chimes :additional-sounds="['chime00']" v-model="chimeSound"
                        @update="emit('regenerate')" />
                </div>
                <div>
                    <span class="label">Stemmen</span>
                    <VoicesSelector v-model="preferredVoices" @update:modelValue="emit('regenerate')" />
                </div>
                <!-- <InputGroup type="select" id="voiceBehaviour" v-model="voiceBehaviour">
                    <template #label>Gedrag bij meerdere stemmen</template>
                    <template #input>
                        <option value="roundrobin">Willekeurig kiezen</option>
                    </template>
                </InputGroup> -->
            </SettingsSection>

            <SettingsSection category-id="sprites" title="Voorbeeld geluidsfragmenten">
                <SpriteSelector v-model="dead" style="max-height: none;" no-select />
            </SettingsSection>

            <SettingsSection category-id="auditoriums" title="Zalen">
                <div>
                    <span class="label">Geluidsfragmenten zalen</span>
                    <AuditoriumMappings :preview="{ announcer: true }" />
                </div>
            </SettingsSection>

            <SettingsSection category-id="rules" title="Regels">
                <div>
                    <span class="label">Standaardregels</span>
                    <RuleList v-model="presetRules" :toggleOnly="true" @change="emit('scheduleAnnouncements')" />
                </div>
                <div>
                    <span class="label">Eigen regels</span>
                    <RuleList v-model="customRules" :toggleOnly="false" @change="emit('scheduleAnnouncements')" />
                </div>
            </SettingsSection>

        </template>
    </SettingsDialog>
</template>

<style scoped>
.manual-sounds-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 10px;

    .manual-sound-button {
        height: 26px;
        min-width: 0;
        padding-left: 8px;
        padding-right: 8px;
        font-size: 13px;
        font-weight: normal;
        overflow: hidden;
        border-radius: 4px;

        &>span::first-letter {
            text-transform: uppercase;
        }
    }
}

:deep(.rule-list.toggle-only li.rule:not(.active)) {

    &:nth-child(1),
    &:nth-child(4),
    &:nth-child(5),
    &:nth-child(7),
    &:nth-child(8) {
        &::after {
            position: absolute;
            top: 6px;
            right: 64px;

            content: 'Aanbevolen';
            display: flex;
            gap: 4px;
            align-items: center;
            background-color: #ffc10514;
            background-color: hsl(from var(--yellow2) h s l / 0.1);
            color: var(--yellow2);
            font: 500 14px Heebo, arial, sans-serif;
            line-height: 20px;
            padding: 4px 8px;
            border-radius: 4px;
        }
    }
}
</style>

<script lang="ts">
export const presetRulesDefault: AnnouncementRule[] = [
    {
        id: 'plfStart',
        name: '4DX-inloop',
        segments: [
            { spriteName: 'doorsopen', offset: 0 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        enabled: true,
        trigger: {
            property: 'scheduledTime',
            preponeMinutes: 15,
        },
        filter: {
            plfOnly: true,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'start',
        name: 'Start',
        segments: [
            { spriteName: 'start', offset: 0 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        enabled: false,
        trigger: {
            property: 'showTime',
            preponeMinutes: 0,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'startmainshow',
        name: 'Start hoofdfilm',
        segments: [
            { spriteName: 'startmainshow', offset: 0 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        enabled: false,
        trigger: {
            property: 'mainShowTime',
            preponeMinutes: 0,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'intermission',
        name: 'Pauze',
        segments: [
            { spriteName: 'intermission', offset: 0 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        enabled: true,
        trigger: {
            property: 'intermissionTime',
            preponeMinutes: 1,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'credits',
        name: 'Aftiteling',
        segments: [
            { spriteName: 'credits', offset: 0 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        enabled: true,
        trigger: {
            property: 'creditsTime',
            preponeMinutes: 1,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'endshow',
        name: 'Einde voorstelling',
        segments: [
            { spriteName: 'endshow', offset: 0 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        enabled: false,
        trigger: {
            property: 'endTime',
            preponeMinutes: 0,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'startfinalmainshow',
        name: 'Start laatste hoofdfilm',
        segments: [
            { spriteName: 'start', offset: 0 },
            { spriteName: 'final', offset: 0 },
            { spriteName: 'mainshow', offset: 0 }
        ],
        enabled: true,
        trigger: {
            property: 'mainShowTime',
            preponeMinutes: 0,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: true,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
    {
        id: 'endfinalshow',
        name: 'Einde laatste voorstelling',
        segments: [
            { spriteName: 'end', offset: 0 },
            { spriteName: 'final', offset: 0 },
            { spriteName: 'show', offset: 0 }
        ],
        enabled: true,
        trigger: {
            property: 'endTime',
            preponeMinutes: 0,
        },
        filter: {
            plfOnly: false,
            lastShowOnly: true,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: '',
        }
    },
] as const;</script>
