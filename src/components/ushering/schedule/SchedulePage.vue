<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useStorage } from '@vueuse/core';
import { format } from 'date-fns';
import { useVueToPrint } from 'vue-to-print';
import { TimetableShow } from '@/classes/classes';
import { nl } from 'date-fns/locale';

const props = defineProps<{
    shows: TimetableShow[];
    metadata: {} | {
        name: string;
        type: string;
        size: number;
        lastModified: number;
        uploadedDate: number;
        flags?: string[];
    };
    pageNum: number;
    numPages: number;
}>();

const displayScheduledTime = useStorage('display-scheduled-time', true);
const displayMainShowTime = useStorage('display-main-show-time', false);
const displayIntermissionTime = useStorage('display-intermission-time', true);
const displayCreditsTime = useStorage('display-credits-time', true);
const displayEndTime = useStorage('display-end-time', false);
const displayNextStartTime = useStorage('display-next-start-time', false);

const printComponent = useTemplateRef('printComponent');

const { handlePrint } = useVueToPrint({
    content: printComponent,
    documentTitle:
        "Tijdenlijstje "
        + format(props.shows?.[0]?.scheduledTime || new Date(), 'yyyy-MM-dd', { locale: nl })
        + (props.numPages > 1 ? ` (deel ${props.pageNum + 1} van ${props.numPages})` : ''),
})

defineExpose({
    handlePrint,
});
</script>

<template>
    <div class="page" v-if="shows.length > 0">
        <div class="print-component-wrapper">
            <div class="print-component" ref="printComponent">
                <div class="header" v-if="'flags' in metadata">
                    {{
                        (metadata.flags.includes('times-only')
                            ? 'Datum onbekend'
                            : format(shows[0]?.scheduledTime || 0, 'PPPP', { locale: nl }))
                        + (props.numPages > 1
                            ? ` (deel ${props.pageNum + 1} van ${props.numPages})`
                            : '')
                    }}
                </div>
                <table class="timetable" spellcheck="false">
                    <colgroup>
                        <col span="1" style="width: 6%;" />
                        <col span="1" style="width: 9%;" />
                        <col span="1" style="width: 6%;" />
                        <col span="1" style="width: 6%;" />
                        <col span="1" style="width: 13%;" />
                        <col span="1" style="width: 6%;" />
                        <col span="1" style="width: 4%;" />
                        <col span="1" style="width: 49%;" />
                        <col span="1" style="width: 2%;" />
                    </colgroup>
                    <thead>
                        <tr>
                            <td nowrap class="td-auditorium">Zaal</td>
                            <td nowrap class="td-scheduled">
                                {{ displayScheduledTime ? "Inloop" : '' }}
                            </td>
                            <td nowrap class="td-main">
                                {{displayMainShowTime && shows.some(show => show.mainShowTime)
                                    ? "Start" : ''}}
                            </td>
                            <td nowrap class="td-intermission">
                                {{displayIntermissionTime && shows.some(show =>
                                    show.intermissionTime)
                                    ? "Pauze" : ''}}
                            </td>
                            <td nowrap class="td-credits">
                                {{ displayCreditsTime ? "Aftiteling" : '' }}
                            </td>
                            <td nowrap class="td-end">
                                {{ displayEndTime ? "Eind" : '' }}
                            </td>
                            <td nowrap class="td-next">
                                {{ displayNextStartTime ? "Volg." : '' }}
                            </td>
                            <td nowrap class="td-title">Film</td>
                            <td nowrap class="td-age"></td>
                        </tr>
                    </thead>
                    <ScheduleTableRow v-for="(show, i) in shows" :key="i" :show="show" />
                </table>
                <span contenteditable class="custom-content"></span>
                <div class="footer">
                    <span v-if="'lastModified' in metadata">
                        Gegevens: {{ new Date(metadata.lastModified).toLocaleString('nl-NL', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour:
                                '2-digit',
                            minute: '2-digit'
                        }) }} •
                    </span>
                    Gegenereerd: {{ new Date().toLocaleDateString('nl-NL', {
                        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit',
                        minute:
                            '2-digit'
                    }) }}
                    • Pathé Tools • Quinten Althues
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page {
    background-color: #ffffff14;
    border-radius: 6px;
    overflow: hidden;
    width: 210mm;
    height: 297mm;
}

.print-component-wrapper {
    position: relative;
    overflow: hidden;

    margin: 1.35cm;
    margin-top: 0.8cm;
    margin-bottom: 0.8cm;

    height: calc(100% - 1.6cm);
    width: calc(100% - 2.7cm);
}

.print-component {
    margin-top: 16px;
    overflow: hidden;

    display: block;

    --border-color: #ffffff3d;
    --row-color: transparent;
    --banded-row-color: #ffffff14;
    --header-color: #ffffff96;
    --color: #fff;
    --inverse-color: #000;
}

section.gray {
    .page {
        background-color: #ffffff;
        color: #000000;
        box-shadow: 1px 2px 10px #00000030;
        border-radius: 0;
    }

    .print-component {
        --border-color: #525252;
        --row-color: #fff;
        --banded-row-color: #e4e4e4;
        --header-color: #525252;
        --color: #000;
        --inverse-color: #fff;
    }
}

.custom-content {
    display: inline-block;
    width: 100%;
    padding: 10px;
    color: var(--color);
    text-align: center;

    &:empty:after {
        content: "Eigen tekst toevoegen";
        opacity: .3;
    }
}

div.header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    color: var(--color);
    opacity: 0.5;
    font-size: 10px;
    text-align: center;

    &::first-letter {
        text-transform: uppercase;
    }
}

div.footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    color: var(--color);
    opacity: 0.1;
    font-size: 10px;
    text-align: center;
}

@media print {
    @page {
        size: A4 portrait;
        margin: 1.35cm;
        margin-top: 0.8cm;
        margin-bottom: 0.8cm;
    }

    .page,
    section.gray .page {
        background-color: transparent;
        border-radius: 0;
        box-shadow: none;
        page-break-before: always;
    }

    .print-component-wrapper {
        margin: 0;
        height: 297mm;
        width: 210mm;
    }

    .print-component {
        display: block;
        position: unset;
        width: auto;
        height: auto;
        box-sizing: border-box;
        padding: 0;
        margin-top: 16px;
        background-color: transparent;
        max-width: none;
        overflow: visible;
        aspect-ratio: unset;
        border-radius: 0;

        --border-color: #525252;
        --row-color: #fff;
        --banded-row-color: #e4e4e4;
        --header-color: #525252;
        --color: #000;
        --inverse-color: #fff;
    }

    .custom-content:empty {
        display: none;
    }
}

[contenteditable]:hover {
    outline: 1px solid #ffffff88;
    outline-offset: -1px;
    background-color: #ffc52631;
}

[contenteditable]:focus-visible {
    outline: 1px solid #ffc426;
    outline-offset: -1px;
    background-color: #ffc52631;
}

table.timetable {
    width: 100%;
    border: 1px solid var(--border-color);
    border-collapse: collapse;
    color: var(--color);
    font-family: Arial, Helvetica, sans-serif;
    --row-height: 21.5px;
    font-size: 12.5px;

    thead>tr {
        background-color: var(--header-color);
        color: var(--inverse-color);
        font-weight: bold;
    }

    tr,
    thead {
        font: inherit;
        height: var(--row-height);
    }

    td {
        position: relative;
        padding: 2px 6px;
    }

    .td-credits {
        padding-left: 32px;
    }
}
</style>