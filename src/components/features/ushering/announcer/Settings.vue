<script setup lang="ts">
import { provide, ref, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { AnnouncementRule } from '@/scripts/types';
import { voices, getSoundInfo, defaultVoice, defaultVoiceKey } from '@/scripts/voices';

import RuleList from './RuleList.vue';
import VoicesSelector from './VoicesSelector.vue';

const dialogActive = ref(false);

const emit = defineEmits(['regenerate', 'previewAnnouncement', 'scheduleAnnouncements']);


const intermissionDuration = useLocalStorage('intermission-duration', 15) // duration of intermissions in minutes

const preferredVoices = useLocalStorage<(keyof typeof voices)[]>('preferred-voices', [defaultVoiceKey], { mergeDefaults: true });
const voiceBehaviour = useLocalStorage('voice-behaviour', 'roundrobin');

const chimeSound = useLocalStorage('chime-sound', 0); // which chime sound to use before announcements

const presetRulesOverrides = useLocalStorage<{ [key: string]: boolean }>('announcement-rules-overrides', {}, { mergeDefaults: true });
const presetRules = ref<AnnouncementRule[]>(
    presetRulesDefault.map(rule => ({
        ...rule,
        enabled: presetRulesOverrides.value[rule.id] ?? rule.enabled,
    }))
);
watch(presetRules, () => {
    presetRulesOverrides.value = Object.fromEntries(
        presetRules.value
            .filter(rule => rule.enabled !== presetRulesDefault.find(r => r.id === rule.id)?.enabled)
            .map(rule => [rule.id, rule.enabled])
    );
}, { deep: true });
provide('presetRules', presetRules);

const customRules = useLocalStorage<AnnouncementRule[]>('custom-rules', [], { mergeDefaults: true });
</script>

<template>
    <SettingsDialog v-model:active="dialogActive">
        <template #button-content>
            <Icon>settings</Icon>
            Instellingen
        </template>

        <template #navigation>
            <SettingsCategoryButton category-id="general" label="Algemeen" icon="settings" />
            <SettingsCategoryButton category-id="voice" label="Geluid" icon="voice_selection" />
            <SettingsCategoryButton category-id="sprites" label="Geluidsfragmenten" icon="audio_file" />
            <SettingsCategoryButton category-id="preset" label="Standaardregels" icon="flowchart" />
            <SettingsCategoryButton category-id="custom" label="Eigen regels" icon="flowchart" />
        </template>

        <template #content>

            <SettingsSection category-id="general" title="Algemeen">
                <InputGroup type="number" id="intermissionDuration" v-model.number="intermissionDuration" min="0"
                    max="30">
                    <template #label>Duur filmpauzes</template>
                    <span class="unit">minuten</span>
                </InputGroup>
            </SettingsSection>

            <SettingsSection category-id="voice" title="Geluid">
                <InputGroup type="select" id="chimeSound" v-model="chimeSound" @update:modelValue="emit('regenerate')">
                    <template #label>Geluid vóór omroep</template>
                    <template #input>
                        <option :value="0">Geluid 1</option>
                        <option :value="-1">Geen geluid</option>
                    </template>
                </InputGroup>
                <div>
                    <span class="label">Stem</span>
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
                <div class="manual-sounds-list" v-for="ids in [
                    [...voices.chimes.sounds,
                    ...defaultVoice.sounds.filter(id => !id.startsWith('auditorium'))],
                    defaultVoice.sounds.filter(id => id.startsWith('auditorium')),
                    ...preferredVoices.map(e => voices[e.toLowerCase()]?.additionalSounds)
                ]" v-show="ids?.length > 0">
                    <Button class="secondary manual-sound-button" v-for="id of ids"
                        @click="emit('previewAnnouncement', [{ spriteName: id, offset: 0 }], undefined, false)"
                        :class="{ translucent: !id.startsWith('chime') && !preferredVoices.some(e => voices[e].sounds.includes(id)) }">
                        <Icon v-if="id.startsWith('chime')" style="--size: 16px; margin-right: 0;">music_note
                        </Icon>
                        <span v-else>
                            {{ getSoundInfo(id).name }}
                        </span>
                    </Button>
                </div>
            </SettingsSection>

            <SettingsSection category-id="preset" title="Standaardregels">
                <RuleList v-model="presetRules" :toggleOnly="true" @change="emit('scheduleAnnouncements')" />
            </SettingsSection>

            <SettingsSection category-id="custom" title="Eigen regels">
                <RuleList v-model="customRules" :toggleOnly="false" @change="emit('scheduleAnnouncements')" />
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
</style>

<script lang="ts">
export const presetRulesDefault: AnnouncementRule[] = [
    {
        id: 'plfStart',
        name: '4DX-inloop',
        segments: [
            { spriteName: 'start', offset: 0 },
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
            property: 'scheduledTime',
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