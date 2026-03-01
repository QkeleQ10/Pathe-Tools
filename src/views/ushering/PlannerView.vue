<script setup lang="ts">
import { ref, computed, inject, useTemplateRef, Ref } from 'vue'
import { useStorage, useDropZone } from '@vueuse/core'
import { useTmsScheduleStore } from '@/stores/tmsSchedule'
import { Show, TimetableShow } from '@/scripts/types.ts'
import TimetableUploadSection from '@features/sections/TimetableUploadSection.vue';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import Waterfall from '@/components/features/ushering/planner/Waterfall.vue';
import Input from '@/components/ui/Input.vue';

const store = useTmsScheduleStore();

const now = inject<Ref<Date>>('now');

const isHovering = ref<boolean>(false);
const hoverPos = ref<number>(0);

const colourful = useStorage('ushering-planner-view-colourful', false);

const showsWithAdmits = ref<(Show & { admits?: number })[]>([]);

store.$subscribe(() => {
    if (!store.table.length) return;
    console.log(store.table)
    showsWithAdmits.value = store.table.map((show: TimetableShow) => ({ ...show, admits: null }));
})

const auditoriums = computed(() => {
    return [...new Set(store.table.map((show: TimetableShow) => show.auditorium).filter(Boolean))].sort((a, b) => ("" + a).localeCompare(b, undefined, { numeric: true }));
});

const showTitles = computed(() => {
    return [...new Set(store.table.map((show: TimetableShow) => show.title).filter(Boolean))].sort((a, b) => ("" + a).localeCompare(b, undefined, { numeric: true }));
});

const rangeStart = computed(() => {
    if (showsWithAdmits.value.length === 0) return new Date();
    const rangeStart = new Date(Math.min(...showsWithAdmits.value.map((show: TimetableShow) => show.scheduledTime.getTime())));
    rangeStart.setMinutes(rangeStart.getMinutes() - 20);
    return rangeStart;
});

const rangeEnd = computed(() => {
    if (showsWithAdmits.value.length === 0) return new Date();
    const rangeEnd = new Date(Math.max(...showsWithAdmits.value.map((show: TimetableShow) => show.endTime.getTime())));
    rangeEnd.setMinutes(rangeEnd.getMinutes() + 20);
    return rangeEnd;
});

function normalise(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
}

function normaliseDate(date: Date, minDate: Date = rangeStart.value, maxDate: Date = rangeEnd.value): number {
    return normalise(date.getTime(), minDate.getTime(), maxDate.getTime());
}

function showStarted(show: Show | (Show & { admits?: number }), now?: Date): boolean {
    return show.scheduledTime.getTime() + 900_000 <= now.getTime();
}

const { isOverDropZone } = useDropZone(useTemplateRef('main'), {
    onDrop: store.filesUploaded,
    // dataTypes: ['text/csv', '.csv', 'text/tsv', '.tsv'],
    multiple: false
})
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
                <p id="upload-hint" v-if="!store.table.length">Upload eerst een bestand.</p>

                <div class="planner-section">
                    <h3>Werkdruk</h3>
                    <Waterfall class="black" :now="normaliseDate(now)" v-model:is-hovering="isHovering"
                        v-model:hover-pos="hoverPos" title="Ushering">
                        <template v-for="show in showsWithAdmits" :key="show.playlist + show.scheduledTime">
                            <div class="exit-workload" :style="{
                                left: (normaliseDate(show.creditsTime) * 100) + '%',
                                width: (normaliseDate(new Date(show.endTime.getTime() + 1200000)) - normaliseDate(show.creditsTime)) * 100 + '%',
                                '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length),
                                '--admits': show.admits ?? 100,
                            }">
                            </div>
                        </template>
                        <template v-for="show in showsWithAdmits.filter(show => show.intermissionTime)"
                            :key="show.playlist + show.scheduledTime">
                            <div class="intermission-workload" :style="{
                                left: (normaliseDate(show.intermissionTime) * 100) + '%',
                                width: (normaliseDate(new Date(show.intermissionTime.getTime() + 300000)) - normaliseDate(show.intermissionTime)) * 100 + '%',
                                '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length),
                                '--admits': show.admits ?? 100,
                            }">
                            </div>
                        </template>
                        <template v-for="show in showsWithAdmits.filter(show => show.extras.includes('4DX'))"
                            :key="show.playlist + show.scheduledTime">
                            <div class="plf-workload" :style="{
                                left: (normaliseDate(new Date(show.scheduledTime.getTime() - 900000)) * 100) + '%',
                                width: (normaliseDate(show.mainShowTime || new Date(show.scheduledTime.getTime() + 900000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 900000))) * 100 + '%',
                                '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length),
                                '--admits': show.admits ?? 100,
                            }">
                            </div>
                        </template>
                    </Waterfall>

                    <Waterfall class="black" :now="normaliseDate(now)" v-model:is-hovering="isHovering"
                        v-model:hover-pos="hoverPos" title="Portier en F&B">
                        <template v-for="show in showsWithAdmits" :key="show.playlist + show.scheduledTime">
                            <div class="enter-workload" :style="{
                                left: (normaliseDate(new Date(show.scheduledTime.getTime() - 1200000)) * 100) + '%',
                                width: (normaliseDate(new Date(show.scheduledTime.getTime() + 1200000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 1200000))) * 100 + '%',
                                '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length),
                                '--admits': show.admits ?? 100,
                            }">
                            </div>
                        </template>
                    </Waterfall>

                    <Waterfall class="black" :now="normaliseDate(now)" v-model:is-hovering="isHovering"
                        v-model:hover-pos="hoverPos" title="Totaal">
                        <template v-for="show in showsWithAdmits" :key="show.playlist + show.scheduledTime">
                            <div class="exit-workload" :style="{
                                left: (normaliseDate(show.creditsTime) * 100) + '%',
                                width: (normaliseDate(new Date(show.endTime.getTime() + 1200000)) - normaliseDate(show.creditsTime)) * 100 + '%',
                                '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length),
                                '--admits': show.admits ?? 100,
                            }">
                            </div>
                        </template>
                        <template v-for="show in showsWithAdmits" :key="show.playlist + show.scheduledTime">
                            <div class="enter-workload" :style="{
                                left: (normaliseDate(new Date(show.scheduledTime.getTime() - 1200000)) * 100) + '%',
                                width: (normaliseDate(new Date(show.scheduledTime.getTime() + 1200000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 1200000))) * 100 + '%',
                                '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length),
                                '--admits': show.admits ?? 100,
                            }">
                            </div>
                        </template>
                        <template v-for="show in showsWithAdmits.filter(show => show.intermissionTime)"
                            :key="show.playlist + show.scheduledTime">
                            <div class="intermission-workload" :style="{
                                left: (normaliseDate(show.intermissionTime) * 100) + '%',
                                width: (normaliseDate(new Date(show.intermissionTime.getTime() + 300000)) - normaliseDate(show.intermissionTime)) * 100 + '%',
                                '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length),
                                '--admits': show.admits ?? 100,
                            }">
                            </div>
                        </template>
                        <template v-for="show in showsWithAdmits.filter(show => show.extras.includes('4DX'))"
                            :key="show.playlist + show.scheduledTime">
                            <div class="plf-workload" :style="{
                                left: (normaliseDate(new Date(show.scheduledTime.getTime() - 900000)) * 100) + '%',
                                width: (normaliseDate(show.mainShowTime || new Date(show.scheduledTime.getTime() + 900000)) - normaliseDate(new Date(show.scheduledTime.getTime() - 900000))) * 100 + '%',
                                '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length),
                                '--admits': show.admits ?? 100,
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
                            <template v-for="show in showsWithAdmits.filter(s => s.auditorium === auditorium)"
                                :key="show.playlist + show.scheduledTime">
                                <div class="show" :style="{
                                    left: (normaliseDate(show.scheduledTime) * 100) + '%',
                                    width: (normaliseDate(show.endTime) - normaliseDate(show.scheduledTime)) * 100 + '%',
                                    '--hue': !colourful ? 230 : showTitles.indexOf(show.title) * (360 / showTitles.length)
                                }">
                                    <span>{{ show.playlist }}</span>
                                    <br>
                                    <span class="time">
                                        {{ format(show.scheduledTime, 'HH:mm', { locale: nl }) }} - {{
                                            format(show.endTime, 'HH:mm', { locale: nl }) }}
                                    </span>
                                    <span class="admits">
                                        <Input class="contents-only" v-model.number="show.admits" type="number"
                                            autocomplete="off" min="0" />
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

                    <Tabs>

                        <Tab value="Uitlopen">
                            <div class="shows-list">
                                <template
                                    v-for="show in [...showsWithAdmits].sort((a, b) => a.creditsTime.getTime() - b.creditsTime.getTime())"
                                    :key="show.playlist + show.scheduledTime">
                                    <div class="show">
                                        <div>{{ show.auditorium.replace(/^\w+\s/, '') }}</div>
                                        <div>{{ show.scheduledTime ? format(show.scheduledTime, 'HH:mm') : '' }}
                                        </div>
                                        <div style="opacity: 1;">{{ !showStarted(show, now) ? show.admits : '' }}
                                        </div>
                                        <div>{{ show.creditsTime ? format(show.creditsTime, 'HH:mm:ss') : '' }}
                                        </div>
                                        <div style="opacity: 1;">{{ showStarted(show, now) ? show.admits : '' }}
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </Tab>

                        <Tab value="Inlopen">
                            <div class="shows-list">
                                <template
                                    v-for="show in [...showsWithAdmits].sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())"
                                    :key="show.playlist + show.scheduledTime">
                                    <div class="show">
                                        <div>{{ show.auditorium.replace(/^\w+\s/, '') }}</div>
                                        <div>{{ show.scheduledTime ? format(show.scheduledTime, 'HH:mm') : '' }}
                                        </div>
                                        <div style="opacity: 1;">{{ !showStarted(show, now) ? show.admits : '' }}
                                        </div>
                                        <div>{{ show.creditsTime ? format(show.creditsTime, 'HH:mm:ss') : '' }}
                                        </div>
                                        <div style="opacity: 1;">{{ showStarted(show, now) ? show.admits : '' }}
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </Tab>

                        <Tab value="Opties">
                            <fieldset>
                                <legend>Weergave</legend>
                                <InputSwitch v-model="colourful" identifier="colourful">
                                    <span>Kleurrijke planning</span>
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
@function --admits-opacity(--admits) {
    /* @return calc(var(--admits) / (30 + (var(--admits)))); */
    @return max(0.15, calc(1 - exp(-1 * (var(--admits) / 6)0)));
}

.planner-section {
    h3 {
        margin-bottom: 8px;
    }
}

.waterfall {
    /* &.black :deep(.waterfall-strip) {
        background-color: #000000;
    } */

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
        background-color: lch(40% 15% var(--hue));
        mask-image: linear-gradient(to right,
                transparent 0%,
                black 40%,
                black 60%,
                transparent 100%);
        mix-blend-mode: screen;
        box-sizing: border-box;
        height: calc(100% - 8px);

        /* transform: scaleX(calc(0.0075 * var(--admits) + 0.167)); */

        opacity: --admits-opacity(var(--admits));
        opacity: max(0.15, calc(1 - exp(-1 * (var(--admits) / 60))));
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

        transform: scaleY(0.5)
            /* scaleX(calc(0.0075 * var(--admits) + 0.167)) */
        ;
        transform-origin: bottom;

        opacity: --admits-opacity(var(--admits));
        opacity: max(0.15, calc(1 - exp(-1 * (var(--admits) / 60))));
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

        /* transform: scaleX(calc(0.0075 * var(--admits) + 0.167)); */
        transform-origin: left;

        opacity: --admits-opacity(var(--admits));
        opacity: max(0.15, calc(1 - exp(-1 * (var(--admits) / 60))));
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

        transform: scaleY(0.5)
            /* scaleX(calc(0.0075 * var(--admits) + 0.167)) */
        ;
        transform-origin: top;

        opacity: --admits-opacity(var(--admits));
        opacity: max(0.15, calc(1 - exp(-1 * (var(--admits) / 60))));
    }
}

.shows-list {
    max-width: 300px;
    font-size: 11px;
    display: grid;
    grid-template-columns: repeat(5, auto);

    .show {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: subgrid;

        &>div {
            opacity: .75;
        }
    }
}
</style>
