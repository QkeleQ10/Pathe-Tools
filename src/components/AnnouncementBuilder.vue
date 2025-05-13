<script setup lang="ts">
import { getSoundInfo, voices } from '@/utils/voices';

const model = defineModel<{ spriteName: string; offset: number }[]>();
const showAnnouncementBuilder = defineModel<boolean>('show', { default: false });
const emit = defineEmits(['play']);
const props = defineProps({
    noButton: {
        type: Boolean,
        default: false
    },
    playButton: {
        type: Boolean,
        default: false
    },
});

const allSounds = [...new Set(Object.values(voices).flatMap(voice => voice.sounds))];

function addSegment() {
    model.value.push({
        spriteName: '',
        offset: 0,
    });
}

function sentenceCase(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}
</script>

<template>
    <Button v-if="!noButton" class="secondary announcement-builder-button" @click="showAnnouncementBuilder = true"
        v-bind="$attrs">
        <slot>
            <Icon>build</Icon>
            <span>Omroep bewerken</span>
        </slot>
    </Button>

    <ModalDialog v-if="showAnnouncementBuilder" @dismiss="showAnnouncementBuilder = false">
        <h3>Omroeponderdelen</h3>
        <ul v-if="model.length" class="segment-list">
            <li class="segment" v-for="(segment, i) in model" :key="i">
                <InputText class="no-label" :identifier="'spriteName' + i" v-model="segment.spriteName"
                    spellcheck="false" autocomplete="off" autocapitalize="off">
                    <template #datalist>
                        <option v-for="(key) in allSounds" :key="key" :value="key">
                            {{ sentenceCase(getSoundInfo(key).name) }}
                        </option>
                    </template>
                </InputText>
                <InputNumber class="no-label" :identifier="'offset' + i" v-model="segment.offset" unit="ms">
                </InputNumber>
                <Icon style="float: right; cursor: pointer; padding: 2px;" @click="model.splice(i, 1)">
                    delete</Icon>
            </li>
        </ul>
        <p v-else>
            Geen onderdelen gevonden.
        </p>
        <div class="flex" style="margin-top: 16px;">
            <Button class="secondary add-rule" @click="addSegment">
                <Icon>add</Icon>
                Nieuw onderdeel
            </Button>
            <Button v-if="playButton" class="secondary add-rule" @click="emit('play')">
                <Icon>play_arrow</Icon>
                Afspelen
            </Button>
        </div>
    </ModalDialog>
</template>

<style scoped>
.segment-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.segment {
    display: block;
    margin-top: 8px;
    margin-bottom: 8px;
    padding: 6px;
    background-color: #ffffff14;
    border-radius: 5px;

    &>* {
        margin: 6px;
    }

    .checkbox-input.toggler {
        font-size: 16px;
        font-weight: bold;
        align-items: center;
    }

    .timing-input {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .select-input {
        width: 200px;
    }

    summary {
        cursor: pointer;
    }

    .filters:open {
        background-color: #ffffff14;
        border-radius: 5px;
        padding: 6px;

        &>* {
            margin: 6px;
        }
    }
}

.add-segment {
    margin-top: 8px;
}
</style>