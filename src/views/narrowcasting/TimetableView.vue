<script setup lang="ts">
import { ref, computed, inject, useTemplateRef, onBeforeUnmount, onMounted, Ref, h, provide } from 'vue';
import { useStorage, useDropZone } from '@vueuse/core';
import { DisplayLine } from '@/scripts/types';
import { useTmsScheduleStore } from '@/stores/tmsSchedule.ts';
import * as qmln from '@/scripts/qmln.ts';
import { format } from 'date-fns';
import { showDialog } from '@/scripts/dialogManager.ts';

import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue';
import Settings from '@/components/features/narrowcasting/timetable/Settings.vue';
import StatusBox from '@/components/ui/StatusBox.vue';

const now = inject<Ref<Date>>('now');

const store = useTmsScheduleStore();

const syncFilmTitles = ref(true);

const addresses = useStorage('addresses', ["10.10.87.81", "10.10.87.82"]);

const health = ref<('healthy' | 'unhealthy' | 'unknown')>('unknown');

const available = ref<boolean[]>(new Array(addresses.value.length).fill(false));
const sending = ref<boolean[]>(new Array(addresses.value.length).fill(false));
const sendStatus = ref<("ok" | "error" | null)[]>(new Array(addresses.value.length).fill(null));
const sendTime = ref<(Date | null)[]>(new Array(addresses.value.length).fill(null));

const lastSentPacket = ref<string | null>(null);
provide('lastSentPacket', lastSentPacket);

const lastReceivedPacket = ref<string | null>(null);
provide('lastReceivedPacket', lastReceivedPacket);

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

const walkIns = ref<{ scheduledTime: Date, title: string, auditorium: string, i: number }[]>([]);

const lines: { [key: string]: (...arg: any[]) => DisplayLine } = {
    empty: () => ({ fcolor: 3, bcolor: 0, textString: "", enabled: false, align: 'left', speed: 0x07 }),
    black: () => ({ fcolor: 3, bcolor: 0, textString: "", enabled: true, align: 'left', speed: 0x07 }),
    motd: (fallback = lines.black()) => (motd.value.length ? { fcolor: 1, bcolor: 0, textString: motd.value, enabled: true, align: motd.value.replace(/~[CB]\d;|~[FNRI];/g, '').length > 60 ? 'marquee' : 'center', speed: 0x07 } : fallback)
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
            lines.motd(lines.empty())
        ]
    },
    "walkout": {
        name: "Uitloopbericht",
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
            lines.black(), lines.motd()
        ]
    },
    "noinfo": {
        name: "Geen gegevens-bericht",
        lines: () => [
            ...repeatDisplayLine(2, lines.black()),
            {
                textString: `Welkom bij ${theatreName.value}!`,
                fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'center', speed: 0x07
            },
            {
                textString: "Deze timetable toont momenteel geen actuele",
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
            lines.black(), lines.motd()
        ]
    },
    "christmas": {
        name: "Kerstboom",
        lines: () => [
            { textString: String.raw`         *          `, fcolor: 0x03, bcolor: 0x00, enabled: true, align: 'left', speed: 0x07 },
            { textString: String.raw`        /.\         `, fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'left', speed: 0x07 },
            { textString: String.raw`       /~C1;o~C2;..\        ~C3;Hartelijk dank voor je filmbezoek.`, fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'left', speed: 0x07 },
            { textString: String.raw`       /..~C1;o~C2;\        ${theatreName.value}`, fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'left', speed: 0x07 },
            { textString: String.raw`      /.~C1;o~C2;..~C1;o~C2;\       ~C3;wenst je prettige feestdagen`, fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'left', speed: 0x07 },
            { textString: String.raw`      /...~C1;o~C2;.\       ~C3;en een gelukkig nieuwjaar!`, fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'left', speed: 0x07 },
            { textString: String.raw`     /..~C1;o~C2;....\      `, fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'left', speed: 0x07 },
            { textString: String.raw`     ^^^[_]^^^      `, fcolor: 0x02, bcolor: 0x00, enabled: true, align: 'left', speed: 0x07 },
        ]
    }
}
provide('presetConfigurations', presetConfigurations);

const showsSoon = computed(() => {
    return [...walkIns.value]
        .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
        .filter(show =>
            show.scheduledTime.getTime() - now.value.getTime() > -(hideTime.value * 60000) &&
            show.scheduledTime.getTime() - now.value.getTime() < 180 * 60000
        ); // shows starting within -17 minutes and 3 hours from now
});

const currentConfiguration = computed(() => {
    if (showsSoon.value.length) {
        // if there's a show starting within -17 minutes and 3 hours from now
        if (autoConfigShows.value === 'manual') return manualConfiguration.value;
        return presetConfigurations[autoConfigShows.value].lines();
    } else if (now.value.getHours() >= 21 || now.value.getHours() < 1) {
        // else if it's between 21:00 and 00:59
        if (autoConfigNoShows.value === 'manual') return manualConfiguration.value;
        return presetConfigurations[autoConfigNoShows.value].lines();
    } else {
        // else if it's between 01:00 and 20:59
        if (autoConfigNoData.value === 'manual') return manualConfiguration.value;
        return presetConfigurations[autoConfigNoData.value].lines();
    }
});

const manualConfiguration = useStorage<DisplayLine[]>('manual-configuration', presetConfigurations['walkin'].lines());

store.$subscribe(loadWalkIns)

function loadWalkIns() {
    if (!store.table.length) return;

    walkIns.value = [...store.table]
        .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
        .map((show, i) => {
            let showTitle = show.title;
            if (additionalPlf.value) showTitle += show.extras.filter(e => ['3D', '4DX', 'IMAX', 'SCREENX', 'ATMOS', 'DOLBY', 'ROOFTOP'].includes(e)).map(e => ` ${e}`).join('');
            if (additionalLanguage.value) showTitle += show.extras.filter(e => ['(NL)', '(OV)'].includes(e)).map(e => ` ${e}`).join('');
            if (additionalAgeRating.value && (show.featureRating === '16' || show.featureRating === '18')) showTitle += ` (16+)`;

            return {
                scheduledTime: show.scheduledTime,
                title: showTitle.replace(/[–-—]/g, '-').split('').filter(char => char in qmln.characterSet).join(''),
                auditorium: show.auditorium === 'Rooftop' ? 'RT' : show.auditorium.replace(/^\w+\s/, '').split(' ')[0],
                i
            }
        });
}

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
            const temp = currentFcolor;
            currentFcolor = currentBcolor;
            currentBcolor = temp;
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

    let longestAuditoriumLength = showsSoon.value.reduce((max, show) => Math.max(max, show.auditorium.toString().replace(/~[CB]\d;|~[FNRI];/g, '').length), 1);

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

            let str = `${format(show.scheduledTime, 'HH:mm')} ${truncateAndPad(show.title, 53 - longestAuditoriumLength)} ${truncateAndPad(show.auditorium, longestAuditoriumLength, 'right')}`;
            if (isStarted) str = `${format(show.scheduledTime, 'HH:mm')} ${truncateAndPad(show.title, 53 - 11 - longestAuditoriumLength)} ~C1;is gestart~C3; ${truncateAndPad(show.auditorium, longestAuditoriumLength, 'right')}`;
            if (aboutToStart) str = `${format(show.scheduledTime, 'HH:mm')} ${truncateAndPad(show.title, 53 - 13 - longestAuditoriumLength)} ~F;~C1;gaat starten~N;~C3; ${truncateAndPad(show.auditorium, longestAuditoriumLength, 'right')}`;

            result.push({
                textString: str, enabled: true, fcolor: 0x03, bcolor: 0x00, align: 'left', speed: 0x07
            });
        } else result.push(displayLines[lineNumber]);
    }

    return result;
}

function generatePacket(displayLines: DisplayLine[] = fillEmptyLinesWithShows(currentConfiguration.value), shiftBeta: boolean = false): qmln.Packet {
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
                line.align === 'marquee' ? 0x06 : line.align === 'marquee-reverse' ? 0x05 : 0x00,
                line.speed, null, line.fcolor, line.bcolor, null, i + 1, line.textString
            ));
        } else {
            stillTextCommands.push(new qmln.CommandShowTextString(
                null, line.fcolor, line.bcolor, null, i + 1,
                truncateAndPad(line.textString, 60, line.align)
            ));
        }
    }

    let displayData = [
        new qmln.CommandClearBuffer(),
        new qmln.CommandShowCurrentTime(),
        ...stillTextCommands,
        new qmln.CommandDisplayBuffer(null, Number(animation.value), Number(animationSpeed.value)),
        ...marqueeTextCommands,
        new qmln.CommandEndOfSegmentData(),
    ]

    if (shiftBeta) {
        console.log("Generating shifted packet");

        let stillTextCommandsShifted: qmln.CommandShowTextString[] = [];

        for (let i = 0; i < displayLines.length; i++) {
            const line = displayLines[i];
            if (!line.enabled) continue;
            if (line.align === 'marquee' || line.align === 'marquee-reverse') continue;
            else {
                let y = i + 1;
                if (line.fcolor === 0x03) {
                    // orange lines are shifted by 1 if the previous line is also orange
                    if (displayLines[i - 1]?.fcolor === 0x03) {
                        // previous line is also orange, shift
                        y--;
                    } else {
                        // previous line is not orange, remove this line
                        continue;
                    }
                }

                stillTextCommandsShifted.push(new qmln.CommandShowTextString(
                    null, line.fcolor, line.bcolor, null, y,
                    truncateAndPad(line.textString, 60, line.align)
                ));
            }
        }

        displayData = [
            ...stillTextCommandsShifted.filter((_, i) => displayLines[i].fcolor === 0x03), // only orange lines are shifted
            new qmln.CommandDisplayBuffer(null, 0x08, 0x07),
            new qmln.CommandClearBuffer(),
            new qmln.CommandShowCurrentTime(),
            ...stillTextCommandsShifted,
            new qmln.CommandDisplayBuffer(null, 0x00, 0x09),
            ...marqueeTextCommands,
            new qmln.CommandEndOfSegmentData(),
        ]
    }

    return new qmln.Packet(
        null,
        null,
        new qmln.FunctionSendToInitialSegment(displayData)
    );
}

async function sendData(hex: string = generatePacket().toString(), force = false) {
    const connectedIps = addresses.value.filter((_, i) => available.value[i]);

    if (sending.value.some(s => s) || health.value !== "healthy" || !connectedIps.length) {
        console.info("Cannot send now.");
        return;
    }

    if (!force && hex === lastSentPacket.value && connectedIps.every((_, i) => sendStatus.value[i] === "ok")) {
        console.info("No changes detected, skipping send.");
        return;
    }

    console.info("Sending data...");

    sending.value = sending.value.map((_, i) => connectedIps.includes(addresses.value[i]));

    await Promise.allSettled(
        connectedIps.map(async (ip, i) => {
            try {
                sendStatus.value[i] = null;

                const res = await fetch("http://localhost:5000/send-and-receive", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ip,
                        port: "9100",
                        hex
                    })
                });

                if (res.ok) {
                    sendStatus.value[i] = "ok"

                    console.log(`Response from ${ip}:`, res);
                    const json = await res.json();
                    console.log(`Response from ${ip} as JSON:`, json);
                    lastReceivedPacket.value = json || null;
                } else {
                    const json = await res.json();
                    throw new Error(`HTTP error: ${res.status} ${res.statusText} ${json.message}`);
                }
            } catch (err) {
                sendStatus.value[i] = "error";
                console.error(`Failed to send to ${ip}:`, err);

                checkMiddlemanHealth();
            }
        })
    );

    sendTime.value = sendTime.value.map((_, i) => connectedIps.includes(addresses.value[i]) ? new Date() : sendTime.value[i]);
    lastSentPacket.value = hex.toString();

    sending.value = sending.value.map((_, i) => false);
}

function truncateAndPad(string: string, maxLength: number, align: 'left' | 'center' | 'right' = 'left'): string {
    let visibleLength = 0;
    let result = '';

    const parts = [...string.matchAll(/(~[CB]\d;|~[FNRI];)|([\s\S])/g)];

    for (const [, format, char] of parts) {
        if (format) {
            result += format; // Add formatting code without increasing visible length
        } else if (char) {
            if (visibleLength < maxLength) {
                result += char;
                visibleLength++;
            } else {
                break;
            }
        }
    }

    const paddingNeeded = maxLength - visibleLength;
    if (paddingNeeded > 0) {
        let leadingSpaces = 0;
        let trailingSpaces = 0;

        switch (align) {
            case 'left':
                trailingSpaces = paddingNeeded;
                break;
            case 'right':
                leadingSpaces = paddingNeeded;
                break;
            case 'center':
                leadingSpaces = Math.floor(paddingNeeded / 2);
                trailingSpaces = paddingNeeded - leadingSpaces;
                break;
        }

        result = ' '.repeat(leadingSpaces) + result + ' '.repeat(trailingSpaces);
    }

    return result;
}

let intervalId: ReturnType<typeof setInterval> | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

onMounted(async () => {
    walkIns.value = [...store.table]
        .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
        .map((show, i) => ({
            scheduledTime: show.scheduledTime,
            title: show.title.replace(/[–-—]/g, '-').split('').filter(char => char in qmln.characterSet).join(''),
            auditorium: show.auditorium === 'Rooftop' ? 'RT' : show.auditorium.replace(/^\w+\s/, '').split(' ')[0],
            i
        }));

    await Promise.allSettled(addresses.value.map((ip, index) => tryConnect(ip, index)));

    sendData();

    timeoutId = setTimeout(() => {
        intervalId = setInterval(() => sendData(), 5000);

        sendData(new qmln.Packet(
            null, null, new qmln.FunctionSetClock(new Date())
        ).toString()); // initial clock sync
    }, 5000 - Date.now() % 5000);
});

onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId);
    if (timeoutId) clearTimeout(timeoutId);
});

async function checkMiddlemanHealth() {
    return new Promise<void>(async (resolve) => {
        health.value = 'unknown';

        try {
            const res = await fetch("http://localhost:5000/health", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                health.value = 'healthy';
            } else {
                const json = await res.json();
                throw new Error(`HTTP error: ${res.status} ${res.statusText} ${json.message}`);
            }
        } catch (err) {
            console.error("Health check failed:", err);
            health.value = 'unhealthy';
            available.value = available.value.map(() => false);
        } finally {
            resolve();
        }
    });
}

async function tryConnect(ip: string, index: number) {
    return new Promise<void>(async (resolve, reject) => {
        await checkMiddlemanHealth();
        if (health.value !== 'healthy') return;

        available.value[index] = false;
        sending.value[index] = true;

        try {
            const res = await fetch("http://localhost:5000/send-and-receive", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ip,
                    port: "9100",
                    hex: new qmln.Packet(
                        null,
                        null,
                        new qmln.FunctionSendPing()
                    ).toString()
                })
            });

            if (res.ok) {
                console.log(`Response from ${ip}:`, res);
                const json = await res.json();
                console.log(`Response from ${ip} as JSON:`, json);

                if (!json?.responseHex?.length) throw new Error(`Invalid response from ${ip}: ${JSON.stringify(json)}`);

                available.value[index] = true;
                sending.value[index] = false;

                console.log(`Successfully connected to ${ip}`);
                resolve();
            } else {
                const json = await res.json();
                throw new Error(`HTTP error: ${res.status} ${res.statusText} ${json.message}`);
            }
        } catch (err) {
            available.value[index] = false;
            sending.value[index] = false;

            console.error(`Failed to connect to ${ip}:`, err);
            reject(err);

            checkMiddlemanHealth();
        }
    });
}

function formatStatus(i: number) {
    return !available.value[i] && sending.value[i] ? "Zoeken..." :
        !available.value[i] ? "Niet verbonden" :
            sending.value[i] ? "Verzenden..." :
                sendStatus.value[i] === 'error' ? `Fout ${sendTime.value[i] ? `om ${format(sendTime.value[i]!, 'HH:mm:ss')}` : ''}` :
                    sendStatus.value[i] === 'ok' ? `OK ${sendTime.value[i] ? `om ${format(sendTime.value[i]!, 'HH:mm:ss')}` : ''}` :
                        sendStatus.value[i];
    // "Nog niets verzonden";
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

const { isOverDropZone } = useDropZone(useTemplateRef('main'), {
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
});
</script>

<template>
    <div ref="main" class="content">
        <div class="layout">

            <main>
                <h1>Timetable</h1>

                <div style="width: min-content; margin: auto;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
                        <StatusBox style="grid-column: 1 / -1" :health="health === 'unknown' ? 'inactive' : health"
                            :working="health === 'unknown'" @click="checkMiddlemanHealth" :clickable="true">
                            <template #label>Achtergrondprogramma</template>
                            <template #description>{{ {
                                healthy: 'In werking',
                                unhealthy: 'Niet in werking',
                                unknown: 'Controleren...'
                            }[health] }}</template>
                        </StatusBox>
                        <template v-for="(address, i) in addresses" :key="i">
                            <StatusBox
                                :health="available[i] ? 'healthy' : (sendStatus[i] === 'error' ? 'unhealthy' : 'inactive')"
                                :working="sending[i]"
                                @click="available[i] ? available[i] = false : tryConnect(address, i)" :clickable="true">
                                <template #label>{{ `Scherm ${i + 1}` }}</template>
                                <template #description>{{ formatStatus(i) }}</template>
                            </StatusBox>
                        </template>
                    </div>
                    <div id="matrix-display" :class="{
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
                </div>
            </main>

            <SidePanel>
                <div class="flex" style="flex-direction: column;">

                    <TimetableUploadSection />

                    <InvokableModalDialog>
                        <template #button-content>
                            <Icon>list</Icon> Voorstellingen bewerken
                        </template>
                        <template #dialog-content>
                            <h3>Voorstellingen</h3>

                            <p v-if="walkIns.some(walkIn => walkIn.title.length > 38)">
                                <b>Let op:</b> roodgekleurde filmtitels zijn te lang en worden mogelijk afgekapt.
                            </p>
                            <InputSwitch v-if="walkIns.length" identifier="syncFilmTitles"
                                style="max-width: 650px; margin-bottom: 16px;" v-model="syncFilmTitles">
                                Alle identieke filmtitels tegelijk bewerken
                            </InputSwitch>
                            <ul class="scrollable-list">
                                <TransitionGroup name="list">
                                    <li v-for="(walkIn) in [...walkIns].sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())"
                                        class="flex walkin" :key="walkIn.i" :id="`walkin-${walkIn.i}`"
                                        :class="{ 'past': walkIn.scheduledTime.getTime() - Date.now() < -(hideTime * 60000) && walkIn.scheduledTime.getTime() - Date.now() < (180 * 60000) }">
                                        <InputDate class="walkin-time" :id="`walkin-${walkIn.i}-time`"
                                            v-model="walkIn.scheduledTime">
                                        </InputDate>
                                        <Input type="text" class="walkin-title" :spellcheck="false" autocomplete="off"
                                            :id="`walkin-${walkIn.i}-title`" :model-value="walkIn.title"
                                            @update:model-value="(value) => {
                                                if (syncFilmTitles) {
                                                    walkIns.filter(walkIn2 => walkIn2.title === walkIn.title).forEach(walkIn2 => walkIn2.title = value);
                                                } else {
                                                    walkIn.title = value;
                                                }
                                            }" :class="{ 'too-long': walkIn.title.length > 38 }">
                                        </Input>
                                        <Input type="text" class="walkin-auditorium" :spellcheck="false"
                                            autocomplete="off" :id="`walkin-${walkIn.i}-auditorium`"
                                            v-model="walkIn.auditorium">
                                        </Input>
                                        <Icon class="delete"
                                            @click="walkIns.splice(walkIns.findIndex(w => w.scheduledTime === walkIn.scheduledTime && w.title === walkIn.title && w.auditorium === walkIn.auditorium), 1)">
                                            close</Icon>
                                    </li>
                                </TransitionGroup>
                                <p v-if="!walkIns.length">Geen voorstellingen gepland.</p>
                            </ul>
                            <div class="flex buttons" style="gap:24px; margin-top: 16px;">
                                <Button class="tertiary"
                                    @click="walkIns.push({ scheduledTime: new Date(), title: '', auditorium: '', i: walkIns.length })">
                                    <span>Voorstelling toevoegen</span>
                                </Button>
                                <Button class="tertiary" @click="showFormattingInfo">
                                    Opmaak
                                </Button>
                            </div>
                        </template>
                    </InvokableModalDialog>

                    <Settings @load-walk-ins="loadWalkIns">
                        <template #connection>
                            <div class="flex buttons" style="gap: 24px;">
                                <Button class="tertiary" @click="sendData(null, true)" :disabled="sending.some(s => s)">
                                    <span>Nu verzenden</span>
                                </Button>
                                <Button class="tertiary" @click="sendData(new qmln.Packet(
                                    null, null, new qmln.FunctionSetClock(new Date())
                                ).toString())" :disabled="sending.some(s => s)">
                                    <span>Klok bijwerken</span>
                                </Button>
                            </div>
                        </template>
                    </Settings>

                </div>

                <div class="spacer"></div>

                <div class="flex" style="flex-direction: column;">
                    <span>Het voorbeeld is slechts indicatief.</span>
                </div>
            </SidePanel>

        </div>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </div>
</template>

<style scoped>
pre {
    height: auto;
    white-space: break-spaces;
    overflow-wrap: anywhere;
}

#matrix-display {
    position: relative;
    font-family: monospace;
    font-size: 14px;
    width: calc(60ch + 48px);

    padding: 16px 20px;
    border-radius: 5px;
    background-color: #090909;
    background-image: linear-gradient(45deg, #0b0b0b 0%, #090909 100%);
    box-shadow: 0 0 10px #00000080;
    outline: 1px solid #ffffff1a;
    background-repeat: no-repeat;
    background-size: 340px 100%;
    color: #ffffffcc;

    &.blackout {
        .matrix-clock {
            color: transparent !important;
        }

        .matrix-row>div>span {
            color: transparent !important;
        }
    }
}

#matrix-display-title {
    position: absolute;
    top: 16px;
    left: 20px;
    font: 28px "Special Gothic Condensed One", Arial, Helvetica, sans-serif;
    text-transform: uppercase;
}

.matrix-clock,
.matrix-row {
    position: relative;
    white-space: pre;

    box-sizing: content-box;
    height: calc(1em + 4px);
    padding: 0 4px;
    margin-block: 4px;
    overflow: hidden;

    background-color: #141414;
    background-image: linear-gradient(45deg, #151515 0%, #131313 100%);
    color: orange;
    border-radius: 2px;
    font-family: monospace;
}

.fcolor0 {
    color: #000;

    &.bcolor0 {
        color: transparent;
    }
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
    background-color: transparent;
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
    font-size: 22px;
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

.walkin {
    display: flex;
    align-items: center;
    gap: 8px;

    &.past>input {
        opacity: 0.5;
    }

    .walkin-time {
        flex: 0 0 150px;
        width: 150px;
        height: 36px;
        font-size: 14px;
        letter-spacing: -1.25px;
    }

    .walkin-title {
        flex: 1 1 400px;
        font-family: monospace;
        font-size: 14px;
        height: 36px;
        padding-right: 0;
    }

    .too-long {
        color: #f15a5a;
    }

    .walkin-auditorium {
        flex: 0 0 52px;
        font-family: monospace;
        font-size: 14px;
        height: 36px;
        padding-right: 0;
    }
}
</style>
