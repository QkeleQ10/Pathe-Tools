<script setup lang="ts">
import { ref, computed, inject, useTemplateRef, Ref } from 'vue'
import { useStorage, useDropZone } from '@vueuse/core'
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

import { Show, UsherShow } from '@/scripts/types.ts'
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { usePosScheduleStore } from '@/stores/posSchedule';

import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue';
import PosScheduleUploadSection from '@/components/features/sections/PosScheduleUploadSection.vue';
import Waterfall from '@/components/features/ushering/planner/Waterfall.vue';
import ShowsTable from '@/components/features/ushering/planner/ShowsTable.vue';

type ShowWithSeats = Show & { seatsSold: number; seatsTotal: number; occupancy: number };

const tmsScheduleStore = useTmsScheduleStore();
const posScheduleStore = usePosScheduleStore();

const now = inject<Ref<Date>>('now');

const isHovering = ref<boolean>(false);
const hoverPos = ref<number>(0);

const colourHueTitle = useStorage('planner-colour-hue-title', false);
const colourSaturationOccupancy = useStorage('planner-colour-saturation-occupancy', false);

const showsWithSeats = computed((): ShowWithSeats[] => {
    return tmsScheduleStore.table.map((show: UsherShow) => {
        const posShow = posScheduleStore.shows.find((s: any) =>
            s.feature._attributes?.title.replace(/[\W_]+/g, '') === show.playlist.replace(/[\W_]+/g, '')
            && s._attributes?.time === format(show.scheduledTime, 'yyyyMMdd HHmm')
        );

        const seatsSold = posShow ? Number(posShow._attributes.seatsSold) : 0;
        const seatsTotal = posShow ? Number(posShow._attributes.seatsTotal) : 0;
        const occupancy = seatsTotal > 0 ? seatsSold / seatsTotal : 0;

        return {
            ...show,
            seatsSold,
            seatsTotal,
            occupancy
        };
    });
});

const auditoriums = computed(() => {
    return [...new Set(showsWithSeats.value.map((show: ShowWithSeats) => show.auditorium).filter(Boolean))].sort((a, b) => ("" + a).localeCompare(b, undefined, { numeric: true }));
});

const showTitles = computed(() => {
    return [...new Set(showsWithSeats.value.map((show: ShowWithSeats) => show.title).filter(Boolean))].sort((a, b) => ("" + a).localeCompare(b, undefined, { numeric: true }));
});

const rangeStart = computed(() => {
    if (showsWithSeats.value.length === 0) return new Date();
    const rangeStart = new Date(Math.min(...showsWithSeats.value.map((show: ShowWithSeats) => show.scheduledTime.getTime())));
    rangeStart.setMinutes(rangeStart.getMinutes() - 20);
    return rangeStart;
});

const rangeEnd = computed(() => {
    if (showsWithSeats.value.length === 0) return new Date();
    const rangeEnd = new Date(Math.max(...showsWithSeats.value.map((show: ShowWithSeats) => show.endTime.getTime())));
    rangeEnd.setMinutes(rangeEnd.getMinutes() + 20);
    return rangeEnd;
});

function normalise(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
}

function normaliseDate(date: Date, minDate: Date = rangeStart.value, maxDate: Date = rangeEnd.value): number {
    return normalise(date.getTime(), minDate.getTime(), maxDate.getTime());
}

const { isOverDropZone } = useDropZone(useTemplateRef('main'), {
    onDrop: (f) => {
        if (f[0].name.endsWith('.xml'))
            posScheduleStore.uploadXml(f);
        else
            tmsScheduleStore.filesUploaded(f);
    },
    multiple: false
})

const titleHueMap = computed(() => {
    const map = new Map<string, number>();
    showTitles.value.forEach((title, index) => {
        map.set(title, (360 / showTitles.value.length) * index);
    });
    return map;
});

function getTitleHue(title: string): number {
    return titleHueMap.value.get(title) ?? 230;
}

function getOccupancyChroma(occupancy: number): number {
    return occupancy * 132;
}

const showsByExitTime = computed(() =>
    [...showsWithSeats.value].sort((a, b) => a.creditsTime.getTime() - b.creditsTime.getTime())
);

const showsByEntryTime = computed(() =>
    [...showsWithSeats.value].sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
);

const showsWithIntermission = computed(() =>
    showsWithSeats.value.filter(show => show.intermissionTime)
);

const showsWith4dx = computed(() =>
    showsWithSeats.value.filter(show => show.tags.includes('4DX'))
);
</script>

<template>
    <div ref="main" class="content">
        <div class="layout">

            <main>
                <h1>Planner (bèta)
                    <span v-if="isHovering && now" style="float:right;">
                        {{ format(new Date(rangeStart.getTime() + hoverPos * (rangeEnd.getTime() -
                            rangeStart.getTime())), 'HH:mm', { locale: nl }) }}
                    </span>
                </h1>
                <p id="upload-hint" v-if="!showsWithSeats.length">Upload eerst een bestand.</p>

                <div class="planner-section">
                    <h3>Werkdruk</h3>
                    <Waterfall class="black" :now="normaliseDate(now)" v-model:is-hovering="isHovering"
                        v-model:hover-pos="hoverPos" title="Ushering">
                        <template v-for="show in showsWithSeats" :key="show.playlist + show.scheduledTime">
                            <div class="exit-workload" :style="{
                                left: (normaliseDate(show.creditsTime) * 100) + '%',
                                width: (normaliseDate(new Date(show.endTime.getTime() + 1200000)) - normaliseDate(show.creditsTime)) * 100 + '%',
                                '--hue': colourHueTitle ? getTitleHue(show.title) : 80,
                                '--chroma': colourSaturationOccupancy ? getOccupancyChroma(show.occupancy) : 50,
                                '--admits': show.occupancy,
                            }">
                            </div>
                        </template>
                        <template v-for="show in showsWithIntermission" :key="show.playlist + show.scheduledTime">
                            <div class="intermission-workload" :style="{
                                left: (normaliseDate(show.intermissionTime) * 100) + '%',
                                width: (normaliseDate(new Date(show.intermissionTime.getTime() + 300000)) - normaliseDate(show.intermissionTime)) * 100 + '%',
                                '--hue': colourHueTitle ? getTitleHue(show.title) : 80,
                                '--chroma': colourSaturationOccupancy ? getOccupancyChroma(show.occupancy) : 50,
                                '--admits': show.occupancy,
                            }">
                            </div>
                        </template>
                        <template v-for="show in showsWith4dx" :key="show.playlist + show.scheduledTime">
                            <div class="plf-workload" :style="{
                                left: (normaliseDate(new Date(show.scheduledTime.getTime() - 900000)) * 100) + '%',
                                width: (normaliseDate(show.mainShowTime || new Date(show.scheduledTime.getTime() + 900000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 900000))) * 100 + '%',
                                '--hue': colourHueTitle ? getTitleHue(show.title) : 80,
                                '--chroma': colourSaturationOccupancy ? getOccupancyChroma(show.occupancy) : 50,
                                '--admits': show.occupancy,
                            }">
                            </div>
                        </template>
                    </Waterfall>

                    <Waterfall class="black" :now="normaliseDate(now)" v-model:is-hovering="isHovering"
                        v-model:hover-pos="hoverPos" title="Portier en F&B">
                        <template v-for="show in showsWithSeats" :key="show.playlist + show.scheduledTime">
                            <div class="enter-workload" :style="{
                                left: (normaliseDate(new Date(show.scheduledTime.getTime() - 1200000)) * 100) + '%',
                                width: (normaliseDate(new Date(show.scheduledTime.getTime() + 1200000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 1200000))) * 100 + '%',
                                '--hue': colourHueTitle ? getTitleHue(show.title) : 80,
                                '--chroma': colourSaturationOccupancy ? getOccupancyChroma(show.occupancy) : 50,
                                '--admits': show.occupancy,
                            }">
                            </div>
                        </template>
                    </Waterfall>

                    <Waterfall class="black" :now="normaliseDate(now)" v-model:is-hovering="isHovering"
                        v-model:hover-pos="hoverPos" title="Totaal">
                        <template v-for="show in showsWithSeats" :key="show.playlist + show.scheduledTime">
                            <div class="exit-workload" :style="{
                                left: (normaliseDate(show.creditsTime) * 100) + '%',
                                width: (normaliseDate(new Date(show.endTime.getTime() + 1200000)) - normaliseDate(show.creditsTime)) * 100 + '%',
                                '--hue': colourHueTitle ? getTitleHue(show.title) : 80,
                                '--chroma': colourSaturationOccupancy ? getOccupancyChroma(show.occupancy) : 50,
                                '--admits': show.occupancy,
                            }">
                            </div>
                        </template>
                        <template v-for="show in showsWithSeats" :key="show.playlist + show.scheduledTime">
                            <div class="enter-workload" :style="{
                                left: (normaliseDate(new Date(show.scheduledTime.getTime() - 1200000)) * 100) + '%',
                                width: (normaliseDate(new Date(show.scheduledTime.getTime() + 1200000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 1200000))) * 100 + '%',
                                '--hue': colourHueTitle ? getTitleHue(show.title) : 80,
                                '--chroma': colourSaturationOccupancy ? getOccupancyChroma(show.occupancy) : 50,
                                '--admits': show.occupancy,
                            }">
                            </div>
                        </template>
                        <template v-for="show in showsWithIntermission" :key="show.playlist + show.scheduledTime">
                            <div class="intermission-workload" :style="{
                                left: (normaliseDate(show.intermissionTime) * 100) + '%',
                                width: (normaliseDate(new Date(show.intermissionTime.getTime() + 300000)) - normaliseDate(show.intermissionTime)) * 100 + '%',
                                '--hue': colourHueTitle ? getTitleHue(show.title) : 80,
                                '--chroma': colourSaturationOccupancy ? getOccupancyChroma(show.occupancy) : 50,
                                '--admits': show.occupancy,
                            }">
                            </div>
                        </template>
                        <template v-for="show in showsWith4dx" :key="show.playlist + show.scheduledTime">
                            <div class="plf-workload" :style="{
                                left: (normaliseDate(new Date(show.scheduledTime.getTime() - 900000)) * 100) + '%',
                                width: (normaliseDate(show.mainShowTime || new Date(show.scheduledTime.getTime() + 900000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 900000))) * 100 + '%',
                                '--hue': colourHueTitle ? getTitleHue(show.title) : 80,
                                '--chroma': colourSaturationOccupancy ? getOccupancyChroma(show.occupancy) : 50,
                                '--admits': show.occupancy,
                            }">
                            </div>
                        </template>
                    </Waterfall>
                </div>

                <div class="planner-section">
                    <h3>Zalen</h3>
                    <template v-for="auditorium in auditoriums" :key="auditorium">
                        <Waterfall :now="normaliseDate(now)" v-model:is-hovering="isHovering"
                            v-model:hover-pos="hoverPos" :title="auditorium">
                            <template v-for="show in showsWithSeats.filter(s => s.auditorium === auditorium)"
                                :key="show.playlist + show.scheduledTime">
                                <div class="show" :style="{
                                    left: (normaliseDate(show.scheduledTime) * 100) + '%',
                                    width: (normaliseDate(show.endTime) - normaliseDate(show.scheduledTime)) * 100 + '%',
                                    '--hue': colourHueTitle ? getTitleHue(show.title) : 80,
                                    '--chroma': colourSaturationOccupancy ? getOccupancyChroma(show.occupancy) : 50,
                                }">
                                    <span>{{ show.playlist }}</span>
                                    <br>
                                    <span class="time">
                                        {{ format(show.scheduledTime, 'HH:mm', { locale: nl }) }} - {{
                                            format(show.endTime, 'HH:mm', { locale: nl }) }}
                                    </span>
                                    <span class="admits">
                                        {{ show.seatsSold }}/{{ show.seatsTotal }}
                                    </span>
                                </div>
                            </template>
                        </Waterfall>
                    </template>
                </div>
            </main>

            <SidePanel>
                <div class="flex" style="flex-direction: column;">
                    <TimetableUploadSection />

                    <PosScheduleUploadSection v-show="tmsScheduleStore.table.length" />

                    <Tabs>

                        <Tab value="Uitlopen">
                            <ShowsTable :shows="showsByExitTime" :now="now" />
                        </Tab>

                        <Tab value="Inlopen">
                            <ShowsTable :shows="showsByEntryTime" :now="now" />
                        </Tab>

                        <Tab value="Opties">
                            <fieldset>
                                <legend>Weergave</legend>
                                <InputSwitch v-model="colourHueTitle" identifier="colourHueTitle">
                                    <span>Kleurtint afhankelijk van titel</span>
                                </InputSwitch>
                                <InputSwitch v-model="colourSaturationOccupancy" identifier="colourSaturationOccupancy">
                                    <span>Kleurchroma afhankelijk van bezetting</span>
                                </InputSwitch>
                            </fieldset>
                        </Tab>

                    </Tabs>
                </div>
            </SidePanel>

        </div>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </div>
</template>

<style scoped>
.planner-section {
    h3 {
        margin-bottom: 8px;
    }
}

.waterfall {
    .show {
        position: absolute;
        background-color: hsl(var(--hue) 50% 30%);
        background-color: lch(50 var(--chroma) var(--hue));
        color: white;
        padding: 2px 5px;
        border-radius: 3px;
        font-size: 12px;
        overflow: hidden;
        white-space: nowrap;
        box-sizing: border-box;
        height: calc(100% - 8px);

        &>span.time {
            opacity: 0.75;

            &>span {
                min-width: 20px;
                text-align: end;
            }
        }

        &>span.admits {
            position: absolute;
            bottom: 2px;
            right: 5px;
            text-align: right;
            opacity: 0.75;

            input[type=number]::-webkit-inner-spin-button,
            input[type=number]::-webkit-outer-spin-button {
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                margin: 0;
            }
        }
    }

    .enter-workload {
        position: absolute;
        background-color: hsl(var(--hue) 50% 30%);
        background-color: lch(50 var(--chroma) var(--hue));
        mask-image: linear-gradient(to right,
                transparent 0%,
                black 40%,
                black 60%,
                transparent 100%);
        mix-blend-mode: screen;
        box-sizing: border-box;
        height: calc(100% - 8px);

        /* transform: scaleX(calc(0.0075 * var(--admits) + 0.167)); */

        opacity: min(calc(var(--admits) + 0.15), 1);
    }

    .plf-workload {
        position: absolute;
        background-color: hsl(var(--hue) 50% 30%);
        background-color: lch(50 var(--chroma) var(--hue));
        /* mask-image: linear-gradient(to right,
                transparent 0%,
                black 40%,
                black 60%,
                transparent 100%); */
        mix-blend-mode: screen;
        box-sizing: border-box;
        height: calc(100% - 8px);

        transform: scaleY(0.5)
            /* scaleX(calc(0.0075 * var(--admits) + 0.167)) */
        ;
        transform-origin: bottom;

        opacity: min(calc(var(--admits) + 0.15), 1);
    }

    .exit-workload {
        position: absolute;
        background-color: hsl(var(--hue) 50% 30%);
        background-color: lch(50 var(--chroma) var(--hue));
        mask-image: linear-gradient(to right,
                black 0%,
                black 50%,
                transparent 100%);
        mix-blend-mode: screen;
        box-sizing: border-box;
        height: calc(100% - 8px);

        /* transform: scaleX(calc(0.0075 * var(--admits) + 0.167)); */
        transform-origin: left;

        opacity: min(calc(var(--admits) + 0.15), 1);
    }

    .intermission-workload {
        position: absolute;
        background-color: hsl(var(--hue) 50% 30%);
        background-color: lch(50 var(--chroma) var(--hue));
        mask-image: linear-gradient(to right,
                black 0%,
                black 50%,
                transparent 100%);
        mix-blend-mode: screen;
        box-sizing: border-box;
        height: calc(100% - 8px);

        transform: scaleY(0.5)
            /* scaleX(calc(0.0075 * var(--admits) + 0.167)) */
        ;
        transform-origin: top;

        opacity: min(calc(var(--admits) + 0.15), 1);
    }
}
</style>
