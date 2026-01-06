<script setup lang="ts">
import { ref, computed, inject, useTemplateRef, Ref } from 'vue'
import { useStorage, useDropZone } from '@vueuse/core'
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { Show, TimetableShow } from '@/scripts/types.ts'
import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

const store = useTmsScheduleStore();

const now = inject<Ref<Date>>('now');

const hover = ref<boolean>(false);
const hoverPos = ref<number>(0);

const colourful = useStorage('ushering-planner-view-colourful', true);

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
                <div style="flex: 210mm 0 0;">
                    <h2>Planner</h2>
                    <p id="upload-hint" v-if="!store.table.length">Upload eerst een bestand.</p>

                    <div class="planner-section">
                        <h3>Druk</h3>
                        <div class="waterfall" id="shows-waterfall">
                            <h4>Uitlopen</h4>
                            <div class="waterfall-strip workload"
                                @mousemove="(e) => { hover = true; const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); hoverPos = (e.clientX - rect.left) / rect.width; }"
                                @mouseleave="hover = false">
                                <template v-for="show in store.table" :key="show.playlist + show.scheduledTime">
                                    <div class="exit-workload" :style="{
                                        left: (normaliseDate(show.creditsTime) * 100) + '%',
                                        width: (normaliseDate(new Date(show.endTime.getTime() + 1200000)) - normaliseDate(show.creditsTime)) * 100 + '%',
                                        '--hue': !colourful ? 210 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                    }">
                                    </div>
                                </template>
                                <div class="now" :style="{
                                    left: (normaliseDate(now) * 100) + '%'
                                }"></div>
                                <div class="hover" v-if="hover" :style="{
                                    left: (hoverPos * 100) + '%'
                                }"></div>
                            </div>
                        </div>
                        <div class="waterfall" id="shows-waterfall">
                            <h4>Inlopen</h4>
                            <div class="waterfall-strip workload">
                                <template v-for="show in store.table" :key="show.playlist + show.scheduledTime">
                                    <div class="enter-workload" :style="{
                                        left: (normaliseDate(new Date(show.scheduledTime.getTime() - 1200000)) * 100) + '%',
                                        width: (normaliseDate(new Date(show.scheduledTime.getTime() + 1200000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 1200000))) * 100 + '%',
                                        '--hue': !colourful ? 210 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                    }">
                                    </div>
                                </template>
                                <div class="now" :style="{
                                    left: (normaliseDate(now) * 100) + '%'
                                }"></div>
                                <div class="hover" v-if="hover" :style="{
                                    left: (hoverPos * 100) + '%'
                                }"></div>
                            </div>
                        </div>
                        <div class="waterfall" id="shows-waterfall">
                            <h4>Gecombineerd</h4>
                            <div class="waterfall-strip workload">
                                <template v-for="show in store.table" :key="show.playlist + show.scheduledTime">
                                    <div class="exit-workload" :style="{
                                        left: (normaliseDate(show.creditsTime) * 100) + '%',
                                        width: (normaliseDate(new Date(show.endTime.getTime() + 1200000)) - normaliseDate(show.creditsTime)) * 100 + '%',
                                        '--hue': !colourful ? 210 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                    }">
                                    </div>
                                </template>
                                <template v-for="show in store.table" :key="show.playlist + show.scheduledTime">
                                    <div class="enter-workload" :style="{
                                        left: (normaliseDate(new Date(show.scheduledTime.getTime() - 1200000)) * 100) + '%',
                                        width: (normaliseDate(new Date(show.scheduledTime.getTime() + 1200000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 1200000))) * 100 + '%',
                                        '--hue': !colourful ? 210 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                    }">
                                    </div>
                                </template>
                                <div class="now" :style="{
                                    left: (normaliseDate(now) * 100) + '%'
                                }"></div>
                                <div class="hover" v-if="hover" :style="{
                                    left: (hoverPos * 100) + '%'
                                }"></div>
                            </div>
                        </div>
                    </div>

                    <div class="planner-section">
                        <h3>Zalen</h3>
                        <div class="waterfall" id="shows-waterfall">
                            <template v-for="auditorium in auditoriums" :key="auditorium">
                                <h4>{{ auditorium }}</h4>
                                <div class="waterfall-strip auditorium">
                                    <template v-for="show in store.table.filter(s => s.auditorium === auditorium)"
                                        :key="show.playlist + show.scheduledTime">
                                        <div class="show" :style="{
                                            left: (normaliseDate(show.scheduledTime) * 100) + '%',
                                            width: (normaliseDate(show.endTime) - normaliseDate(show.scheduledTime)) * 100 + '%',
                                            '--hue': !colourful ? 210 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                        }">
                                            <span>{{ show.playlist }}</span>
                                            <br>
                                            <span>
                                                {{ format(show.scheduledTime, 'HH:mm', { locale: nl }) }} - {{
                                                    format(show.endTime, 'HH:mm', { locale: nl }) }}
                                            </span>
                                        </div>
                                    </template>
                                    <div class="now" :style="{
                                        left: (normaliseDate(now) * 100) + '%'
                                    }"></div>
                                    <div class="hover" v-if="hover" :style="{
                                        left: (hoverPos * 100) + '%'
                                    }"></div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
                <SidePanel style="flex: 150px 1 0;">
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
    position: relative;

    h3 {
        margin-bottom: 8px;
    }
}

.now,
.hover {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: white;
    z-index: 1;
}

.waterfall {
    position: relative;

    &>h4 {
        margin-top: 8px;
        margin-bottom: 0;
        z-index: 1;
    }

    .waterfall-strip {
        position: relative;
        height: 50px;
        padding: 4px;
        border-radius: 5px;
        outline: 1px solid #ffffff14;
        overflow: hidden;

        &.workload {
            /* height: 80px; */
        }

        .show {
            position: absolute;
            background-color: hsl(var(--hue), 50%, 30%);
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
            }
        }

        .enter-workload {
            position: absolute;
            /* background-color: hsl(var(--hue), 50%, 30%); */
            background-image: linear-gradient(to right,
                    hsl(var(--hue) 50% 30% / 0) 0%,
                    hsl(var(--hue) 50% 30% / 1) 40%,
                    hsl(var(--hue) 50% 30% / 1) 60%,
                    hsl(var(--hue) 50% 30% / 0) 100%);
            mix-blend-mode: screen;
            box-sizing: border-box;
            height: calc(100% - 8px);
        }

        .exit-workload {
            position: absolute;
            /* background-color: hsl(var(--hue), 50%, 30%); */
            background-image: linear-gradient(to right,
                    hsl(var(--hue) 50% 30% / 0) 0%,
                    hsl(var(--hue) 50% 30% / 1) 10%,
                    hsl(var(--hue) 50% 30% / 1) 50%,
                    hsl(var(--hue) 50% 30% / 0) 100%);
            mix-blend-mode: screen;
            box-sizing: border-box;
            height: calc(100% - 8px);
        }
    }
}
</style>
