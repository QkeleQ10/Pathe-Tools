<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDropZone, useUrlSearchParams } from '@vueuse/core';
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { Show } from '@/classes/classes';
import { format } from 'date-fns';
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
            <div class="flex" style="flex-wrap: wrap-reverse;">
                <div style="flex: 100% 1 1;">
                    <h2 style="margin-bottom: 0;">Timetable-matrixdisplay</h2>
                    <p>Dit is een tijdelijke tool waarmee je het matrixdisplay van de Pathé Timetable kunt vullen. Volg
                        de instructies hieronder.</p>
                    <div class="block" v-if="serverStore.url === 'http://localhost:3541'">
                        <p>
                            Het serveradres is niet ingesteld.
                        </p>
                        <Button class="primary" @click="setUrl">Oplossen</Button>
                    </div>
                    <div class="block"
                        v-else-if="['send-error', 'receive-error', 'no-credentials', 'no-connection', 'error'].includes(store.status)">
                        <p>
                            Er is geen verbinding met de server. Controleer de inloggegevens.
                        </p>
                        <Button class="primary" @click="store.connect">Opnieuw verbinden</Button>
                    </div>
                    <div class="block" v-else-if="['sending', 'receiving'].includes(store.status)">
                        <p>
                            Een ogenblik geduld...
                        </p>
                    </div>
                    <div class="block"
                        v-else-if="!params.download && !store.table.length && ['sent', 'received'].includes(store.status)">
                        <p>
                            Upload een <b>TSV</b>-bestand uit RosettaBridge (optie <b>Dates - ISO</b>) met de knop of
                            door hem
                            hierheen te slepen. Let op dat je het bestand voor de juiste datum uploadt.
                        </p>
                    </div>
                    <div class="block"
                        v-else-if="params.download && !store.table.length && ['sent', 'received'].includes(store.status)">
                        <p>
                            Er is nog geen bestand geüpload! Ga naar de RosettaBridge-PC en open deze pagina.
                        </p>
                    </div>
                    <div class="block"
                        v-else-if="!params.download && store.table.length && ['sent', 'received'].includes(store.status)">
                        <p>
                            De bovenstaande gegevens zijn {{ store.status === 'sent' ? 'geüpload naar' : 'al aanwezig op' }} de
                            server.
                            <br><br>
                            Als dit het juiste bestand is, ga dan naar de timetable-PC en doe het volgende:
                        </p>
                        <ol>
                            <li>Zorg ervoor dat de software voor de Pathé Timetable open staat.</li>
                            <li>Dubbelklik op het bestandje 'Voorstellingen ophalen van Pathé Tools.bat'.</li>
                        </ol>
                    </div>
                    <div class="block"
                        v-else-if="params.download && store.table.length && ['sent', 'received'].includes(store.status)">
                        <p>
                            De bovenstaande gegevens zijn aanwezig op de server. Er wordt zometeen een bestand
                            gedownload. Zorg ervoor dat dit bestand wordt gedownload als 'timetable.xml' in de
                            standaarddownloadmap, als dat niet automatisch gebeurt.
                        </p>
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
code {
    white-space: pre;
}
</style>
