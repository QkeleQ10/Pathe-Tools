<script setup lang="ts">
const model = defineModel<{ spriteName: string; offset: number }[]>();
const showAnnouncementBuilder = defineModel<boolean>('show', { default: false });
const props = defineProps({
    noButton: {
        type: Boolean,
        default: false
    },
});

function addSegment() {
    model.value.push({
        spriteName: '',
        offset: 0,
    });
}
</script>

<template>
    <Button v-if="!noButton" class="secondary full left" @click="showAnnouncementBuilder = true"
        v-bind="$attrs">
        <slot>
            <Icon>build</Icon>
            <span>Omroep bewerken</span>
        </slot>
    </Button>

    <Transition>
        <ModalDialog v-if="showAnnouncementBuilder" @dismiss="showAnnouncementBuilder = false">
            <h3>Omroeponderdelen</h3>
            <ul v-if="model.length" class="list scroll">
                <li class="segment" v-for="(segment, i) in model" :key="i" style="position: relative;">
                    <SpriteSelector :id="'spriteName' + i" :datalist-id="'spriteName' + i + 'datalist'"
                        v-model="segment.spriteName" />
                    <Input type="number" :id="'offset' + i" v-model="segment.offset" />
                    <span class="unit"
                        style="position: absolute; right: 50px; top: 20px; opacity: .5; font-size: 12px;">ms</span>
                    <Icon class="delete" @click="model.splice(i, 1)">
                        close</Icon>
                </li>
            </ul>
            <p v-else>
                Geen onderdelen.
            </p>
            <div class="flex" style="margin-top: 16px;">
                <Button class="secondary add-rule" @click="addSegment">
                    <Icon>add</Icon>
                    Nieuw onderdeel
                </Button>
                <slot name="buttons">
                </slot>
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
    grid-template-columns: 1fr 125px auto;
    gap: 8px;
}

.add-segment {
    margin-top: 8px;
}
</style>
