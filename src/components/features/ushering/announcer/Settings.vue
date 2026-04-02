<script setup lang="ts">
import { provide, ref, computed, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { AnnouncementRule } from '@/scripts/types';
import { voices, getSoundInfo, defaultVoice, defaultVoiceKey, findAuditoriumSound } from '@/scripts/voices';

import RuleList from './RuleList.vue';
import VoicesSelector from './VoicesSelector.vue';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import SpriteSelector from './SpriteSelector.vue';

const store = useTmsScheduleStore();

const dialogActive = ref(false);

const emit = defineEmits(['regenerate', 'previewAnnouncement', 'scheduleAnnouncements']);


const intermissionDuration = useLocalStorage('default-intermission-duration', 12) // duration of intermissions in minutes

const preferredVoices = useLocalStorage<string[]>('preferred-voices', [defaultVoiceKey], { mergeDefaults: true });
const voiceBehaviour = useLocalStorage<'roundrobin'>('voice-behaviour', 'roundrobin'); // only one behaviour for now, but maybe more in the future

const chimeSound = useLocalStorage('chime-sound', 0); // which chime sound to use before announcements

const auditoriumMappings = useLocalStorage<{ [key: string]: string }>('announcer-auditorium-mappings', {}, { mergeDefaults: true }); // mapping from auditorium names to sound sprite names, e.g. "PULR 1" => "auditorium1"
const auditoriums = computed(() => {
    return [...new Set(store.table.map(show => show.auditorium).filter(Boolean))].sort((a, b) => ("" + a).localeCompare(b, undefined, { numeric: true }));
});

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
                <InputGroup type="number" id="intermissionDuration" v-model.number="intermissionDuration" min="0"
                    max="30">
                    <template #label>Standaardduur filmpauzes</template>
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
                <div class="manual-sounds-list" v-for="ids in [
                    [...voices.chimes.sounds,
                    ...defaultVoice.sounds.filter(id => !id.startsWith('auditorium'))],
                    defaultVoice.sounds.filter(id => id.startsWith('auditorium')),
                    ...preferredVoices.map(e => voices[e]?.additionalSounds)
                ]" v-show="ids?.length > 0">
                    <Button class="secondary manual-sound-button" v-for="id of ids"
                        @click="emit('previewAnnouncement', [{ spriteName: id, offset: 0 }], undefined, false)"
                        :class="{ translucent: !id.startsWith('chime') && !preferredVoices.some(e => voices[e]?.sounds.includes(id)) }">
                        <Icon v-if="id.startsWith('chime')" style="--size: 16px; margin-right: 0;">music_note
                        </Icon>
                        <span v-else>
                            {{ getSoundInfo(id).name }}
                        </span>
                    </Button>
                </div>
            </SettingsSection>

            <SettingsSection category-id="auditoriums" title="Zalen">
                <div>
                    <span class="label">Geluidsfragmenten</span>
                    <ul class="list scroll short auditorium-mapping-list">
                        <li v-for="(spriteName, auditorium) in auditoriumMappings" :key="auditorium" class="grid">
                            <span>{{ auditorium }}</span><br>
                            <small v-if="findAuditoriumSound(auditorium).length">'{{
                                getSoundInfo(findAuditoriumSound(auditorium)).name }}'</small>
                            <small v-else>Geen geluidsfragment ingesteld</small>
                            <SpriteSelector :id="'auditorium' + auditorium"
                                :datalist-id="'auditorium' + auditorium + 'datalist'"
                                v-model="auditoriumMappings[auditorium]" :placeholder="findAuditoriumSound(auditorium)"
                                @blur="emit('scheduleAnnouncements')"
                                style="position: absolute; top: 50%; right: 64px; width: calc(50%); translate: 0 -50%;" />
                            <div class="actions">
                                <Icon class="delete"
                                    @click="delete auditoriumMappings[auditorium]; emit('scheduleAnnouncements')">
                                    close
                                </Icon>
                            </div>
                        </li>
                        <li v-for="auditorium in auditoriums.filter(a => !(a in auditoriumMappings))" :key="auditorium">
                            <span>{{ auditorium }}</span><br>
                            <small v-if="findAuditoriumSound(auditorium).length">'{{
                                getSoundInfo(findAuditoriumSound(auditorium)).name }}'</small>
                            <small v-else>Geen geluidsfragment ingesteld</small>
                            <div class="actions">
                                <Icon class="edit"
                                    @click="auditoriumMappings[auditorium] = findAuditoriumSound(auditorium);">
                                    edit
                                </Icon>
                            </div>
                        </li>
                    </ul>
                    <p v-if="!auditoriums.length && !Object.keys(auditoriumMappings).length">
                        Upload eerst een bestand.
                    </p>
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
.auditorium-mapping-list {
    li {
        position: relative;

        small {
            opacity: .75;
        }

        .actions {
            position: absolute;
            right: 12px;
            bottom: 8px;
            display: flex;
            gap: 4px;
        }
    }
}

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
