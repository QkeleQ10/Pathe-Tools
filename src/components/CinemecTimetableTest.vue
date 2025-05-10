<script setup lang="ts">
import { ref } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import { format } from 'date-fns';
import InputCheckbox from './InputCheckbox.vue';

const params = useUrlSearchParams('history');

const store = useTmsScheduleStore();

const show = ref(params.prototype ? true : false);
const host = ref("http://localhost:5000/send-bytes");
const ip = ref("10.10.87.81");
const ip2 = ref("10.10.87.82");
const port = ref("9100");
const repeat = ref(true);

function generateTimestampHex() {
    const date = new Date();

    const year = date.getFullYear() - 1900; // tm_year
    const month = date.getMonth() + 1;      // tm_mon (1–12)
    const mday = date.getDate();            // tm_mday
    const wday = date.getDay();             // tm_wday (0=Sun)
    const hour = date.getHours();           // tm_hour
    const minute = date.getMinutes();       // tm_min
    const second = date.getSeconds();       // tm_sec
    const centiseconds = Math.floor(date.getMilliseconds() / 10); // extra byte

    const bytes = [year, month, mday, wday, hour, minute, second, centiseconds];

    return bytes.map(b => b.toString(16).padStart(2, '0')).join(' ');
}

const input = ref(`AA BB 00 00 00 00 00 08 08 01 ${generateTimestampHex()} AA BB 00 00 00 00 00 F0 F0 00 01 03 00 03 00 00 01 "De timetable toont momenteel geen actuele   " 00 03 00 03 00 3A 01 "  " 00 03 00 03 00 00 02 "informatie. Raadpleeg uw ticket of de       " 00 03 00 03 00 3A 02 "  " 00 03 00 03 00 00 03 "schermen bij de kassa voor het zaalnummer.  " 00 03 00 03 00 3A 03 "  " 00 04 02 00 03 00 37 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 1F 6E AA BB 00 00 00 00 00 01 01 21 21`);

store.$subscribe(() => {
    updateInput();
});

setInterval(() => {
    updateInput();
}, 1000);

function updateInput() {
    if (!store.table.length) return;

    let futureShows = store.table.filter(show => show.scheduledTime.getTime() - Date.now() > -900000);
    let str = `AA BB 00 00 00 00 00 08 08 01 ${generateTimestampHex()} AA BB 00 00 00 00 00 F0 F0 00 01 `;

    for (let i = 1; i <= 8; i++) {
        let show = futureShows[i - 1];
        if (!show) break; // Stop if there are no more shows

        str += `03 00 03 00 00 0${i} "${format(show.scheduledTime, 'HH:mm')} ${show.playlist.substring(0, 38).padEnd(38)}" 00`;
        str += ` 03 00 03 00 3A 0${i} "${show.auditorium.replace(/^\w+\s/, '').substring(0, 2).padStart(2)}" 00`;
    }

    str += `04 02 00 03 00 37 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 1F 6E AA BB 00 00 00 00 00 01 01 21 21`;

    input.value = str;
}

function parseHexTextString(input) {
    let result = [];
    let regex = /"([^"]*)"|(\b[0-9A-Fa-f]{2}\b)/g;
    let match;

    while ((match = regex.exec(input)) !== null) {
        if (match[1] !== undefined) {
            // Convert quoted text to hex
            let textHex = [...match[1]].map(char => char.charCodeAt(0).toString(16).padStart(2, '0'));
            result.push(...textHex);
        } else {
            // It's a hex byte, add directly
            result.push(match[2]);
        }
    }

    return result.join(" ").toUpperCase();
}

async function sendRequest() {
    await fetch(host.value, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ip: ip.value,
            port: port.value,
            hex: parseHexTextString(input.value) // the full hex string
        })
    });
    await fetch(host.value, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ip: ip2.value,
            port: port.value,
            hex: parseHexTextString(input.value) // the full hex string
        })
    });

    if (repeat.value) {
        setTimeout(() => {
            sendRequest();
        }, 10000);
    }
}

function hexToAscii(hexString) {
    // Remove spaces and split into an array of hex bytes
    const hexBytes = hexString.trim().split(/\s+/);

    // Convert each byte to a character and join them into a single string
    const asciiString = hexBytes.map(byte => {
        const charCode = parseInt(byte, 16);
        return String.fromCharCode(charCode);
    }).join('');

    return asciiString;
}

</script>

<template>
    <ModalDialog v-if="show" @dismiss="show = false">
        <textarea v-model="input" identifier="input"></textarea>
        <div class="flex">
            <pre style="width: 48ch;">{{ parseHexTextString(input) }}</pre>
            <pre style="width: 16ch;">{{ hexToAscii(parseHexTextString(input)).match(/.{1,16}/g).join('\n') }}</pre>
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
        <InputText v-model="port" identifier="port">
            <span>port</span>
        </InputText>

        <InputCheckbox v-model="repeat" identifier="repeat">
            <span>repeat</span>
        </InputCheckbox>

        <Button @click="sendRequest">sendRequest</Button>
    </ModalDialog>
    <Button class="secondary" @click="show = true" style="opacity: 0.2;">Prototype-test</Button>
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
</style>