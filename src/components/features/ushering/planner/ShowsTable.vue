<script setup lang="ts">
import { Show } from '@/scripts/types';
import { format } from 'date-fns';

type ShowWithSeats = Show & { seatsSold: number; seatsTotal: number; occupancy: number };

const props = defineProps<{
    shows: ShowWithSeats[];
    now: Date;
}>();

function showStarted(show: ShowWithSeats, now: Date): boolean {
    return show.scheduledTime.getTime() + 900_000 <= now.getTime();
}
</script>

<template>
    <table class="shows-table">
        <thead>
            <tr>
                <th>Zaal</th>
                <th>Inloop</th>
                <th style="opacity: 0.75; font-style: italic;">Voorlopig</th>
                <th>Aftiteling</th>
                <th style="opacity: 0.75; font-style: italic;">Definitief</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="show in shows" :key="show.playlist + show.scheduledTime">
                <td>{{ show.auditorium.replace(/^\D+(?=\d)/, '') }}</td>
                <td>{{ show.scheduledTime ? format(show.scheduledTime, 'HH:mm') : '' }}</td>
                <td class="admits">{{ showStarted(show, now) ? '' : show.seatsSold }}</td>
                <td>{{ show.creditsTime ? format(show.creditsTime, 'HH:mm:ss') : '' }}</td>
                <td class="admits">{{ showStarted(show, now) ? show.seatsSold : '' }}</td>
            </tr>
        </tbody>
    </table>
</template>

<style>
.shows-table {
    font-size: 12px;
    border-collapse: collapse;
    width: 100%;

    thead tr {
        border-bottom: 1px solid #ffffff1a;
    }

    th,
    td {
        padding: 1px 8px;
        text-align: left;
        opacity: 0.75;

        &.admits {
            text-align: right;
            opacity: 1;
            translate: -50%;
        }
    }

    th {
        opacity: 1;
        font-weight: 500;
    }
}
</style>