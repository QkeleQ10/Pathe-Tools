<script setup lang="ts">
import { format } from 'date-fns';
import { ref, h, useTemplateRef, onMounted } from 'vue';
import { showDialog } from '@/scripts/dialogManager';
import { nl } from 'date-fns/locale';
import { TimetableShow } from '@/scripts/types';

const props = defineProps<{
    shows: TimetableShow[];
}>();

const syncFilmTitles = ref(true);
const editDialogOpen = ref(false);
const showBeingEdited = ref<TimetableShow | null>(null);

const list = useTemplateRef('list');

onMounted(() => {
    const firstUnstartedShow = props.shows.find(show => show.scheduledTime.getTime() - Date.now() >= -(15 * 60000));
    if (firstUnstartedShow && list.value) {
        const element = document.getElementById(`show-${firstUnstartedShow.i}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

function showFormattingInfo() {
    showDialog([
        h('h3', "Opmaak"),
        h('p', [
            "In invoervelden zoals deze kunnen de volgende codes worden gebruikt:", h('br'), h('br'),
            h('code', "~Cn;"), " tekstkleur (waarbij n = 0, 1, 2 of 3)", h('br'),
            h('code', "~Bn;"), " achtergrondkleur (waarbij n = 0, 1, 2 of 3)", h('br'),
            h('code', "~R;"), " kleuren omwisselen", h('br'),
            h('code', "~I;"), " kleuren resetten", h('br'),
            h('code', "~F;"), " knipperen", h('br'),
            h('code', "~N;"), " niet meer knipperen", h('br'),
        ])
    ])
}

function removeShow(show: TimetableShow) {
    const index = props.shows.findIndex((candidate) => candidate.i === show.i);
    if (index >= 0) {
        props.shows.splice(index, 1);
    }
}

function openEditDialog(show: TimetableShow) {
    showBeingEdited.value = show;
    editDialogOpen.value = true;
}

function addShow() {
    const scheduledTime = new Date();
    scheduledTime.setSeconds(0, 0);
    scheduledTime.setMinutes(Math.ceil((scheduledTime.getMinutes() + 1) / 5) * 5);

    const newShow: TimetableShow = {
        i: props.shows.length ? Math.max(...props.shows.map(show => show.i)) + 1 : 0,
        title: '',
        auditorium: '',
        scheduledTime,
        intermissionTime: null,
        intermissionEndTime: null,
        tags: {
            plf: [],
            language: [],
            age: [],
        }
    };

    props.shows.push(newShow);
    openEditDialog(newShow);
}

function updateEditedTitle(value: string) {
    if (!showBeingEdited.value) return;

    if (syncFilmTitles.value) {
        props.shows
            .filter((show) => show.title === showBeingEdited.value?.title)
            .forEach((show) => show.title = value);
        return;
    }

    showBeingEdited.value.title = value;
}

function clearEditedIntermission() {
    if (!showBeingEdited.value) return;

    showBeingEdited.value.intermissionTime = null;
    showBeingEdited.value.intermissionEndTime = null;
}

function addEditedIntermission() {
    if (!showBeingEdited.value) return;

    const intermissionTime = new Date();
    intermissionTime.setSeconds(0, 0);
    intermissionTime.setMinutes(Math.ceil((intermissionTime.getMinutes() + 1) / 5) * 5);

    showBeingEdited.value.intermissionTime = intermissionTime;
    showBeingEdited.value.intermissionEndTime = new Date(intermissionTime.getTime() + (15 * 60000));
}
</script>

<template>
    <div>
        <h3>Voorstellingen</h3>

        <p v-if="shows.some(show => show.title.length > 35)">
            <b>Let op:</b> enkele filmtitels zijn erg lang en worden mogelijk afgekapt.
        </p>

        <ul class="scrollable-list" ref="list" style="max-height: calc(95vh - 200px);">
            <TransitionGroup name="list">

                <li v-for="(show) in [...shows].sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())"
                    class="show" :key="show.i" :id="`show-${show.i}`">
                    <span :class="{
                        'too-long': show.title.length > 35,
                        'strikethrough': show.scheduledTime.getTime() - Date.now() < -(15 * 60000)
                    }" :title="show.title">
                        <strong>{{ show.title || 'Geen titel' }}</strong>
                    </span>
                    <br>
                    <small :title="format(show.scheduledTime, 'dd-MM-yyyy HH:mm', { locale: nl })">
                        <strong>{{ format(show.scheduledTime, 'HH:mm', { locale: nl }) }}</strong>
                        &bullet;
                        {{ show.auditorium ? `Zaal ${show.auditorium}` : 'Geen zaal' }}
                        <template v-if="show.scheduledTime.getTime() - Date.now() < -(15 * 60000)">
                            &bullet; Gestart
                        </template>
                    </small>
                    <template v-if="show.intermissionTime">
                        <br>
                        <small>
                            Pauze: {{ format(show.intermissionTime, 'HH:mm', { locale: nl }) }}
                            <template v-if="show.intermissionEndTime">
                                - {{ format(show.intermissionEndTime, 'HH:mm', { locale: nl }) }}
                            </template>
                        </small>
                    </template>
                    <div class="show-actions">
                        <Button class="tertiary" @click="openEditDialog(show)">
                            <Icon>edit</Icon>
                        </Button>
                        <Button class="tertiary" @click="removeShow(show)">
                            <Icon class="delete">delete</Icon>
                        </Button>
                    </div>
                    <div class="flex chips">
                        <Chip v-for="tag in Object.values(show.tags).flatMap(e => e).filter(e => e)">
                            {{ tag.replace(/^\((.*)\)$/, '$1') }}
                        </Chip>
                    </div>
                </li>

            </TransitionGroup>
            <p v-if="!shows.length">Geen voorstellingen gepland.</p>
        </ul>

        <Teleport to="body">
            <Transition>
                <ModalDialog v-if="editDialogOpen" @dismiss="editDialogOpen = false">
                    <template v-if="showBeingEdited">
                        <h3>Voorstelling bewerken</h3>


                        <div class="edit-show-form">
                            <div>
                                <div class="label">Titel</div>
                                <Input type="text" class="show-title" :spellcheck="false" autocomplete="off"
                                    :id="`show-${showBeingEdited.i}-title`" :model-value="showBeingEdited.title"
                                    @update:model-value="updateEditedTitle"
                                    :class="{ 'too-long': showBeingEdited.title.length > 38 }">
                                </Input>
                                <div class="additional-control">
                                    <InputSwitch v-if="shows.length" identifier="syncFilmTitles"
                                        v-model="syncFilmTitles">
                                        Titel synchroniseren met andere voorstellingen
                                    </InputSwitch>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                <div>
                                    <div class="label">Start voorstelling</div>
                                    <InputDate class="show-time" :id="`show-${showBeingEdited.i}-time`"
                                        v-model="showBeingEdited.scheduledTime" style="width: 100%;">
                                    </InputDate>
                                </div>
                                <div>
                                    <div class="label">Zaal</div>
                                    <Input type="text" class="show-auditorium" :spellcheck="false" autocomplete="off"
                                        :id="`show-${showBeingEdited.i}-auditorium`"
                                        v-model="showBeingEdited.auditorium">
                                    </Input>
                                </div>
                            </div>
                            <div class="group" v-if="showBeingEdited.intermissionTime">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                    <div>
                                        <div class="label">Start pauze</div>
                                        <InputDate class="show-time" :id="`show-${showBeingEdited.i}-intermissionTime`"
                                            v-model="showBeingEdited.intermissionTime" style="width: 100%;">
                                        </InputDate>
                                    </div>
                                    <div>
                                        <div class="label">Einde pauze</div>
                                        <InputDate class="show-time"
                                            :id="`show-${showBeingEdited.i}-intermissionEndTime`"
                                            v-model="showBeingEdited.intermissionEndTime" style="width: 100%;">
                                        </InputDate>
                                    </div>
                                </div>
                                <br>
                                <Button class="tertiary" @click="clearEditedIntermission">Pauze schrappen</Button>
                            </div>
                            <Button class="tertiary" v-else @click="addEditedIntermission">Pauze toevoegen</Button>
                        </div>
                    </template>
                </ModalDialog>
            </Transition>
        </Teleport>

        <div class="flex buttons" style="gap:24px; margin-top: 16px;">
            <Button class="tertiary" @click="addShow">
                <span>Voorstelling toevoegen</span>
            </Button>
            <Button class="tertiary" @click="showFormattingInfo">
                Opmaak
            </Button>
        </div>
    </div>
</template>

<style>
.show {
    position: relative;

    small {
        opacity: 0.7;
    }

    .too-long {
        color: #f15a5a;
    }

    .strikethrough {
        text-decoration: line-through;
        opacity: 0.7;
    }

    .chips {
        gap: 4px;
        position: absolute;
        right: 12px;
        top: 8px;
    }

    .show-actions {
        display: flex;
        gap: 8px;
        position: absolute;
        right: 12px;
        bottom: 8px;
    }
}

.edit-show-form {
    display: flex;
    flex-direction: column;
    gap: 12px;


    .additional-control {
        margin-inline: 12px;
        padding: 4px 8px;
        background-color: #8484840d;
        border: 1px solid light-dark(#9da1ac, #30343d);
        border-top: none;
        border-radius: 0 0 6px 6px;
        box-shadow: inset 0px 6px 6px -6px #0000007c;
    }
}
</style>