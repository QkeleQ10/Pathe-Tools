<script setup lang="ts">
import { ref, computed, inject, useTemplateRef, Ref } from 'vue'
import { useStorage, useDropZone } from '@vueuse/core'
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { Show, TimetableShow } from '@/scripts/types.ts'
import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import Waterfall from '@/components/features/ushering/planner/Waterfall.vue';

const store = useTmsScheduleStore();

const now = inject<Ref<Date>>('now');

const isHovering = ref<boolean>(false);
const hoverPos = ref<number>(0);

const colourful = useStorage('ushering-planner-view-colourful', false);

const auditoriums = computed(() => {
    return [...new Set(store.table.map((show: TimetableShow) => show.auditorium).filter(Boolean))].sort((a, b) => ("" + a).localeCompare(b, undefined, { numeric: true }));
});

const showTitles = computed(() => {
    return [...new Set(store.table.map((show: TimetableShow) => show.title).filter(Boolean))].sort((a, b) => ("" + a).localeCompare(b, undefined, { numeric: true }));
});

const rangeStart = computed(() => {
    if (store.table.length === 0) return new Date();
    const rangeStart = new Date(Math.min(...store.table.map((show: TimetableShow) => show.scheduledTime.getTime())));
    rangeStart.setMinutes(rangeStart.getMinutes() - 20);
    return rangeStart;
});

const rangeEnd = computed(() => {
    if (store.table.length === 0) return new Date();
    const rangeEnd = new Date(Math.max(...store.table.map((show: TimetableShow) => show.endTime.getTime())));
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
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
})
</script>

<template>
    <main ref="main">
        <TimetableUploadSection />

        <section id="planner">
            <div class="section-content flex" style="flex-wrap: wrap-reverse;">
                <div style="flex: 1200px 1 1;">
                    <h2>Planner (bèta)
                        <span v-if="isHovering && now" style="float:right;">
                            {{ format(new Date(rangeStart.getTime() + hoverPos * (rangeEnd.getTime() -
                                rangeStart.getTime())), 'HH:mm', { locale: nl }) }}
                        </span>
                    </h2>
                    <p id="upload-hint" v-if="!store.table.length">Upload eerst een bestand.</p>


                    <div class="planner-section">
                        <h3>Werkdruk</h3>
                        <Waterfall class="black" :now="normaliseDate(now)" v-model:is-hovering="isHovering"
                            v-model:hover-pos="hoverPos" title="Ushering">
                            <template v-for="show in store.table" :key="show.playlist + show.scheduledTime">
                                <div class="exit-workload" :style="{
                                    left: (normaliseDate(show.creditsTime) * 100) + '%',
                                    width: (normaliseDate(new Date(show.endTime.getTime() + 1200000)) - normaliseDate(show.creditsTime)) * 100 + '%',
                                    '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                }">
                                </div>
                            </template>
                            <template v-for="show in store.table.filter(show => show.intermissionTime)"
                                :key="show.playlist + show.scheduledTime">
                                <div class="intermission-workload" :style="{
                                    left: (normaliseDate(show.intermissionTime) * 100) + '%',
                                    width: (normaliseDate(new Date(show.intermissionTime.getTime() + 300000)) - normaliseDate(show.intermissionTime)) * 100 + '%',
                                    '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                }">
                                </div>
                            </template>
                            <template v-for="show in store.table.filter(show => show.extras.includes('4DX'))"
                                :key="show.playlist + show.scheduledTime">
                                <div class="plf-workload" :style="{
                                    left: (normaliseDate(new Date(show.scheduledTime.getTime() - 900000)) * 100) + '%',
                                    width: (normaliseDate(show.mainShowTime || new Date(show.scheduledTime.getTime() + 900000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 900000))) * 100 + '%',
                                    '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                }">
                                </div>
                            </template>
                        </Waterfall>

                        <Waterfall class="black" :now="normaliseDate(now)" v-model:is-hovering="isHovering"
                            v-model:hover-pos="hoverPos" title="Portier en F&B">
                            <template v-for="show in store.table" :key="show.playlist + show.scheduledTime">
                                <div class="enter-workload" :style="{
                                    left: (normaliseDate(new Date(show.scheduledTime.getTime() - 1200000)) * 100) + '%',
                                    width: (normaliseDate(new Date(show.scheduledTime.getTime() + 1200000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 1200000))) * 100 + '%',
                                    '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                }">
                                </div>
                            </template>
                        </Waterfall>

                        <Waterfall class="black" :now="normaliseDate(now)" v-model:is-hovering="isHovering"
                            v-model:hover-pos="hoverPos" title="Totaal">
                            <template v-for="show in store.table" :key="show.playlist + show.scheduledTime">
                                <div class="exit-workload" :style="{
                                    left: (normaliseDate(show.creditsTime) * 100) + '%',
                                    width: (normaliseDate(new Date(show.endTime.getTime() + 1200000)) - normaliseDate(show.creditsTime)) * 100 + '%',
                                    '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                }">
                                </div>
                            </template>
                            <template v-for="show in store.table" :key="show.playlist + show.scheduledTime">
                                <div class="enter-workload" :style="{
                                    left: (normaliseDate(new Date(show.scheduledTime.getTime() - 1200000)) * 100) + '%',
                                    width: (normaliseDate(new Date(show.scheduledTime.getTime() + 1200000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 1200000))) * 100 + '%',
                                    '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                }">
                                </div>
                            </template>
                            <template v-for="show in store.table.filter(show => show.intermissionTime)"
                                :key="show.playlist + show.scheduledTime">
                                <div class="intermission-workload" :style="{
                                    left: (normaliseDate(show.intermissionTime) * 100) + '%',
                                    width: (normaliseDate(new Date(show.intermissionTime.getTime() + 300000)) - normaliseDate(show.intermissionTime)) * 100 + '%',
                                    '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                }">
                                </div>
                            </template>
                            <template v-for="show in store.table.filter(show => show.extras.includes('4DX'))"
                                :key="show.playlist + show.scheduledTime">
                                <div class="plf-workload" :style="{
                                    left: (normaliseDate(new Date(show.scheduledTime.getTime() - 900000)) * 100) + '%',
                                    width: (normaliseDate(show.mainShowTime || new Date(show.scheduledTime.getTime() + 900000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 900000))) * 100 + '%',
                                    '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length)
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
                                <template v-for="show in store.table.filter(s => s.auditorium === auditorium)"
                                    :key="show.playlist + show.scheduledTime">
                                    <div class="show" :style="{
                                        left: (normaliseDate(show.scheduledTime) * 100) + '%',
                                        width: (normaliseDate(show.endTime) - normaliseDate(show.scheduledTime)) * 100 + '%',
                                        '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                    }">
                                        <span>{{ show.playlist }}</span>
                                        <br>
                                        <span>
                                            {{ format(show.scheduledTime, 'HH:mm', { locale: nl }) }} - {{
                                                format(show.endTime, 'HH:mm', { locale: nl }) }}
                                            <span contenteditable style="float:right;"> </span>
                                        </span>
                                    </div>
                                </template>
                            </Waterfall>
                        </template>
                    </div>
                </div>
                <SidePanel style="flex: auto 1 0;">
                    <h2>Opties</h2>

                    <fieldset>
                        <legend>Weergave</legend>
                        <InputSwitch v-model="colourful" identifier="colourful">
                            <span>Kleurrijke planning</span>
                        </InputSwitch>
                    </fieldset>
                </SidePanel>
            </div>
        </section>

        <div v-if="isOverDropZone" class="dropzone">
            Laat los om bestand te uploaden
        </div>
    </main>
</template>

<style scoped>
.planner-section {
    h3 {
        margin-bottom: 8px;
    }
}

.waterfall {
    &.black :deep(.waterfall-strip) {
        /* background-color: #000000; */
    }

    .show {
        position: absolute;
        background-color: hsl(var(--hue) 50% 30%);
        background-color: lch(40% 15% var(--hue));
        color: white;
        padding: 2px 5px;
        border-radius: 3px;
        font-size: 12px;
        overflow: hidden;
        white-space: nowrap;
        box-sizing: border-box;
        height: calc(100% - 8px);

        &>span:last-child {
            opacity: 0.75;

            &>span {
                min-width: 20px;
                text-align: end;
            }
        }
    }

    .enter-workload {
        position: absolute;
        background-color: hsl(var(--hue) 50% 30%);
        background-color: lch(40% 15% var(--hue));
        mask-image: linear-gradient(to right,
                transparent 0%,
                black 40%,
                black 60%,
                transparent 100%);
        mix-blend-mode: screen;
        box-sizing: border-box;
        height: calc(100% - 8px);
    }

    .plf-workload {
        position: absolute;
        background-color: hsl(var(--hue) 50% 30%);
        background-color: lch(40% 15% var(--hue));
        /* mask-image: linear-gradient(to right,
                transparent 0%,
                black 40%,
                black 60%,
                transparent 100%); */
        mix-blend-mode: screen;
        box-sizing: border-box;
        height: calc(100% - 8px);

        transform: scaleY(0.5);
        transform-origin: bottom;
    }

    .exit-workload {
        position: absolute;
        background-color: hsl(var(--hue) 50% 30%);
        background-color: lch(40% 15% var(--hue));
        mask-image: linear-gradient(to right,
                black 0%,
                black 50%,
                transparent 100%);
        mix-blend-mode: screen;
        box-sizing: border-box;
        height: calc(100% - 8px);
    }

    .intermission-workload {
        position: absolute;
        background-color: hsl(var(--hue) 50% 30%);
        background-color: lch(40% 15% var(--hue));
        mask-image: linear-gradient(to right,
                black 0%,
                black 50%,
                transparent 100%);
        mix-blend-mode: screen;
        box-sizing: border-box;
        height: calc(100% - 8px);

        transform: scaleY(0.5);
        transform-origin: top;
    }
}
</style>
