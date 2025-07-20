<script setup lang="ts">
import { ref, computed, inject, nextTick, onBeforeUnmount, onMounted, Ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
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

const now = inject<Ref<Date>>('now');

const store = useTmsScheduleStore();

const syncFilmTitles = ref(true);

const sending = ref(false);
const lastSentPacket = ref<string | null>(null);
const lastSentTime = ref<Date | null>(null);
const lastSentStatus = ref<[string | null, string | null]>([null, null]);

const aboutToStartTime = useLocalStorage('about-to-start-time', 0);
const isStartedTime = useLocalStorage('is-started-time', 9);
const hideTime = useLocalStorage('hide-time', 17);

const animation = useLocalStorage('animation', 0x00);
const animationSpeed = useLocalStorage('animation-speed', 0x07);

const theatreName = useLocalStorage('theatre-name', 'Pathé Utrecht Leidsche Rijn');
const tickerText = useLocalStorage('ticker-text', 'De ~C3;Rooftop~C1; is weer geopend! Check pathé.nl of de Pathé-app voor alle voorstellingen.');

const receiveBeta = useLocalStorage('receive-beta', false);
const autoSend = useLocalStorage('auto-send', true);
const autoConfigure = useLocalStorage('auto-configure', true);
const autoBlack = useLocalStorage('auto-black', true);

const ip1 = useLocalStorage('ip1', "10.10.87.81");
const ip2 = useLocalStorage('ip2', "10.10.87.82");

const walkIns = ref<{ scheduledTime: Date, title: string, auditorium: string, i: number }[]>([]);

const lines: { [key: string]: (...arg: any[]) => DisplayLine } = {
    empty: () => ({ fcolor: 3, bcolor: 0, textString: "", enabled: false, align: 'left', speed: 0x07 }),
    black: () => ({ fcolor: 3, bcolor: 0, textString: "", enabled: true, align: 'left', speed: 0x07 }),
    ticker: (fallback = lines.black()) => (tickerText.value.length ? { fcolor: 1, bcolor: 0, textString: tickerText.value, enabled: true, align: tickerText.value.replace(/~[CB]\d;|~[FNRI];/g, '').length > 60 ? 'marquee' : 'center', speed: 0x07 } : fallback)
}

const presetConfigurations: { [key: string]: { name: string, lines: () => DisplayLine[] } } = {
    "walkin": {
        name: "Voorstellingen",
        lines: () => [
            {
                textString: `Welkom bij ${theatreName.value}!`.padEnd(56) + "Zaal",
                fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'left', speed: 0x07
            },
            ...repeatDisplayLine(6),
            lines.ticker(lines.empty())
        ]
    },
    "walkout": {
        name: "Uitloop",
        lines: () => [
            ...repeatDisplayLine(2, lines.black()),
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
                textString: `${theatreName.value}`,
                fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            lines.black(), lines.ticker()
        ]
    },
    "noinfo": {
        name: "Geen info",
        lines: () => [
            ...repeatDisplayLine(2, lines.black()),
            {
                textString: `Welkom bij ${theatreName.value}!`,
                fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            {
                textString: "De timetable toont momenteel geen actuele",
                fcolor: 0x03, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            {
                textString: "informatie. Raadpleeg je ticket, de schermen bij",
                fcolor: 0x03, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            {
                textString: "de kassa of een medewerker voor het zaalnummer.",
                fcolor: 0x03, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            lines.black(), lines.ticker()
        ]
    }
}

const showsSoon = computed(() => {
    return [...walkIns.value]
        .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
        .filter(show =>
            show.scheduledTime.getTime() - now.value.getTime() > -(hideTime.value * 60000) &&
            show.scheduledTime.getTime() - now.value.getTime() < 180 * 60000
        ); // shows starting within -17 minutes and 3 hours from now
});

const autoConfiguration = computed(() => {
    if (showsSoon.value.length)
        return presetConfigurations['walkin'].lines(); // if there's a show starting within -17 minutes and 3 hours from now
    else if (now.value.getHours() >= 21 || now.value.getHours() < 1)
        return presetConfigurations['walkout'].lines(); // else if it's between 21:00 and 00:59
    else
        return presetConfigurations['noinfo'].lines(); // else if it's between 01:00 and 20:59
});
const manualConfiguration = ref<DisplayLine[]>(presetConfigurations['walkin'].lines());
const currentConfiguration = computed(() => autoConfigure.value ? autoConfiguration.value : manualConfiguration.value);

store.$subscribe(() => {
    if (!store.table.length) return;
    if (autoSend.value) {
        nextTick(() => {
            sendData();
        });
    }

    walkIns.value = [...store.table]
        .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
        .map((show, i) => ({
            scheduledTime: show.scheduledTime,
            title: show.title.replace(/[–-—]/g, '-').split('').filter(char => char in qmln.characterSet).join(''),
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

function repeatDisplayLine(length: number, line: DisplayLine = lines.empty()): DisplayLine[] {
    return Array.from({ length }, () => ({ ...line }));
}

function fillEmptyLinesWithShows(displayLines: DisplayLine[], now?: Date): DisplayLine[] {
    let result: DisplayLine[] = [];

    let showIndex = 0;
    for (let lineNumber = 0; lineNumber < displayLines.length; lineNumber++) {
        if (!displayLines[lineNumber].enabled) {
            let show = showsSoon.value[showIndex++];
            if (!show) {
                result.push({
                    textString: "", enabled: true, fcolor: 0x03, bcolor: 0x00, align: 'left', speed: 0x07
                });
                continue;
            }

            const isStarted = show.scheduledTime.getTime() - Date.now() < -(isStartedTime.value * 60000);
            const aboutToStart = show.scheduledTime.getTime() - Date.now() < -(aboutToStartTime.value * 60000) && !isStarted;

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

function generatePacket(displayLines: DisplayLine[] = fillEmptyLinesWithShows(currentConfiguration.value)): qmln.Packet {
    if (
        autoBlack.value && !showsSoon.value.length && (
            (new Date().getHours() >= 1 && new Date().getHours() < 9) ||
            (new Date().getHours() === 9 && new Date().getMinutes() < 30)
        )
    ) {
        return new qmln.Packet(
            null,
            null,
            new qmln.FunctionSendToInitialSegment([
                new qmln.CommandClearBuffer(),
                new qmln.CommandDisplayBuffer(null, null, 0x09),
                new qmln.CommandEndOfSegmentData(),
            ])
        );
    }

    let stillTextCommands: qmln.CommandShowTextString[] = [];
    let marqueeTextCommands: qmln.CommandShowTextImmediately[] = [];

    for (let i = 0; i < displayLines.length; i++) {
        const line = displayLines[i];
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
            new qmln.CommandDisplayBuffer(null, Number(animation.value), Number(animationSpeed.value)),
            ...marqueeTextCommands,
            new qmln.CommandEndOfSegmentData(),
        ])
    );
}

async function sendData(hex: string = generatePacket().toString(), force = false) {

    const ips = [ip1.value, ip2.value].filter(ip => ip.length);

    if (sending.value) return;

    if (!force && hex === lastSentPacket.value && ips.every((ip, i) => lastSentStatus.value[i] === "ok")) {
        console.info("No changes detected, skipping send.");
        return;
    }

    console.info("Sending data...");

    sending.value = true;

    await Promise.allSettled(
        ips.map(async (ip, i) => {
            try {
                const res = await fetch(receiveBeta.value ? "http://localhost:5000/send-and-receive" : "http://localhost:5000/send-bytes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ip,
                        port: "9100",
                        hex
                    })
                });

                if (res.ok) {
                    lastSentStatus.value[i] = "ok"
                    if (receiveBeta.value) {
                        console.log(`Response from ${ip}:`, res);
                        const json = await res.json();
                        console.log(`Response from ${ip} as JSON:`, json);
                    } else {
                        console.log(`Successfully sent to ${ip}`);
                    }
                } else {
                    const json = await res.json();
                    throw new Error(`HTTP error: ${res.status} ${res.statusText} ${json.message}`);
                }
            } catch (err) {
                console.error(`Failed to send to ${ip}:`, err);
                lastSentStatus.value[i] = "error";
            }
        })
    );

    lastSentTime.value = new Date();
    lastSentPacket.value = hex.toString();

    sending.value = false;
}

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

function padCenter(string: string, maxLength: number, fillString: string = ' ') {
    const pad = Math.floor((maxLength - string.replace(/~[CB]\d;|~[FNRI];/g, '').length) / 2);
    const result = fillString.repeat(pad) + string + fillString.repeat(maxLength - string.replace(/~[CB]\d;|~[FNRI];/g, '').length - pad);
    return result;
}

let intervalId: ReturnType<typeof setInterval> | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
    walkIns.value = [...store.table]
        .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
        .map((show, i) => ({
            scheduledTime: show.scheduledTime,
            title: show.title.replace(/[–-—]/g, '-').split('').filter(char => char in qmln.characterSet).join(''),
            auditorium: show.auditorium === 'Rooftop' ? 'RT' : show.auditorium.replace(/^\w+\s/, '').split(' ')[0],
            i
        }));

    timeoutId = setTimeout(() => {
        if (autoSend.value) sendData();
        intervalId = setInterval(() => {
            if (autoSend.value) sendData();
        }, 10000);
    }, 10000 - Date.now() % 10000);
});

onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId);
    if (timeoutId) clearTimeout(timeoutId);
});
</script>

<template>
    <section>

        <div style="display: flex; gap: 32px; flex-wrap: wrap;">

            <div style="flex: 585px 0 0;">
                <h2>Voorbeeld</h2>

                <div class="block" id="matrix-display" :class="{
                    blackout: autoBlack && !showsSoon.length && (
                        (new Date().getHours() >= 1 && new Date().getHours() < 9) ||
                        (new Date().getHours() === 9 && new Date().getMinutes() < 30)
                    )
                }">
                    <span id="matrix-display-title">Pathé Timetable</span>
                    <pre class="matrix-clock">{{ format(now, 'HH:mm') }}</pre>
                    <div v-for="(line, i) in fillEmptyLinesWithShows(currentConfiguration, now)" class="matrix-row"
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
                <br>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px">
                    <small>Laatst verzonden om
                        {{ lastSentTime ? format(lastSentTime, 'HH:mm:ss') : 'onbekend' }}</small>
                    <small>{{ sending ? "Verzenden..." : "" }}</small>
                    <small v-for="(status, i) in lastSentStatus" :key="i">
                        Scherm {{ i + 1 }}: {{
                            !status ? "Niets verzonden" :
                                status === 'ok' ? "OK" :
                                    status === 'error' ? "Fout" :
                                        status
                        }}
                    </small>
                </div>
                <p>
                    Dit voorbeeld is slechts indicatief.
                    <br><br>
                    <b>Tip:</b> In invoervelden kunnen de volgende codes worden gebruikt:<br>
                    <code>~Cn;</code>&emsp; tekstkleur (waarbij n = 0, 1, 2 of 3)<br>
                    <code>~Bn;</code>&emsp; achtergrondkleur (waarbij n = 0, 1, 2 of 3)<br>
                    <code>~R; </code>&emsp; kleuren omwisselen<br>
                    <code>~I; </code>&emsp; kleuren resetten<br>
                    <code>~F; </code>&emsp; knipperen<br>
                    <code>~N; </code>&emsp; niet meer knipperen<br>
                </p>

            </div>

            <SidePanel style="flex: 40% 1 1">
                <h2>Opties</h2>
                <Tabs>

                    <Tab value="Algemeen">
                        <fieldset>
                            <legend>Teksten</legend>
                            <InputText identifier="theatreName" v-model="theatreName">
                                Naam theater
                            </InputText>
                            <InputText identifier="tickerText" v-model="tickerText">
                                Lichtkrant
                                <template #datalist>
                                    <option
                                        value="De ~C3;Rooftop~C1; is weer geopend! Check pathé.nl of de Pathé-app voor alle voorstellingen.">
                                        Rooftop weer open</option>
                                    <option
                                        value="Deze zomer: 5 avonden per week een film op de ~C3;Rooftop~C1;! Check pathé.nl of de Pathé-app.">
                                        Rooftop zomervakantie</option>
                                    <option value="Nieuw: ervaar ~C2;IMAX~C1; nu ook in Utrecht!">
                                        IMAX Utrecht - opening
                                    </option>
                                    <option
                                        value="Nieuw: ervaar ~C2;filmtitel 1~C1; & ~C2;filmtitel 2~C1; nu in ~C2;IMAX~C1;!">
                                        IMAX Utrecht - films</option>
                                </template>
                            </InputText>
                        </fieldset>

                        <fieldset>
                            <legend>Timing</legend>
                            <InputNumber identifier="aboutToStartTime" v-model="aboutToStartTime" unit="min">
                                'Gaat starten' tonen na
                                <small>De tekst 'gaat starten' verschijnt tussen {{ aboutToStartTime }} en {{
                                    isStartedTime }} minuten
                                    na de aanvangstijd.</small>
                            </InputNumber>
                            <InputNumber identifier="isStartedTime" v-model="isStartedTime" unit="min">
                                'Is gestart' tonen na
                                <small>De tekst 'is gestart' verschijnt tussen {{ isStartedTime }} en {{ hideTime }}
                                    minuten
                                    na de aanvangstijd.</small>
                            </InputNumber>
                            <InputNumber identifier="hideTime" v-model="hideTime" unit="min">
                                Voorstellingen verbergen na
                                <small>Voorstellingen worden tot {{ hideTime }} minuten
                                    na de aanvangstijd getoond op het bord.</small>
                            </InputNumber>
                        </fieldset>

                        <fieldset>
                            <legend>Automatisering</legend>
                            <InputSwitch identifier="autoConfigure" v-model="autoConfigure">
                                Best passende weergave gebruiken
                                <small>
                                    Als er inlopen zijn in de komende 3 uur, dan wordt de configuratie
                                    <i>Voorstellingen</i> getoond.<br>
                                    Anders wordt tussen 21:00 en 01:00 de configuratie <i>Uitloop</i> getoond.<br>
                                    Anders wordt de configuratie <i>Geen info</i> getoond.
                                </small>
                            </InputSwitch>
                            <InputSwitch identifier="autoBlack" v-model="autoBlack">
                                Verlichting 's nachts uitschakelen
                                <small>
                                    Tussen 01:00 en 09:30 is het bord zwart als er in de komende 3 uur geen inlopen
                                    zijn.
                                </small>
                            </InputSwitch>
                        </fieldset>

                        <fieldset>
                            <legend>Overig</legend>
                            <InputSelect identifier="animation" v-model="animation">
                                Animatie
                                <template #options>
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
                            </InputSelect>
                            <InputNumber identifier="animationSpeed" v-model="animationSpeed" :min="0" :max="9"
                                unit="/9">
                                Animatiesnelheid
                            </InputNumber>
                        </fieldset>
                    </Tab>

                    <Tab value="Voorstellingen">
                        <p v-if="walkIns.some(walkIn => walkIn.title.length > 38)"><b>Let op:</b> roodgekleurde
                            filmtitels zijn te
                            lang en
                            worden mogelijk afgekapt.</p>
                        <InputSwitch v-if="walkIns.length" identifier="syncFilmTitles"
                            style="max-width: 650px; margin-bottom: 16px;" v-model="syncFilmTitles">
                            Alle identieke filmtitels tegelijk bewerken
                        </InputSwitch>
                        <div>
                            <TransitionGroup name="list">
                                <div v-for="(walkIn) in [...walkIns].sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())"
                                    class="flex walkin" :key="walkIn.i" :id="`walkin-${walkIn.i}`"
                                    :style="{ opacity: (walkIn.scheduledTime.getTime() - Date.now() < -(hideTime * 60000) && walkIn.scheduledTime.getTime() - Date.now() < (180 * 60000)) ? 0.5 : 1 }">
                                    <InputDate class="no-label walkin-time" :identifier="`walkin-${walkIn.i}-time`"
                                        v-model="walkIn.scheduledTime">
                                    </InputDate>
                                    <InputText class="no-label walkin-title" :spellcheck="false" autocomplete="off"
                                        :identifier="`walkin-${walkIn.i}-title`" :model-value="walkIn.title"
                                        @update:model-value="(value) => {
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
                                    <Icon style="float: right; cursor: pointer; padding: 2px;"
                                        @click="walkIns.splice(walkIns.findIndex(w => w.scheduledTime === walkIn.scheduledTime && w.title === walkIn.title && w.auditorium === walkIn.auditorium), 1)">
                                        delete</Icon>
                                </div>
                            </TransitionGroup>
                            <p v-if="!walkIns.length">Geen voorstellingen gepland.</p>
                        </div>
                        <Button class="secondary"
                            @click="walkIns.push({ scheduledTime: new Date(), title: '', auditorium: '', i: walkIns.length })">
                            <Icon>add</Icon>
                            <span>Nieuwe voorstelling</span>
                        </Button>
                    </Tab>

                    <Tab value="Weergave">
                        <fieldset>
                            <legend>Automatisering</legend>
                            <InputSwitch identifier="autoConfigure" v-model="autoConfigure">
                                Best passende weergave gebruiken
                                <small>
                                    Als er inlopen zijn in de komende 3 uur, dan wordt de configuratie
                                    <i>Voorstellingen</i> getoond.<br>
                                    Anders wordt tussen 21:00 en 01:00 de configuratie <i>Uitloop</i> getoond.<br>
                                    Anders wordt de configuratie <i>Geen info</i> getoond.
                                </small>
                            </InputSwitch>
                            <InputSwitch identifier="autoBlack" v-model="autoBlack">
                                Verlichting 's nachts uitschakelen
                                <small>
                                    Tussen 01:00 en 09:30 is het bord zwart als er in de komende 3 uur geen inlopen
                                    zijn.
                                </small>
                            </InputSwitch>
                        </fieldset>

                        <fieldset v-if="!autoConfigure">
                            <legend>Voorgedefinieerde configuraties</legend>
                            <small>
                                Let op: eigen configuraties kunnen nog niet worden opgeslagen.<br>
                                Als je één van de onderstaande configuraties selecteert, dan wordt de eigen configuratie
                                overschreven.<br>
                            </small>
                            <div class="flex buttons">
                                <Button class="secondary" v-for="(preset, key) in presetConfigurations" :key="key"
                                    @click="manualConfiguration = preset.lines()">
                                    {{ preset.name }}
                                </Button>
                            </div>
                        </fieldset>

                        <fieldset v-if="!autoConfigure">
                            <legend>Configuratie</legend>
                            <small>
                                Onderstaande statische configuratie wordt op het bord weergegeven.<br>
                                Regels met het selectievakje uit worden gevuld met geplande inlopen.
                            </small>
                            <div id="display-lines">
                                <div class="display-line" v-for="(line, i) in manualConfiguration" :key="i">
                                    <div class="flex">
                                        <InputCheckbox class="no-label" :identifier="`line-${i}-enabled`"
                                            v-model="line.enabled" />
                                        <InputText class="no-label" :identifier="`line-${i}-text`"
                                            v-model="line.textString"
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
                        </fieldset>
                    </Tab>

                    <Tab value="Geavanceerd">
                        <fieldset>
                            <legend>Verbinding</legend>
                            <div class="flex" style="flex-direction: column;">
                                <InputText v-model="ip1" identifier="ip">
                                    <span>IP-adres scherm 1</span>
                                </InputText>
                                <InputText v-model="ip2" identifier="ip2">
                                    <span>IP-adres scherm 2</span>
                                </InputText>
                                <InputSwitch v-model="autoSend" identifier="autoSend">
                                    <span>Automatisch verzenden</span>
                                </InputSwitch>
                                <InputSwitch v-model="receiveBeta" identifier="receiveBeta">
                                    <span><code>receive</code> gebruiken</span>
                                    <small>Bèta</small>
                                </InputSwitch>

                                <div class="flex buttons">
                                    <Button class="" @click="sendData(new qmln.Packet(
                                        null, null, new qmln.FunctionSetClock(new Date())
                                    ).toString())" :disabled="sending">
                                        <Icon>update</Icon>
                                        <span>Klok bijwerken</span>
                                    </Button>
                                    <Button class="secondary" @click="sendData()" :disabled="sending">
                                        <Icon>send</Icon>
                                        <span>Nu verzenden</span>
                                    </Button>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend>Laatst verzonden pakket</legend>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px">
                                <small>Laatst verzonden om
                                    {{ lastSentTime ? format(lastSentTime, 'HH:mm:ss') : 'onbekend' }}</small>
                                <small>{{ sending ? "Verzenden..." : "" }}</small>
                                <small v-for="(status, i) in lastSentStatus" :key="i">
                                    Scherm {{ i + 1 }}: {{
                                        !status ? "Niets verzonden" :
                                            status === 'ok' ? "OK" :
                                                status === 'error' ? "Fout" :
                                                    status
                                    }}
                                </small>
                            </div>
                            <div class="flex">
                                <pre style="width: 48ch;">{{ lastSentPacket }}</pre>
                                <pre style="width: 16ch;">{{
                                    hexToAscii(lastSentPacket)
                                        .replace(/[\n\r\t]/g, " ")
                                        .match(/.{1,16}/g)
                                        ?.join('\n')
                                }}</pre>
                            </div>
                        </fieldset>
                    </Tab>

                </Tabs>
            </SidePanel>
        </div>
    </section>
</template>

<style scoped>
pre {
    height: auto;
    white-space: break-spaces;
    overflow-wrap: anywhere;
}

:deep(#tickerText) {
    width: 75%;
    max-width: none;
    font-family: monospace;
}

:deep(.modal-content) {
    max-width: max-content;
}

#walkin-editor :deep(.modal-content) {
    overflow: hidden;
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

    &.blackout {
        .matrix-clock {
            color: #000 !important;
        }

        .matrix-row>div>span {
            color: #000 !important;
        }
    }
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
    animation: marquee-reverse 10s steps(12) infinite;
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