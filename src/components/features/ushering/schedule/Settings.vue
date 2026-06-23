<script setup lang="ts">
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import AuditoriumMappings from '../../sections/AuditoriumMappings.vue';

const dialogActive = ref(false);

const emit = defineEmits(['open-column-editor']);

const sortBy = useStorage<'scheduledTime' | 'creditsTime'>('schedule-sort-by', 'creditsTime');

const displayPreshowDuration = useStorage('show-preshow-duration', 1) // 0 = never, 1 = only for 4DX, 2 = always
const displayCreditsDuration = useStorage('show-credits-duration', 1) // 0 = never, 1 = only for post-credits, 2 = always
const plfTimeBefore = useStorage('plf-time-before', 17) // usher-in will begin 17 minutes before start
const shortGapInterval = useStorage('short-gap-interval', 10) // double usher-out if the difference is less than 10 minutes
const longGapInterval = useStorage('long-gap-interval', 35) // long gap if the difference is greater than 30 minutes

const autoAdjustRowHeight = useStorage('schedule-row-height-auto-adjust', true);
const rowHeightMultiplier = useStorage('schedule-row-height-multiplier', 1);

const defaultIntermissionDuration = useStorage('default-intermission-duration', 12) // duration of intermissions in minutes
const specialIntermissionDuration = useStorage('special-intermission-duration', 20) // duration of intermissions in minutes

</script>

<template>
    <Button class="secondary full left" @click="dialogActive = true">
        <Icon>settings</Icon>
        Instellingen
    </Button>

    <SettingsDialog v-model:active="dialogActive">
        
        <template #navigation>
            <SettingsCategoryButton category-id="general" label="Algemeen" icon="settings" />
            <SettingsCategoryButton category-id="auditoriums" label="Zalen" icon="room_preferences" />
            <SettingsCategoryButton category-id="table_edit" label="Indeling" icon="table_edit" />
            <SettingsCategoryButton category-id="annotations" label="Uitlopen" />
            <SettingsCategoryButton category-id="plf" label="4DX-inloop" />
            <SettingsCategoryButton category-id="extra" label="Annotaties" />
        </template>

        <template #content>

            <SettingsSection category-id="general" title="Algemeen">
                <InputGroup type="select" id="sortBy" v-model="sortBy">
                    <template #label>Sorteren op</template>
                    <template #input>
                        <option :value="'creditsTime'">Aftitelingstijd</option>
                        <option :value="'scheduledTime'">Aanvangstijd</option>
                    </template>
                </InputGroup>

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

            <SettingsSection category-id="auditoriums" title="Zalen">
                <div>
                    <span class="label">Weergave zalen</span>
                    <AuditoriumMappings :preview="{ schedule: true }" />
                </div>
            </SettingsSection>

            <SettingsSection category-id="table_edit" title="Indeling">
                <p>De kolomindeling en de rijhoogte kunnen worden aangepast.</p>
                <Button class="tertiary full left" @click="$emit('open-column-editor'); dialogActive = false">
                    Kolom- & rij-indeling bewerken
                </Button>
            </SettingsSection>

            <SettingsSection category-id="annotations" title="Uitlopen">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <InputGroup type="number" id="shortGapInterval" v-model.number="shortGapInterval" min="0" max="20">
                        <template #label>Dubbele uitloop tot</template>
                        <span class="unit">minuten</span>
                    </InputGroup>
                    <InputGroup type="number" id="longGapInterval" v-model.number="longGapInterval" min="20" max="80">
                        <template #label>Gat tussen uitlopen vanaf</template>
                        <span class="unit">minuten</span>
                    </InputGroup>
                </div>
                <small>
                    <span v-if="shortGapInterval > 0">
                        Uitlopen met minder dan {{ shortGapInterval }} minuten ertussen krijgen een
                        boogje.
                    </span>
                    <span v-else>
                        Uitlopen met weinig tijd ertussen worden niet gemarkeerd.
                    </span>
                    <span v-if="longGapInterval > 0">
                        Gaten van meer dan {{ longGapInterval }} minuten krijgen een stippellijntje.
                    </span>
                    <span v-else>
                        Uitlopen met veel tijd ertussen worden niet gemarkeerd.
                    </span>
                    <br>
                    Als een voorstelling een post-credits-scène heeft, dan wordt de tijd 'Einde voorstelling'
                    gebruikt
                    voor het berekenen van de tijd tot de volgende uitloop.
                </small>
            </SettingsSection>

            <SettingsSection category-id="plf" title="4DX-inloop">
                <InputGroup type="number" id="plfTimeBefore" v-model.number="plfTimeBefore" min="0" max="30">
                    <template #label>Tijd voor aanvang</template>
                    <span class="unit">minuten</span>
                </InputGroup>
                <small v-if="plfTimeBefore > 0">
                    Uitlopen tijdens de 4DX-inloop worden gemarkeerd met een
                    streeplijntje. De 4DX-inloop begint {{ plfTimeBefore }} minuten
                    voor de aanvangstijd en eindigt wanneer de hoofdfilm begint.
                </small>
            </SettingsSection>

            <SettingsSection category-id="extra" title="Annotaties">
                <InputGroup type="select" id="displayCreditsDuration" v-model="displayCreditsDuration">
                    <template #label>Tijd tussen aftiteling en einde voorstelling tonen</template>
                    <template #input>
                        <option :value="0">Nooit tonen</option>
                        <option :value="1">Alleen bij post-credits-scènes</option>
                        <option :value="2">Altijd tonen</option>
                    </template>
                </InputGroup>
                <InputGroup type="select" id="displayPreshowDuration" v-model="displayPreshowDuration">
                    <template #label>Tijd tussen inloop en start hoofdfilm tonen</template>
                    <template #input>
                        <option :value="0">Nooit tonen</option>
                        <option :value="1">Alleen bij 4DX-inloop</option>
                        <option :value="2">Altijd tonen</option>
                    </template>
                </InputGroup>
            </SettingsSection>
        </template>
    </SettingsDialog>
</template>