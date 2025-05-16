<script setup lang="ts">
import { ref } from 'vue';
import { useUrlSearchParams } from '@vueuse/core';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import * as qmln from '@/utils/qmln'
import { format } from 'date-fns';
import InputCheckbox from './InputCheckbox.vue';

const params = useUrlSearchParams('history');

const store = useTmsScheduleStore();

const show = ref(params.prototype ? true : false);
const host = ref("http://localhost:5000/send-bytes");
const ip = ref("10.10.87.81");
const ip2 = ref("10.10.87.82");
const port = ref("9100");
const repeat = ref(false);

const funcs = {
    testMessage: () => {
        return new qmln.Packet(
            null,
            null,
            new qmln.FunctionSendToInitialSegment([
                new qmln.CommandClearBuffer(),
                new qmln.CommandShowTextString(
                    null, 0x03, 0x00, 0x37, 0x00, format(new Date(), 'HH:mm')
                ),
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
                    null, 0x14, 0x09
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
                new qmln.CommandShowTextString(
                    null, 0x03, 0x00, 0x37, 0x00, format(new Date(), 'HH:mm')
                ),
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
                    null, 0x14, 0x09
                ),
                new qmln.CommandEndOfSegmentData(),
            ]))
    },
    schedule: () => {
        const next7Shows = store.table.filter(show => show.scheduledTime.getTime() - Date.now() > -900000).sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime()).slice(0, 7)

        if (!next7Shows.length) return funcs.thankYou()

        return new qmln.Packet(
            null,
            null,
            new qmln.FunctionSendToInitialSegment([
                new qmln.CommandClearBuffer(),
                new qmln.CommandShowTextString(
                    null, 0x03, 0x00, 0x37, 0x00, format(new Date(), 'HH:mm')
                ),
                new qmln.CommandShowTextString(
                    null, 0x02, 0x00, 0x00, 0x01, "Welkom bij Pathé Utrecht Leidsche Rijn!                 Zaal"
                ),
                ...(next7Shows.map((show, index) => {
                    return new qmln.CommandShowTextString(
                        null, 0x03, 0x00, 0x00, index + 2,
                        `${format(show.scheduledTime, 'HH:mm')} ${show.title.substring(0, 38).padEnd(38)} ${show.scheduledTime.getTime() - Date.now() < 300000 ? '~F;~C1;' : '~C0;'}${show.scheduledTime.getTime() - Date.now() < -540000 ? '  is gestart' : 'gaat starten'} ~N;~I;~C3;${show.auditoriumNumber.toString().substring(0, 2).padStart(2)}`
                    )
                })),
                new qmln.CommandDisplayBuffer(
                    null, 0x14, 0x09
                ),
                new qmln.CommandEndOfSegmentData(),
            ])
        )
    }
}

const input = ref(funcs.testMessage().toString());

async function sendRequest() {
    if (ip.value) {
        let res1 = await fetch(host.value, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ip: ip.value,
                port: port.value,
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
                port: port.value,
                hex: input.value // the full hex string
            })
        });
        console.log(res2);
    }

    if (repeat.value) {
        setTimeout(() => {
            input.value = funcs.schedule().toString();
            sendRequest();
        }, 30000);
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
</script>

<template>
    <ModalDialog v-if="show" @dismiss="show = false">
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