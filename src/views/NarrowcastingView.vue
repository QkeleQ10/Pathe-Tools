<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDropZone } from '@vueuse/core';
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { Show } from '@/classes/classes';
import { format } from 'date-fns';

const store = useTmsScheduleStore();

declare global {
    interface Window {
        datadump: any;
        narrowcastXml: string;
    }
};

store.$subscribe(() => {
    const oldTable = window.datadump;
    const oldNarrowcastXml = window.narrowcastXml;

    window.datadump = store.table;
    window.narrowcastXml = narrowcastXml.value;

    if (!store.table?.length || narrowcastXml.value.length < 10 || oldNarrowcastXml === window.narrowcastXml) return;

    const blob = new Blob([narrowcastXml.value], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.txt';
    link.click();
    URL.revokeObjectURL(link.href);
});

const narrowcastXml = computed(() => {
    return `<voorstellingen>${store.table.map(showToXml).join('')}</voorstellingen>`;

    function showToXml(show: Show, index: number) {
        return `<Shows><ID type="Long Integer">${index}</ID><Titel type="Text">${show.playlist}</Titel><Zaal type="Text">${show.auditoriumNumber}</Zaal><Kleur type="Long Integer">4</Kleur><Permanent type="Long Integer">1</Permanent><DatumVan type="Date/Time">${format(show.scheduledTime, 'dd-MM-yyyy')}</DatumVan><DatumTot type="Date/Time">${format(show.scheduledTime.getTime() + 86400, 'dd-MM-yyyy')}</DatumTot><Tijd type="Date/Time">${format(show.scheduledTime, 'hh:mm:ss')}</Tijd></Shows>`;
    }
});

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
                    <h2>Datadump</h2>
                    <p>Aangeboden als array in publieke variabele <code>datadump</code> en als pseudo-xml-string in
                        publieke variabele <code>narrowcastXml</code>.
                    </p>
                    <div class="block">
                        <code>{{ JSON.stringify(store.table) }}</code>
                    </div>
                    <br>
                    <div class="block">
                        <code>{{ narrowcastXml }}</code>
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
#upcoming-announcements {
    position: relative;
}

.film {
    display: grid;
    grid-template-columns: 64px 1fr;
    grid-template-rows: auto auto auto;
    position: relative;
    width: 100%;
    min-height: 72px;
    margin-bottom: 8px;

    border-radius: 5px;
    background-color: #ffffff14;
    color: #fff;
    font-size: 14px;
    overflow: hidden;

    &.announcing {
        background-color: #ffffff96;
        color: #000;
    }

    .room {
        grid-column: 1;
        grid-row: 1 / -1;
        padding-left: 8px;
        padding-right: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        overflow: hidden;
        font: 18px/34px "Trade Gothic Bold Condensed 20", Arial, Helvetica, sans-serif;
    }

    .title {
        font-weight: 600;
        margin-top: 6px;
    }

    .time {
        opacity: 0.5;
        margin-bottom: 6px;
    }

    .chips {
        position: absolute;
        top: 8px;
        right: 8px;
        gap: 4px;
    }

    .announcement {
        grid-column: 1 / -1;
        grid-row: -1;
        padding-top: 6px;
        padding-bottom: 6px;
        background-color: #ffffff14;

        .word.announcing {
            background-color: #ffc426;
            color: #000;
        }

        .icon {
            justify-self: center;
            opacity: 0.5;
        }
    }
}

.queue>div {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    padding: 8px;
    border-radius: 5px;
    background-color: #ffffff14;
    margin-top: 6px;

    &.announcing {
        background-color: #ffffff96;
        color: #000;
    }
}

.parameters-warning {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    padding: 16px;
    padding-top: 22px;
    border-radius: 5px;
    background-color: #22222288;
    backdrop-filter: blur(5px);
    z-index: 10;
}

.manual-sounds-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    &>button {
        display: flex;
        align-items: center;
        height: 22px;
        padding-inline: 6px;
        font: 13px Arial, Helvetica, sans-serif;
        text-transform: none;
        background-color: #ffffff14;
        border: none;
        border-radius: 4px;
        color: #fff;
        cursor: pointer;
    }

    &+& {
        margin-top: -10px;
    }
}

.pulsate {
    animation: pulsate 1000ms infinite;
}

@keyframes pulsate {
    from {
        opacity: 1;
    }

    50% {
        opacity: 0.15;
    }

    to {
        opacity: 1;
    }
}
</style>
