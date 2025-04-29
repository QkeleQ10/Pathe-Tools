<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useDropZone, useUrlSearchParams } from '@vueuse/core';
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { Show } from '@/classes/classes';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useServerStore } from '@/stores/server';

const store = useTmsScheduleStore();
const serverStore = useServerStore();

const params = useUrlSearchParams('history');

const downloaded = ref(false);

store.$subscribe(() => {
    if (!params.download || !store.table?.length || narrowcastXml.value.length < 10 || downloaded.value) return;

    const blob = new Blob([narrowcastXml.value], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'timetable.xml';
    link.click();
    URL.revokeObjectURL(link.href);

    downloaded.value = true;
});

const narrowcastXml = computed(() => {
    const indent = (level: number) => '  '.repeat(level);
    const xmlContent = store.table
        .map((show, index) => showToXml(show, index).split('><').join(`>\n${indent(2)}<`))
        .join(`\n${indent(1)}`);
    return `<voorstellingen>\n${indent(1)}${xmlContent}\n</voorstellingen>`;
});

function showToXml(show: Show, index: number) {
    return `<Shows><ID type="Long Integer">${index}</ID><DatumVan type="Date/Time">${format(show.scheduledTime, 'dd-MM-yyyy')}</DatumVan><DatumTot type="Date/Time">${format(show.scheduledTime, 'dd-MM-yyyy')}</DatumTot><Tijd type="Date/Time">${format(show.scheduledTime, 'HH:mm')}</Tijd><Titel type="Text">${show.playlist}</Titel><Zaal type="Text">${show.auditoriumNumber}</Zaal><Kleur type="Long Integer">3</Kleur><Permanent type="Long Integer">1</Permanent></Shows>`;
}

function setUrl() {
    params.url = 'https://pathe-tools-server.onrender.com';
    serverStore.url = 'https://pathe-tools-server.onrender.com';
    store.connect();
}

const main = ref<HTMLElement>(null);
const { isOverDropZone } = useDropZone(main, {
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
});
</script>

<template>
    <main ref="main">
        <HeroImage />
        <TimetableUploadSection />
        <section>
            <div style="display: grid; grid-template-columns: 1fr auto; gap: 32px;">

                <div id="instructions">
                    <h2>Timetable vullen</h2>
                    <div v-if="serverStore.url === 'http://localhost:3541'">
                        <p>
                            Het serveradres is niet ingesteld.
                        </p>
                        <Button class="primary" @click="setUrl">Oplossen</Button>
                    </div>
                    <div
                        v-else-if="['send-error', 'receive-error', 'no-credentials', 'no-connection', 'error'].includes(store.status)">
                        <p>
                            Er is geen verbinding met de server. Controleer de inloggegevens.
                        </p>
                        <Button class="primary" @click="store.connect">Opnieuw verbinden</Button>
                    </div>
                    <div v-else-if="['sending', 'receiving'].includes(store.status)">
                        <p>
                            Er wordt verbinding gemaakt. Een ogenblik geduld...
                        </p>
                    </div>
                    <div
                        v-else-if="!params.download && !store.table.length && ['sent', 'received'].includes(store.status)">
                        <p>
                            Upload een <b>TSV</b>-bestand uit RosettaBridge (optie <b>Dates - ISO</b>) met de knop
                            of
                            door hem
                            hierheen te slepen. Let op dat je het bestand voor de juiste datum uploadt.
                        </p>
                    </div>
                    <div
                        v-else-if="params.download && !store.table.length && ['sent', 'received'].includes(store.status)">
                        <p>
                            Er is nog geen bestand geüpload! Ga naar de RosettaBridge-PC en open deze pagina.
                        </p>
                    </div>
                    <div
                        v-else-if="!params.download && store.table.length && ['sent', 'received'].includes(store.status)">
                        <p>
                            De weergegeven gegevens zijn
                            {{ store.status === 'sent' ? 'geüpload naar' : 'al aanwezig op' }}
                            de server.
                            <br><br>
                            Als dit het juiste bestand is, ga dan naar de Timetable-PC en doe het volgende:
                        </p>
                        <ol>
                            <li>Zorg ervoor dat het softwareprogramma 'CineMec TimeTable' (één keer) open staat.</li>
                            <li>Dubbelklik op het bestandje op het bureaublad genaamd 'Voorstellingen ophalen van Pathé
                                Tools.bat'.</li>
                        </ol>
                    </div>
                    <div
                        v-else-if="params.download && store.table.length && ['sent', 'received'].includes(store.status)">
                        <p>
                            De weergegeven gegevens zijn aanwezig op de server. Er wordt nu een bestand
                            gedownload. Zorg ervoor dat dit bestand wordt opgeslagen als 'timetable.xml' in de
                            standaarddownloadmap, als dat niet automatisch gebeurt. Klik eventueel op 'Behouden'.
                        </p>
                    </div>
                </div>

                <div v-show="store.table.length && ['sent', 'received'].includes(store.status)">
                    <h2>Voorbeeld</h2>
                    <p style="max-width: 560px;">
                        Dit is slechts een voorbeeld. Deze pagina staat <u>niet</u> in directe verbinding met de
                        Timetable.<br><br>

                        <span
                            v-if="store.table[0]?.scheduledTime > new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000)">
                            Als je deze gegevens inlaadt in de Timetable, dan worden ze pas vanaf middernacht
                            weergegeven.
                        <br><br></span>

                        <span v-if="store.table.some(show => show.playlist.length > 37)">
                            Sommige titels zijn te lang en moeten mogelijk nog worden verkort
                            ({{store.table.filter(show => show.playlist.length > 37).length}}×).
                        </span>
                    </p>
                    <div class="block" id="matrix-display">
                        <span id="matrix-display-title">Pathé Timetable</span>
                        <pre
                            class="matrix-clock">{{ format(store.table?.[0]?.scheduledTime.getTime() + 840000 || new Date(), 'HH:mm') }}</pre>
                        <pre
                            class="matrix-row green">        Welkom bij Pathé Utrecht Leidsche Rijn!         Zaal</pre>
                        <pre class="matrix-row" v-for="(show, i) in store.table"
                            :class="{
                                overflowing: show.playlist.length > 37
                            }"><div class="col">{{ format(show.scheduledTime, 'HH:mm') }}</div> <div class="col">{{ show.playlist }}</div> <div class="col" :class="{ blink: i === 1 }">{{ i === 0 ? 'is gestart' : i === 1 ? 'gaat beginnen' : '' }}</div> <div class="col">{{ show.auditoriumNumber || '?' }}</div></pre>
                    </div>
                </div>

            </div>
        </section>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </main>
</template>

<style scoped>
#matrix-display {
    position: relative;
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

    &.green {
        color: green;
    }
}

.matrix-clock {
    font-size: larger;
    width: 5ch;
    margin-left: auto;
    margin-bottom: 16px;
}

.matrix-row {
    width: 60ch;

    &.overflowing:before {
        content: '';
        position: absolute;
        top: 0;
        left: 43ch;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid red;

        transform: rotate(45deg);
    }

    &.overflowing:hover .col:nth-of-type(2) {
        overflow-x: visible;
    }

    .col {
        display: inline-block;
        overflow-x: hidden;

        &:nth-of-type(1) {
            width: 5ch;
        }

        &:nth-of-type(2) {
            width: 37ch;
        }

        &:nth-of-type(3) {
            width: 13ch;
            color: red;
            opacity: .2;
        }

        &:nth-of-type(4) {
            width: 2ch;
        }

        &.blink {
            animation: blink 1s infinite;
        }
    }
}

@keyframes blink {

    0%,
    100% {
        opacity: 0;
    }

    50% {
        opacity: 0.2;
    }
}
</style>
