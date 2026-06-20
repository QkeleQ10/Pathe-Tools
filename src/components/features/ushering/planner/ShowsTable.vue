<script setup lang="ts">
import { Show } from '@/scripts/types';
import { format } from 'date-fns';

type ShowWithSeats = Show & { seatsSold: number; seatsTotal: number; occupancy: number };

const props = defineProps<{
    shows: ShowWithSeats[];
    now: Date;
    timestamp?: Date;
}>();

function showStarted(show: ShowWithSeats, now: Date): boolean {
    return (show.scheduledTime.getTime() + 900_000) <= (props.timestamp?.getTime() || now.getTime());
}
</script>

<template>
    <table class="shows-table">
        <thead>
            <tr>
                <th>Zaal</th>
                <th>Inloop</th>
                <th style="color: #fff8;">V</th>
                <th>Aftiteling</th>
                <th style="color: #fff8;">D</th>
                <th>Titel</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="show in shows" :key="show.playlist + show.scheduledTime" :class="{
                italic: show.auditorium?.includes('4DX'), bold: show.featureRating === '16' || show.featureRating === '18',
            }">
                <td>{{ show.auditorium.replace(/^\D+(?=\d)/, '') }}</td>
                <td>{{ show.scheduledTime ? format(show.scheduledTime, 'HH:mm') : '' }}</td>
                <td class="admits" :style="{ fontStyle: 'normal' }">{{ showStarted(show, now) ? '' : show.seatsSold }}
                </td>
                <td :style="{ opacity: show.creditsTime.getTime() === show.endTime.getTime() ? '.2' : '.75' }">{{
                    show.creditsTime ? format(show.creditsTime, 'HH:mm:ss') : '' }}</td>
                <td class="admits" :style="{ fontStyle: 'normal' }">{{ showStarted(show, now) ? show.seatsSold : '' }}
                </td>
                <td class="title">{{ show.title }}</td>
            </tr>
        </tbody>
    </table>
</template>

<style>
.shows-table {
    font-size: 12px;
    border-collapse: collapse;
    width: 100%;
    border: 1px solid #383838;

    thead tr {
        background-color: #383838;
    }

    tbody tr:nth-child(even) {
        background-color: #232323;
    }

    th,
    td {
        padding: 1px 8px;
        text-align: left;
        opacity: 0.75;

        &.admits {
            /* text-align: right; */
            opacity: 1;
            /* translate: -50%; */
        }

        &.title {
            white-space: nowrap;
            overflow: hidden;
            max-width: 65px;
            mask-image: linear-gradient(to right, black 70%, transparent);
        }
    }

    th {
        opacity: 1;
        font-weight: 500;
    }
}
</style>