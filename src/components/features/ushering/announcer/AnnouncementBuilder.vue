<script setup lang="ts">
import SpriteSelector from './SpriteSelector.vue';

const model = defineModel<{ spriteName: string; offset: number }[]>({ default: [] });
const showAnnouncementBuilder = defineModel<boolean>('show', { default: false });
const props = defineProps({
    noButton: {
        type: Boolean,
        default: false
    },
    auditoriumKnown: {
        type: Boolean,
        default: false
    }
});

function addSegment() {
    model.value.push({
        spriteName: '',
        offset: 0,
    });
}
</script>

<template>
    <Button v-if="!noButton" class="secondary full left" @click="showAnnouncementBuilder = true" v-bind="$attrs">
        <slot>
            <Icon>build</Icon>
            <span>Omroep bewerken</span>
        </slot>
    </Button>

    <Transition>
        <ModalDialog v-if="showAnnouncementBuilder" @dismiss="showAnnouncementBuilder = false">
            <h3>Omroeponderdelen</h3>
            <ul class="list scroll fixed">
                <li class="segment" v-for="(segment, i) in model" :key="i" style="position: relative;">
                    <SpriteSelector :id="'spriteName' + i" :datalist-id="'spriteName' + i + 'datalist'"
                        v-model="segment.spriteName" :additional-sounds="auditoriumKnown ? ['auditorium#'] : []" />

                    <!-- <InputGroup type="number" id="offset" v-model.number="segment.offset" min="0" max="30">
                        <template #label>Nalooptijd</template>
<span class="unit">ms</span>
</InputGroup> -->

                    <Icon class="delete" @click="model.splice(i, 1)">
                        close</Icon>
                </li>
                <p v-if="!model.length" style="margin: 16px;">Geen onderdelen</p>
            </ul>
            <div class="toolbar">
                <Button class="tertiary add-rule" @click="addSegment">
                    <Icon>add</Icon>
                    Nieuw onderdeel
                </Button>
            </div>
            <slot name="footer">
            </slot>
        </ModalDialog>
    </Transition>
</template>

<style scoped>
.segment {
    display: grid;
    align-items: center;
    grid-template-columns: 1fr auto;
    gap: 8px;
}

.list {
    border-radius: 5px 5px 0 0;
}

.toolbar {
    padding: 8px 12px;
    margin: 0;
    border: 1px solid #ffffff14;
    border-top: 0;
    border-radius: 0 0 5px 5px;
}
</style>
