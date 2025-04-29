<script setup lang="ts">
import { ref } from 'vue';

const show = ref(false);
const host = ref("http://localhost:5000/send-bytes");
const ip = ref("10.10.87.81");
const port = ref("9100");

const input = ref(`AA BB 00 00 00 00 00 08 08 01 7D 04 1D 02 13 36 17 55 AA BB 00 00 00 00 00 F0 F0 00 01 03 00 03 00 00 01 "21:00 The Amateur                           " 00 03 00 03 00 3A 01 "4 " 00 03 00 03 00 00 02 "21:20 Until Dawn 4DX                        " 00 03 00 03 00 3A 02 "3 " 00 03 00 03 00 00 03 "21:30 Drop                                  " 00 03 00 03 00 3A 03 "2 " 00 04 02 00 03 00 37 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 07 E8 FD 00 00 1F 6E AA BB 00 00 00 00 00 01 01 21 21`);

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

}
</script>

<template>
    <ModalDialog v-if="show" @dismiss="show = false">
        <textarea v-model="input" identifier="input"></textarea>
        <pre>{{ parseHexTextString(input) }}</pre>

        <InputText v-model="host" identifier="host">
            <span>host</span>
        </InputText>
        <InputText v-model="ip" identifier="ip">
            <span>ip</span>
        </InputText>
        <InputText v-model="port" identifier="port">
            <span>port</span>
        </InputText>

        <Button @click="sendRequest">verzenden</Button>
    </ModalDialog>
    <Button class="secondary" @click="show = true" style="opacity: 0.2;">Prototype-test</Button>
</template>

<style scoped>
textarea,
pre {
    width: 100%;
    height: auto;
    min-height: 200px;
    white-space: pre-wrap;
}
</style>