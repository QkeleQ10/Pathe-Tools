<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { useLocalStorage, useUrlSearchParams } from '@vueuse/core';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import * as qmln from '@/utils/qmln'
import { format } from 'date-fns';

interface DisplayLine {
    fcolor: 0x00 | 0x01 | 0x02 | 0x03;
    bcolor: 0x00 | 0x01 | 0x02 | 0x03;
    enabled: boolean;
    textString: string;
    align: 'left' | 'center' | 'right' | 'marquee' | 'marquee-reverse';
    speed: number;
}

const now: Date = inject('now');

const params = useUrlSearchParams('history');

const store = useTmsScheduleStore();

const walkInsEditorVisible = ref(false);
const syncFilmTitles = ref(true);
const input = ref("");

const tickerText = 'De ~C3;Rooftop~C1; is weer geopend! Check pathé.nl of de Pathé-app voor alle voorstellingen.'

const modalVisible = ref(params.prototype ? true : false);
const host = ref("http://localhost:5000/send-bytes");
const ip = ref("10.10.87.81");
const ip2 = ref("10.10.87.82");
const autoSend = ref(true);
const autoConfigure = ref(true);

const walkIns = ref<{ scheduledTime: Date, title: string, auditorium: string, i: number }[]>([]);

const presetConfigurations: { [key: string]: { name: string, lines: DisplayLine[] } } = {
    "default": {
        name: "Standaard met lichtkrant",
        lines: [
            {
                textString: "Welkom bij Pathé Utrecht Leidsche Rijn!                 Zaal",
                fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'left', speed: 0x07
            },
            ...repeatDisplayLine(6),
            {
                textString: tickerText,
                fcolor: 0x01, bcolor: 0x00, enabled: true, align: 'marquee', speed: 0x07
            }
        ]
    },
    "walkout": {
        name: "Uitloop met lichtkrant",
        lines: [
            ...repeatDisplayLine(2, { fcolor: 0x03, bcolor: 0x00, textString: "", enabled: true, align: 'left', speed: 0x07 }),
            {
                textString: "Hartelijk dank voor je filmbezoek!",
                fcolor: 0x03, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            {
                textString: "Wij hopen dat je genoten hebt.",
                fcolor: 0x03, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            {
                textString: "Graag tot ziens bij",
                fcolor: 0x03, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            {
                textString: "Pathé Utrecht Leidsche Rijn",
                fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            { fcolor: 0x03, bcolor: 0x00, textString: "", enabled: true, align: 'left', speed: 0x07 },
            {
                textString: tickerText,
                fcolor: 0x01, bcolor: 0x00, enabled: true, align: 'marquee', speed: 0x07
            }
        ]
    },
    "test": {
        name: "Test",
        lines: [
            ...repeatDisplayLine(2, { fcolor: 0x03, bcolor: 0x00, textString: "", enabled: true, align: 'left', speed: 0x07 }),
            {
                textString: "Welkom bij Pathé Utrecht Leidsche Rijn!",
                fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            {
                textString: "De timetable toont momenteel geen actuele",
                fcolor: 0x03, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            {
                textString: "informatie. Raadpleeg uw ticket of de",
                fcolor: 0x03, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            {
                textString: "schermen bij de kassa voor het zaalnummer.",
                fcolor: 0x03, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            ...repeatDisplayLine(2, { fcolor: 0x03, bcolor: 0x00, textString: "", enabled: true, align: 'left', speed: 0x07 }),
        ]
    }
}

const currentConfiguration = ref<DisplayLine[]>(presetConfigurations['default'].lines);

store.$subscribe(() => {
    if (!store.table.length) return;
    autoConfigureAndSend();

    walkIns.value = [...store.table]
        .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
        .map((show, i) => ({
            scheduledTime: show.scheduledTime,
            title: show.title,
            auditorium: show.auditorium === 'Rooftop' ? 'RT' : show.auditorium.replace(/^\w+\s/, '').split(' ')[0],
            i
        }));
})

function getFormattedText(line: DisplayLine): { textString: string, fcolor: number, bcolor: number, flash: boolean }[] {
    if (!line?.textString) return [];
    const tokens = line.textString.split(/(?=~[CB]\d;|~[FNRI];)/g);
    const result: { textString: string, fcolor: number, bcolor: number, flash: boolean }[] = [];
    let currentFcolor: 0x00 | 0x01 | 0x02 | 0x03 = line.fcolor;
    let currentBcolor: 0x00 | 0x01 | 0x02 | 0x03 = line.bcolor;
    let currentFlash: boolean = false;

    for (const token of tokens) {
        if (token.startsWith('~C')) {
            currentFcolor = parseInt(token.substring(2, 3), 10) as 0 | 1 | 2 | 3;
        } else if (token.startsWith('~B')) {
            currentBcolor = parseInt(token.substring(2, 3), 10) as 0 | 1 | 2 | 3;
        } else if (token.startsWith('~R')) {
            [currentFcolor, currentBcolor] = [currentBcolor, currentFcolor];
        } else if (token.startsWith('~F')) {
            currentFlash = true;
        } else if (token.startsWith('~N')) {
            currentFlash = false;
        } else if (token.startsWith('~I')) {
            currentFcolor = line.fcolor;
            currentBcolor = line.bcolor;
        }

        result.push({ textString: token.replace(/~[CB]\d;|~[FNRI];/g, ''), fcolor: currentFcolor, bcolor: currentBcolor, flash: currentFlash });
    }

    return result;
}

function repeatDisplayLine(length: number, line: DisplayLine = { fcolor: 0x03, bcolor: 0x00, textString: "", enabled: false, align: 'left', speed: 0x07 }): DisplayLine[] {
    return Array.from({ length }, () => ({ ...line }));
}

function fillDisabledLinesWithShows(displayLines: DisplayLine[], now?: Date): DisplayLine[] {
    let result: DisplayLine[] = [];

    const nextShows = [...walkIns.value]
        .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
        .filter(show => show.scheduledTime.getTime() - Date.now() > -900000);
    // TODO: if !nextShows.length, show walk-out message

    let showIndex = 0;
    for (let lineNumber = 0; lineNumber < displayLines.length; lineNumber++) {
        if (!displayLines[lineNumber].enabled) {
            let show = nextShows[showIndex++];
            if (!show) {
                result.push({
                    textString: "", enabled: true, fcolor: 0x03, bcolor: 0x00, align: 'left', speed: 0x07
                });
                continue;
            }

            const isStarted = show.scheduledTime.getTime() - Date.now() < -540000;
            const aboutToStart = show.scheduledTime.getTime() - Date.now() < 300000 && !isStarted;

            let str = `${format(show.scheduledTime, 'HH:mm')} ${show.title.substring(0, 51).padEnd(51)}${show.auditorium.toString().substring(0, 3).padStart(3)}`;
            if (isStarted) str = `${format(show.scheduledTime, 'HH:mm')} ${show.title.substring(0, 40).padEnd(40)} ~C1;is gestart~C3;${show.auditorium.toString().substring(0, 3).padStart(3)}`;
            if (aboutToStart) str = `${format(show.scheduledTime, 'HH:mm')} ${show.title.substring(0, 38).padEnd(38)} ~F;~C1;gaat starten~N;~C3;${show.auditorium.toString().substring(0, 3).padStart(3)}`;

            result.push({
                textString: str, enabled: true, fcolor: 0x03, bcolor: 0x00, align: 'left', speed: 0x07
            });
        } else result.push(displayLines[lineNumber]);
    }

    return result;
}

function generatePacket(displayLines: DisplayLine[]) {
    const displayLinesWithShows = fillDisabledLinesWithShows(displayLines);
    console.log(displayLinesWithShows);

    let stillTextCommands: qmln.CommandShowTextString[] = [];
    let marqueeTextCommands: qmln.CommandShowTextImmediately[] = [];

    for (let i = 0; i < displayLinesWithShows.length; i++) {
        const line = displayLinesWithShows[i];
        if (!line.enabled) continue;
        if (line.align === 'marquee' || line.align === 'marquee-reverse') {
            marqueeTextCommands.push(new qmln.CommandShowTextImmediately(
                line.align === 'marquee' ? 0x06 : 0x05,
                line.speed, null, line.fcolor, line.bcolor, null, i + 1, line.textString
            ));
        } else {
            stillTextCommands.push(new qmln.CommandShowTextString(
                null, line.fcolor, line.bcolor, null, i + 1,
                line.align === 'center' ? padCenter(line.textString, 60)
                    : line.align === 'right' ? line.textString.padStart(60)
                        : line.textString
            ));
        }
    }

    return new qmln.Packet(
        null,
        null,
        new qmln.FunctionSendToInitialSegment([
            new qmln.CommandClearBuffer(),
            new qmln.CommandShowCurrentTime(),
            ...stillTextCommands,
            new qmln.CommandDisplayBuffer(null, 0x04, 0x09),
            ...marqueeTextCommands,
            new qmln.CommandEndOfSegmentData(),
        ])
    );
}

const funcs = {
    testMessage: () => {
        return new qmln.Packet(
            null,
            null,
            new qmln.FunctionSendToInitialSegment([
                new qmln.CommandClearBuffer(),
                new qmln.CommandShowCurrentTime(
                    0x02, null, 0x03, null, 0x37, 0x00
                ),
                // new qmln.CommandShowTextString(
                //     null, 0x03, 0x00, 0x37, 0x00, format(new Date(), 'HH:mm')
                // ),
                new qmln.CommandShowTextString(
                    null, 0x02, 0x00, 0x00, 0x02, padCenter("Welkom bij Pathé Utrecht Leidsche Rijn!", 60)
                ),
                new qmln.CommandShowTextString(
                    null, 0x03, 0x00, 0x00, 0x03, padCenter("De timetable toont momenteel geen actuele", 60)
                ),
                new qmln.CommandShowTextString(
                    null, 0x03, 0x00, 0x00, 0x04, padCenter("informatie. Raadpleeg uw ticket of de", 60)
                ),
                new qmln.CommandShowTextString(
                    null, 0x03, 0x00, 0x00, 0x05, padCenter("schermen bij de kassa voor het zaalnummer.", 60)
                ),
                new qmln.CommandDisplayBuffer(
                    null, 0x04, 0x09
                ),
                new qmln.CommandShowTextImmediately(
                    0x06, 0x07, null, 0x01, null, 0x00, 0x08, "De Rooftop is weer geopend! Check pathé.nl of de Pathé-app voor alle voorstellingen."
                ),
                new qmln.CommandEndOfSegmentData(),
            ]))
    },
    setClock: () => {
        return new qmln.Packet(
            null,
            null,
            new qmln.FunctionSetClock(new Date())
        )
    },
    thankYou: () => {
        return new qmln.Packet(
            null,
            null,
            new qmln.FunctionSendToInitialSegment([
                new qmln.CommandClearBuffer(),
                new qmln.CommandShowCurrentTime(
                    0x02, null, 0x03, null, 0x37, 0x00
                ),
                // new qmln.CommandShowTextString(
                //     null, 0x03, 0x00, 0x37, 0x00, format(new Date(), 'HH:mm')
                // ),
                new qmln.CommandShowTextString(
                    null, 0x03, 0x00, 0x00, 0x03, padCenter("Hartelijk dank voor je filmbezoek!", 60)
                ),
                new qmln.CommandShowTextString(
                    null, 0x03, 0x00, 0x00, 0x04, padCenter("Wij hopen dat je genoten hebt.", 60)
                ),
                new qmln.CommandShowTextString(
                    null, 0x03, 0x00, 0x00, 0x05, padCenter("Graag tot ziens bij", 60)
                ),
                new qmln.CommandShowTextString(
                    null, 0x02, 0x00, 0x00, 0x06, padCenter("Pathé Utrecht Leidsche Rijn", 60)
                ),
                new qmln.CommandDisplayBuffer(
                    null, 0x04, 0x09
                ),
                new qmln.CommandShowTextImmediately(
                    0x06, 0x07, null, 0x01, null, 0x00, 0x08, "De Rooftop is weer geopend! Check pathé.nl of de Pathé-app voor alle voorstellingen."
                ),
                new qmln.CommandEndOfSegmentData(),
            ]))
    },
    schedule: () => {
        const nextShows = [...store.table].filter(show => show.scheduledTime.getTime() - Date.now() > -900000).sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()).slice(0, 6)

        if (!nextShows.length) return funcs.thankYou()

        return generatePacket(fillDisabledLinesWithShows(presetConfigurations['default'].lines))
    }
}

function sendLines(lines: DisplayLine[]) {
    const packet = generatePacket(fillDisabledLinesWithShows(lines));
    input.value = packet.toString();

    sendInput();
}

async function sendInput() {
    if (ip.value) {
        let res1 = await fetch(host.value, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ip: ip.value,
                port: "9100",
                hex: input.value // the full hex string
            })
        });
        console.log(res1);
    }
    if (ip2.value) {
        let res2 = await fetch(host.value, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ip: ip2.value,
                port: "9100",
                hex: input.value // the full hex string
            })
        });
        console.log(res2);
    }
}

function hexToAscii(hexString: string) {
    // Remove spaces and split into an array of hex bytes
    const hexBytes = hexString.trim().split(/\s+/);

    // Convert each byte to a character and join them into a single string
    const asciiString = hexBytes.map((byte: string) => {
        const charCode = parseInt(byte, 16);
        return String.fromCharCode(charCode);
    }).join('');

    return asciiString;
}

function padCenter(string: string, maxLength: number, fillString: string = ' ') {
    const pad = Math.floor((maxLength - string.length) / 2);
    return fillString.repeat(pad) + string + fillString.repeat(maxLength - string.length - pad);
}

// every full minute (with seconds 00), send the current configuration
setTimeout(() => {
    autoConfigureAndSend();
    setInterval(() => {
        autoConfigureAndSend();
    }, 60000);
}, 60000 - Date.now() % 60000);

function autoConfigureAndSend(send = autoSend.value) {
    if (autoConfigure.value) {
        const nextShows = [...walkIns.value]
            .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
            .filter(show => show.scheduledTime.getTime() - Date.now() > -900000);
        if (nextShows.length) currentConfiguration.value = presetConfigurations['default'].lines;
        else currentConfiguration.value = presetConfigurations['walkout'].lines;
    }
    if (send) sendLines(fillDisabledLinesWithShows(currentConfiguration.value));
}
</script>

<template>
    <section>

        <div style="display: flex; gap: 32px; flex-wrap: wrap;">
            <div style="flex: 40% 1 1;">

                <h2>Opties</h2>

                <div class="flex" style="flex-direction: column;">
                    <InputCheckbox identifier="autoWalkOut" v-model="autoConfigure">
                        Automatisch de beste configuratie kiezen
                    </InputCheckbox>
                    <InputCheckbox identifier="autoSend" v-model="autoSend">
                        Elke minuut automatisch verzenden
                    </InputCheckbox>
                    <Button class="full" @click="walkInsEditorVisible = true">
                        <Icon>edit</Icon>
                        <span>Voorstellingen bewerken</span>
                    </Button>
                </div>

                <h2>Configuratie</h2>
                <div id="configurations" :class="{ disabled: autoConfigure }">
                    <div class="flex buttons">
                        <Button class="secondary" v-for="(preset, key) in presetConfigurations" :key="key"
                            @click="currentConfiguration = [...preset.lines]">
                            {{ preset.name }}
                        </Button>
                    </div>
                    <div id="display-lines">
                        <div class="display-line" v-for="(line, i) in currentConfiguration" :key="i">
                            <div class="flex">
                                <InputCheckbox class="no-label" :identifier="`line-${i}-enabled`"
                                    v-model="line.enabled" />
                                <InputText class="no-label" :identifier="`line-${i}-text`" v-model="line.textString"
                                    :class="{ 'too-long': line.textString.length > 60 }">
                                </InputText>
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
                </div>
            </div>

            <SidePanel style="flex: 585px 0 0; display: flex;">
                <div>
                    <h2>Voorbeeld</h2>
                    <div class="block" id="matrix-display">
                        <span id="matrix-display-title">Pathé Timetable</span>
                        <pre class="matrix-clock">{{ format(now, 'HH:mm') }}</pre>
                        <div v-for="(line, i) in fillDisabledLinesWithShows(currentConfiguration, now)"
                            class="matrix-row"
                            :style="{ '--marquee-duration': ((0.02 * Math.max(60, line.textString.replace(/~[CB]\d;|~[FNRI];/g, '').length) + 0.08) * (-1 * line.speed + 13)) + 's' }"
                            :class="`align${line.align || 'left'}`">
                            <div>
                                <span v-for="str in getFormattedText(line)" :key="i"
                                    :class="`fcolor${str?.fcolor || 0} bcolor${str?.bcolor || 0} flash${str?.flash ? 1 : 0}`">
                                    {{ str?.textString || '' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex buttons">
                    <Button class="secondary" @click="autoConfigureAndSend(true)">
                        <Icon>send</Icon>
                        <span>Nu verzenden</span>
                    </Button>
                    <Button class="secondary" @click="modalVisible = true" style="opacity: 0.2;">
                        <Icon>code</Icon>
                        <span>Foutopsporing</span>
                    </Button>
                </div>
                <p>
                    <b>Tip:</b> In invoervelden kunnen de volgende codes worden gebruikt:<br>
                    <code>~Cn;</code>&emsp; tekstkleur (waarbij n = 0, 1, 2 of 3)<br>
                    <code>~Bn;</code>&emsp; achtergrondkleur (waarbij n = 0, 1, 2 of 3)<br>
                    <code>~R; </code>&emsp; kleuren omwisselen<br>
                    <code>~I; </code>&emsp; kleuren resetten<br>
                    <code>~F; </code>&emsp; knipperen<br>
                    <code>~N; </code>&emsp; niet meer knipperen<br>
                </p>
            </SidePanel>
        </div>

        <ModalDialog v-if="walkInsEditorVisible" @dismiss="walkInsEditorVisible = false">
            <h3>Voorstellingen</h3>
            <InputCheckbox identifier="syncFilmTitles" v-model="syncFilmTitles">
                Filmtitel synchroniseren met andere voorstellingen
            </InputCheckbox>
            <div>
                <TransitionGroup name="list">
                    <div v-for="(walkIn) in [...walkIns].sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())"
                        class="flex walkin" :key="walkIn.i">
                        <InputTime class="no-label walkin-time" :identifier="`walkin-${walkIn.i}-time`"
                            v-model="walkIn.scheduledTime">
                        </InputTime>
                        <InputText class="no-label walkin-title" :spellcheck="false" autocomplete="off"
                            :identifier="`walkin-${walkIn.i}`" :model-value="walkIn.title" @update:model-value="(value) => {
                                if (syncFilmTitles) {
                                    walkIns.filter(walkIn2 => walkIn2.title === walkIn.title).forEach(walkIn2 => walkIn2.title = value);
                                } else {
                                    walkIn.title = value;
                                }
                            }" :class="{ 'too-long': walkIn.title.length > 38 }">
                        </InputText>
                        <InputText class="no-label walkin-auditorium" :spellcheck="false" autocomplete="off"
                            :identifier="`walkin-${walkIn.i}-auditorium`" v-model="walkIn.auditorium">
                        </InputText>
                        <Icon style="float: right; cursor: pointer; padding: 2px;" @click="walkIns.splice(walkIn.i, 1)">
                            delete</Icon>
                    </div>
                </TransitionGroup>
            </div>
            <Button class="secondary"
                @click="walkIns.push({ scheduledTime: new Date(), title: '', auditorium: '', i: walkIns.length })">
                Nieuwe voorstelling
            </Button>
        </ModalDialog>

        <ModalDialog v-if="modalVisible" @dismiss="modalVisible = false">
            <textarea v-model="input" identifier="input"></textarea>
            <div class="flex">
                <Button class="secondary" v-for="key in Object.keys(funcs)" @click="input = funcs[key]().toString()">
                    {{ key }}
                </Button>
            </div>
            <div class="flex">
                <pre style="width: 48ch;">{{ input }}</pre>
                <pre
                    style="width: 16ch;">{{ hexToAscii(input).replace(/[\n\r\t]/g, " ").match(/.{1,16}/g).join('\n') }}</pre>
            </div>

            <InputText v-model="host" identifier="host">
                <span>host</span>
            </InputText>
            <InputText v-model="ip" identifier="ip">
                <span>ip</span>
            </InputText>
            <InputText v-model="ip2" identifier="ip2">
                <span>ip2</span>
            </InputText>

            <InputCheckbox v-model="autoSend" identifier="repeat">
                <span>repeat</span>
            </InputCheckbox>

            <Button @click="sendInput">sendRequest</Button>
        </ModalDialog>
    </section>
</template>

<style scoped>
textarea {
    width: 100%;
    min-height: 200px;
}

textarea,
pre {
    height: auto;
    white-space: break-spaces;
    overflow-wrap: anywhere;
}

#configurations.disabled {
    opacity: 0.5;
    pointer-events: none;
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
        width: calc(60ch + 18px);
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

.walkin {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
    margin-bottom: 8px;
    font-family: monospace;

    :deep(input) {
        font-family: monospace;
    }

    .walkin-title :deep(input) {
        width: 400px;
        max-width: 400px;
    }

    .too-long :deep(input) {
        color: red;
    }

    .walkin-auditorium :deep(input) {
        width: 52px;
    }
}

#matrix-display {
    position: relative;
    font-family: monospace;
    width: calc(60ch + 56px);
}

#matrix-display-title {
    position: absolute;
    top: 16px;
    left: 20px;
    font: 28px "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    text-transform: uppercase;
}

.matrix-clock,
.matrix-row {
    position: relative;
    white-space: pre;

    box-sizing: content-box;
    height: calc(1em + 4px);
    padding: 4px 8px;
    margin-block: 4px;
    overflow: hidden;

    background-color: black;
    color: orange;
    border-radius: 4px;
    font-family: monospace;
}

.fcolor0 {
    color: #000;
}

.fcolor1 {
    color: rgb(227, 46, 46);
}

.fcolor2 {
    color: rgb(35, 160, 35);
}

.fcolor3 {
    color: rgb(255, 178, 36);
}

.bcolor0 {
    background-color: #000;
}

.bcolor1 {
    background-color: rgb(227, 46, 46);
}

.bcolor2 {
    background-color: rgb(35, 160, 35);
}

.bcolor3 {
    background-color: rgb(255, 178, 36);
}

.aligncenter {
    text-align: center;
}

.alignright {
    text-align: right;
}

.alignmarquee>div {
    position: absolute;
    min-width: 100%;
    right: 8px;
    animation: marquee 10s linear infinite;
    animation-duration: var(--marquee-duration);
}

.alignmarquee-reverse>div {
    position: absolute;
    animation: marquee-reverse 10s linear infinite;
    animation-duration: var(--marquee-duration);
}

.flash1 {
    animation: blink 1s linear infinite;
}

.matrix-clock {
    font-size: larger;
    width: 5ch;
    margin-left: auto;
    margin-bottom: 16px;
}

.matrix-row {
    width: 60ch;
}

@keyframes blink {

    0%,
    100% {
        opacity: 0;
    }

    30%,
    70% {
        opacity: 1;
    }
}

@keyframes marquee {
    0% {
        translate: 100%;
    }

    95% {
        translate: 0;
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

@keyframes marquee-reverse {
    0% {
        translate: -100%;
    }

    95% {
        translate: 0;
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}
</style>