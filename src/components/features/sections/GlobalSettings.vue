<script setup lang="ts">
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import AuditoriumMappings from './AuditoriumMappings.vue';

const dialogActive = ref(false);

const defaultIntermissionDuration = useStorage('default-intermission-duration', 12) // duration of intermissions in minutes
const specialIntermissionDuration = useStorage('special-intermission-duration', 20) // duration of intermissions in minutes

function exportSettings(): void {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key)
            data[key] = localStorage.getItem(key);
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${new Date().toISOString()}.ptprofile`;
    a.click();
    URL.revokeObjectURL(url);
}

function importSettings(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            if (confirm('Alle instellingen wissen en overschrijven? Dit kan niet ongedaan worden gemaakt.')) {
                localStorage.clear();
                const data = JSON.parse(e.target?.result as string);
                for (const key in data) {
                    localStorage.setItem(key, data[key]);
                }
                location.reload();
            }
        } catch (error) {
            alert('Fout bij het importeren van instellingen: ' + error);
        }
    };
    reader.readAsText(file);
}

function clearSettings(): void {
    if (confirm('Alle instellingen wissen? Dit kan niet ongedaan worden gemaakt.')) {
        localStorage.clear();
        location.reload();
    }
}
</script>

<template>
    <SettingsDialog v-model:active="dialogActive">

        <template #navigation>
            <SettingsCategoryButton category-id="general" label="Algemeen" icon="settings" />
            <SettingsCategoryButton category-id="auditoriums" label="Zalen" icon="room_preferences" />
            <SettingsCategoryButton category-id="export" label="Im-/exporteren" icon="file_export" />
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

            <SettingsSection category-id="auditoriums" title="Zalen">
                <AuditoriumMappings :preview="{ schedule: true }" />
            </SettingsSection>

            <SettingsSection category-id="export" title="Im-/exporteren">
                <span>
                    Deze functionaliteit is experimenteel.
                </span>
                <span>
                    <strong>Let op:</strong>
                    bij het importeren gaan alle huidige instellingen verloren.
                </span>
                <Button class="tertiary" @click="exportSettings()">
                    <Icon>file_export</Icon> Instellingen exporteren
                </Button>
                <FileUploadButton class="tertiary" accept=".ptprofile"
                    @files-uploaded="(files) => importSettings(files[0])">
                    <Icon>upload</Icon> Instellingen importeren
                </FileUploadButton>
                <Button class="tertiary" @click="clearSettings()">
                    <Icon>restart_alt</Icon> Instellingen wissen
                </Button>
            </SettingsSection>

        </template>
    </SettingsDialog>
</template>