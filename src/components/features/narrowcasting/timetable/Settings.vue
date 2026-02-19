<script setup lang="ts">
import { ref, h, inject } from 'vue';
import { useStorage } from '@vueuse/core';
import { DisplayLine } from '@/scripts/types';
import { showDialog } from '@/scripts/dialogManager';

const dialogActive = ref(false);

const emit = defineEmits(['loadWalkIns']);

const lastSentPacket = inject<string>('lastSentPacket');
const lastReceivedPacket = inject<any>('lastReceivedPacket');
const presetConfigurations = inject<{ [key: string]: { name: string, lines: () => DisplayLine[] } }>('presetConfigurations');


const addresses = useStorage('addresses', ["10.10.87.81", "10.10.87.82"]);

const aboutToStartTime = useStorage('about-to-start-time', 0);
const isStartedTime = useStorage('is-started-time', 9);
const hideTime = useStorage('hide-time', 17);

const animation = useStorage('animation', 0x00);
const animationSpeed = useStorage('animation-speed', 0x07);

const theatreName = useStorage('theatre-name', 'Pathé');
const motd = useStorage('motd', '');

const additionalAgeRating = useStorage('additional-age-rating', true);
const additionalPlf = useStorage('additional-plf', true);
const additionalLanguage = useStorage('additional-language', true);

const autoBlack = useStorage('auto-black', true);

const autoConfigShows = useStorage('auto-config-shows', 'walkin');
const autoConfigNoShows = useStorage('auto-config-no-shows', 'walkout');
const autoConfigNoData = useStorage('auto-config-no-data', 'noinfo');

const manualConfiguration = useStorage<DisplayLine[]>('manual-configuration', presetConfigurations['walkin'].lines());


function hexToAscii(hexString: string) {
    if (!hexString) return '';

    // Remove spaces and split into an array of hex bytes
    const hexBytes = hexString.trim().split(/\s+/);

    // Convert each byte to a character and join them into a single string
    const asciiString = hexBytes.map((byte: string) => {
        const charCode = parseInt(byte, 16);
        return String.fromCharCode(charCode);
    }).join('');

    return asciiString;
}
function showFormattingInfo() {
    showDialog([
        h('h3', "Opmaak"),
        h('p', [
            "In invoervelden zoals deze kunnen de volgende codes worden gebruikt:", h('br'), h('br'),
            h('code', "~Cn;"), " tekstkleur (waarbij n = 0, 1, 2 of 3)", h('br'),
            h('code', "~Bn;"), " achtergrondkleur (waarbij n = 0, 1, 2 of 3)", h('br'),
            h('code', "~R;"), " kleuren omwisselen", h('br'),
            h('code', "~I;"), " kleuren resetten", h('br'),
            h('code', "~F;"), " knipperen", h('br'),
            h('code', "~N;"), " niet meer knipperen", h('br'),
        ])
    ])
}
</script>

<template>
    <SettingsDialog v-model:active="dialogActive">
        <template #button-content>
            <Icon>settings</Icon>
            Instellingen
        </template>

        <template #navigation>
            <SettingsCategoryButton category-id="general" label="Algemeen" icon="settings" />
            <SettingsCategoryButton category-id="show-details" label="Voorstellingen" icon="list" />
            <SettingsCategoryButton category-id="display" label="Weergave" icon="display_settings" />
            <SettingsCategoryButton category-id="connection" label="Verbinding" icon="host" />
            <SettingsCategoryButton category-id="advanced" label="Geavanceerd" icon="build" />
        </template>

        <template #content>

            <SettingsSection category-id="general" title="Algemeen">
                <InputGroup type="text" id="theatreName" v-model="theatreName">
                    <template #label>Naam theater</template>
                </InputGroup>
                <InputGroup type="text" id="motd" v-model="motd" list="motd-list">
                    <template #label>Lichtkrant</template>
                    <datalist id="motd-list">
                        <option
                            value="De ~C3;Rooftop~C1; is weer geopend! Check pathé.nl of de Pathé-app voor alle voorstellingen.">
                            Rooftop weer open</option>
                        <option
                            value="Deze zomer: 5 avonden per week een film op de ~C3;Rooftop~C1;! Check pathé.nl of de Pathé-app.">
                            Rooftop zomervakantie</option>
                        <option value="F~C2;i~C1;j~C2;n~C1;e ~C2;f~C1;e~C2;e~C1;s~C2;t~C1;d~C2;a~C1;g~C2;e~C1;n~C2;!">
                            Fijne feestdagen
                        </option>
                    </datalist>
                </InputGroup>
                <Button class="tertiary" @click="showFormattingInfo">
                    Opmaak
                </Button>
            </SettingsSection>

            <SettingsSection category-id="show-details" title="Voorstellingen">
                <div class="label">Aanvullende informatie</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                    <InputCheckbox class="enclose-box" identifier="additionalAgeRating" v-model="additionalAgeRating"
                        @update:model-value="emit('loadWalkIns')">16+
                    </InputCheckbox>
                    <InputCheckbox class="enclose-box" identifier="additionalPlf" v-model="additionalPlf"
                        @update:model-value="emit('loadWalkIns')">PLF's
                    </InputCheckbox>
                    <InputCheckbox class="enclose-box" identifier="additionalLanguage" v-model="additionalLanguage"
                        @update:model-value="emit('loadWalkIns')">Taal
                    </InputCheckbox>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                    <InputGroup type="number" id="aboutToStartTime" v-model="aboutToStartTime" :min="0"
                        :max="isStartedTime">
                        <template #label>'Gaat starten' tonen na</template>
                        <span class="unit">minuten</span>
                    </InputGroup>
                    <InputGroup type="number" id="isStartedTime" v-model="isStartedTime" :min="aboutToStartTime">
                        <template #label>'Is gestart' tonen na</template>
                        <span class="unit">minuten</span>
                    </InputGroup>
                    <InputGroup type="number" id="hideTime" v-model="hideTime" :min="isStartedTime" :max="180">
                        <template #label>Verbergen na</template>
                        <span class="unit">minuten</span>
                    </InputGroup>
                </div>

                <small>De tekst 'gaat starten' verschijnt tussen {{ aboutToStartTime }} en {{
                    isStartedTime }} minuten
                    na de aanvangstijd. De tekst 'is gestart' verschijnt tussen {{ isStartedTime }} en {{
                        hideTime }}
                    minuten
                    na de aanvangstijd. Vanaf {{ hideTime }} minuten na de aanvangstijd worden
                    voorstellingen verborgen.</small>

            </SettingsSection>

            <SettingsSection category-id="display" title="Weergave">
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
                    <InputGroup type="select" id="animation" v-model="animation">
                        <template #label>Animatie</template>
                        <template #input>
                            <option :value="0x00">Geen</option>
                            <option :value="0x01">Scannen naar rechts</option>
                            <option :value="0x02">Scannen naar links</option>
                            <option :value="0x03">Scannen naar beneden</option>
                            <option :value="0x04">Scannen naar boven</option>
                            <option :value="0x05">Schuiven naar rechts</option>
                            <option :value="0x06">Schuiven naar links</option>
                            <option :value="0x07">Duwen naar beneden</option>
                            <option :value="0x08">Duwen naar boven</option>
                            <option :value="0x09">Vloeien</option>
                            <option :value="0x0A">Bedekken naar rechts</option>
                            <option :value="0x0B">Bedekken naar links</option>
                            <option :value="0x0C">Bedekken naar beneden</option>
                            <option :value="0x0D">Bedekken naar boven</option>
                            <option :value="0x0E">Scannen naar buiten</option>
                            <option :value="0x0F">Scannen naar binnen</option>
                            <option :value="0x10">Duwen naar buiten</option>
                            <option :value="0x11">Duwen naar binnen</option>
                            <option :value="0x12">Bedekken naar buiten</option>
                            <option :value="0x13">Bedekken naar binnen</option>
                            <option :value="0x14">Glinsteren</option>
                        </template>
                    </InputGroup>
                    <InputGroup type="number" id="animationSpeed" v-model="animationSpeed" :min="0" :max="9">
                        <template #label>Animatiesnelheid</template>
                        <span class="unit">/9</span>
                    </InputGroup>
                </div>
                <InputSwitch identifier="autoBlack" v-model="autoBlack">
                    Verlichting 's nachts uitschakelen
                    <small>
                        Tussen 01:00 en 09:30 is het bord zwart als er in de komende 3 uur geen inlopen
                        zijn.
                    </small>
                </InputSwitch>

                <InputGroup type="select" id="autoConfigShows" v-model="autoConfigShows">
                    <template #label>Weergave tijdens inlopen</template>
                    <template #input>
                        <option v-for="(preset, key) in presetConfigurations" :value="key">
                            {{ preset.name }}
                        </option>
                        <option value="manual">Aangepaste configuratie</option>
                    </template>
                </InputGroup>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <InputGroup type="select" id="autoConfigNoShows" v-model="autoConfigNoShows">
                        <template #label>Weergave na inlopen</template>
                        <template #input>
                            <option v-for="(preset, key) in presetConfigurations" :value="key">
                                {{ preset.name }}
                            </option>
                            <option value="manual">Aangepaste configuratie</option>
                        </template>
                    </InputGroup>
                    <InputGroup type="select" id="autoConfigNoData" v-model="autoConfigNoData">
                        <template #label>Weergave bij geen gegevens</template>
                        <template #input>
                            <option v-for="(preset, key) in presetConfigurations" :value="key">
                                {{ preset.name }}
                            </option>
                            <option value="manual">Aangepaste configuratie</option>
                        </template>
                    </InputGroup>
                </div>
                <InvokableModalDialog buttonClass="tertiary">
                    <template #button-content>
                        Aangepaste configuratie bewerken
                    </template>
                    <template #dialog-content>
                        <h3>Aangepaste configuratie</h3>
                        <small>
                            Regels met het selectievakje <u>uit</u> worden gevuld met geplande inlopen.
                        </small>
                        <div id="display-lines">
                            <div class="display-line" v-for="(line, i) in manualConfiguration" :key="i">
                                <div class="flex">
                                    <InputCheckbox class="no-label" :identifier="`line-${i}-enabled`"
                                        v-model="line.enabled" />
                                    <Input type="text" :id="`line-${i}-text`" v-model="line.textString"
                                        :class="{ 'too-long': line.textString.length > 60 }">
                                    </Input>
                                </div>
                                <div class="flex" style="padding-left: 32px;" v-if="line.textString.length">
                                    <div class="flex select-icons">
                                        <a v-for="(alignment, key) in {
                                            left: ['Links uitlijnen', 'format_align_left'], center: ['Centreren', 'format_align_center'], right: ['Rechts uitlijnen', 'format_align_right'], marquee: ['Lichtkrant', 'keyboard_double_arrow_left'], 'marquee-reverse': ['Omgekeerde lichtkrant', 'keyboard_double_arrow_right']
                                        }" @click="line.align = key" :class="{ selected: line.align === key }"
                                            :title="alignment[0]">
                                            <Icon>{{ alignment[1] }}</Icon>
                                        </a>
                                    </div>
                                    <div class="flex select-icons">
                                        <a v-for="(color, _, key) in { 0: ['Zwarte tekst', '#000'], 1: ['Rode tekst', 'rgb(227, 46, 46)'], 2: ['Groene tekst', 'rgb(35, 160, 35)'], 3: ['Oranje tekst', 'rgb(255, 178, 36)'] }"
                                            @click="line.fcolor = key as 0 | 1 | 2 | 3"
                                            :class="{ selected: line.fcolor === key }" :title="color[0]">
                                            <Icon :style="{ color: color[1] }">format_color_text</Icon>
                                        </a>
                                    </div>
                                    <div class="flex select-icons">
                                        <a v-for="(color, _, key) in { 0: ['Zwarte tekst', '#000'], 1: ['Rode tekst', 'rgb(227, 46, 46)'], 2: ['Groene tekst', 'rgb(35, 160, 35)'], 3: ['Oranje tekst', 'rgb(255, 178, 36)'] }"
                                            @click="line.bcolor = key as 0 | 1 | 2 | 3"
                                            :class="{ selected: line.bcolor === key }" :title="color[0]">
                                            <Icon :style="{ color: color[1] }">format_color_fill</Icon>
                                        </a>
                                    </div>
                                    <div class="flex select-icons"
                                        v-if="line.align === 'marquee' || line.align === 'marquee-reverse'">
                                        <a @click="line.speed = Math.max(0, line.speed - 1)" title="Langzamer">
                                            <Icon>remove</Icon>
                                        </a>
                                        <span>{{ line.speed }}</span>
                                        <a @click="line.speed = Math.min(9, line.speed + 1)" title="Sneller">
                                            <Icon>add</Icon>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex buttons" style="gap: 24px;">
                            <InvokableModalDialog buttonClass="tertiary">
                                <template #button-content>
                                    Voorgedefinieerde configuratie gebruiken
                                </template>
                                <template #dialog-content>
                                    <h3>Voorgedefinieerde configuraties</h3>
                                    <p>
                                        Selecteer één van de onderstaande configuraties om deze te kopiëren naar de
                                        aangepaste configuratie.
                                        <b>De huidige aangepaste configuratie wordt daarbij overschreven.</b>
                                    </p>
                                    <div class="flex buttons">
                                        <Button class="secondary" v-for="(preset, key) in presetConfigurations"
                                            :key="key" @click="manualConfiguration = preset.lines()">
                                            {{ preset.name }}
                                        </Button>
                                    </div>
                                </template>
                            </InvokableModalDialog>
                            <Button class="tertiary" @click="showFormattingInfo">
                                Opmaak
                            </Button>
                        </div>
                    </template>
                </InvokableModalDialog>
            </SettingsSection>

            <SettingsSection category-id="connection" title="Verbinding">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <template v-for="(address, i) in addresses" :key="i">
                        <InputGroup type="text" v-model="addresses[i]" :id="`ip-${i}`">
                            <template #label>IP-adres scherm {{ i + 1 }}</template>
                        </InputGroup>
                    </template>
                </div>
                <slot name="connection"></slot>
            </SettingsSection>

            <SettingsSection category-id="advanced" title="Geavanceerd">
                <div>
                    <div class="label">Laatst verzonden pakket</div>
                    <div class="flex">
                        <pre style="width: 48ch;">{{ lastSentPacket }}</pre>
                        <pre style="width: 16ch;">{{
                            hexToAscii(lastSentPacket)
                                .replace(/[\n\r\t]/g, " ")
                                .match(/.{1,16}/g)
                                ?.join('\n')
                        }}</pre>
                    </div>
                </div>
                <div>
                    <div class="label">Laatst ontvangen pakket</div>
                    <pre>{{ JSON.stringify(lastReceivedPacket, null, 4) }}</pre>
                </div>
            </SettingsSection>

        </template>
    </SettingsDialog>
</template>

<style scoped>
:deep(#motd) {
    font-family: monospace;
    font-size: 14px;
}

#display-lines {
    margin-top: 16px;
    margin-bottom: 16px;
}

.display-line {
    display: grid;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 8px;
    margin-bottom: 8px;

    &>div {
        align-items: center;
    }

    :deep(input[type="text"]) {
        font-family: monospace;
        font-size: 14px;
        width: calc(60ch + 32px);
        max-width: none;
    }
}

.select-icons {
    gap: 2px;

    &>a {
        border: none;
        padding: 3px;
        height: 24px;
        border-radius: 4px;
        cursor: pointer;
        background-color: #ffffff1a;

        &.selected {
            background-color: #ffffff;
            color: #000;
        }
    }
}
</style>

<script lang="ts">

</script>