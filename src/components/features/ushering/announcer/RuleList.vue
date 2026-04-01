<script setup lang="ts">
import { ref, watch } from 'vue';
import { AnnouncementRule } from '@/scripts/types.ts';
import { getSoundInfo } from '@/scripts/voices';
import AnnouncementBuilder from './AnnouncementBuilder.vue';

const showAnnouncementBuilder = ref(false);
const showEditDialog = ref(false);

const rules = defineModel<AnnouncementRule[]>()
const emit = defineEmits(['change']);

// Emit a 'change' event whenever the rules array or its items change
watch(rules, (newVal) => emit('change', newVal), { deep: true });
const props = defineProps({
    toggleOnly: {
        type: Boolean,
        default: false
    },
})

const properties = {
    scheduledTime: 'inloop',
    showTime: 'start',
    mainShowTime: 'start hoofdfilm',
    intermissionTime: 'pauze',
    creditsTime: 'aftiteling',
    endTime: 'einde voorstelling'
}

const propertiesLong = {
    scheduledTime: 'de aanvangstijd van',
    showTime: 'de start van',
    mainShowTime: 'de start van de hoofdfilm van',
    intermissionTime: 'de pauze van',
    creditsTime: 'de aftiteling van',
    endTime: 'het einde van'
}

function addRule() {
    const rule: AnnouncementRule = {
        id: Date.now().toString(),
        enabled: true,
        segments: [
            { spriteName: 'attention', offset: -800 },
            { spriteName: 'auditorium#', offset: 0 }
        ],
        trigger: {
            property: 'scheduledTime',
            preponeMinutes: 0
        },
        filter: {
            plfOnly: false,
            lastShowOnly: false,
            firstShowOnly: false,
            playlistTitleIncludes: '',
            playlistTitleExcludes: ''
        },
    };
    rules.value.push(rule);
    showEditDialog.value = true;
}
</script>

<template>
    <ul class="list rule-list" :class="{ 'toggle-only': toggleOnly }">
        <li class="rule" v-for="(rule, i) in rules" :key="rule.id" :class="{ active: rule.enabled }">

            <InputSwitch :identifier="rule.id + 'enabled'" v-model="rule.enabled">
                {{rule.name || ('\'' + rule.segments.map(segment => getSoundInfo(segment.spriteName).name).join(' ') +
                    '\'')
                }}
            </InputSwitch>

            <small>
                <template v-if="rule.trigger.preponeMinutes < 0">
                    {{ -rule.trigger.preponeMinutes }} min. na
                </template>
                <template v-else-if="rule.trigger.preponeMinutes > 0">
                    {{ rule.trigger.preponeMinutes }} min. vóór
                </template>
                <template v-else>
                    bij
                </template>
                {{ propertiesLong[rule.trigger.property] }}
                <template v-if="rule.filter.lastShowOnly">de laatste </template>
                <template v-else-if="rule.filter.firstShowOnly">de eerste </template>
                <template v-else>elke </template>
                <template v-if="rule.filter.plfOnly">4DX-voorstelling </template>
                <template v-else>voorstelling </template>
                <template v-if="rule.filter.playlistTitleIncludes">met <i>{{
                    rule.filter.playlistTitleIncludes
                        }}</i> in de titel
                </template>
                <template v-if="rule.filter.playlistTitleExcludes">zonder <i>{{
                    rule.filter.playlistTitleExcludes }}</i>
                    in de titel
                </template>
            </small>

            <div class="actions" v-if="!toggleOnly">
                <Icon class="edit" @click="showEditDialog = true">
                    edit</Icon>
                <Icon class="delete" @click="rules.splice(i, 1)">
                    delete</Icon>
            </div>

            <Transition>
                <ModalDialog v-if="showEditDialog" @dismiss="showEditDialog = false" class="filters">
                    <h3>Regel bewerken</h3>

                    <em class="label">Trigger</em>
                    <div class="dialog-section-container timing-input">
                        <span style="position: relative;">
                            <Input type="number" :id="rule.id + 'triggerPreponeMinutes'"
                                v-model="rule.trigger.preponeMinutes" style="width: 75px;" />
                            <span class="unit"
                                style="position: absolute; left: 48px; top: 12px; opacity: .5; font-size: 12px;">min.</span>
                            vóór
                            <Select :id="rule.id + 'triggerProperty'" v-model="rule.trigger.property"
                                style="width: 200px;">
                                <option v-for="(value, key) in properties" :key="key" :value="key">
                                    {{ value }}
                                </option>
                            </Select>
                        </span>
                    </div>

                    <em class="label">Omroepinhoud</em>
                    <div class="dialog-section-container">
                        '{{rule.segments.map(segment => getSoundInfo(segment.spriteName).name).join(' ')}}'
                        <br>
                        <Button class="tertiary" @click="showAnnouncementBuilder = true">
                            Bewerken
                        </Button>
                    </div>
                    <AnnouncementBuilder no-button v-model="rule.segments" v-model:show="showAnnouncementBuilder">
                        <Icon>build</Icon>
                        <span>{{rule.segments.map(segment => getSoundInfo(segment.spriteName).name).join(' - ')}}</span>
                    </AnnouncementBuilder>

                    <em class="label">Voorwaarden</em>
                    <div class="dialog-section-container">
                        <InputCheckbox :identifier="rule.id + 'plfOnly'" v-model="rule.filter.plfOnly">
                            Alleen 4DX-voorstellingen
                        </InputCheckbox>
                        <InputCheckbox :identifier="rule.id + 'lastShowOnly'" v-model="rule.filter.lastShowOnly">
                            Alleen de laatste overeenkomst
                        </InputCheckbox>
                        <InputCheckbox :identifier="rule.id + 'firstShowOnly'" v-model="rule.filter.firstShowOnly">
                            Alleen de eerste overeenkomst
                        </InputCheckbox>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <InputGroup type="text" :id="rule.id + 'playlistTitleIncludes'"
                                v-model="rule.filter.playlistTitleIncludes">
                                <template #label>Titel moet bevatten</template>
                            </InputGroup>
                            <InputGroup type="text" :id="rule.id + 'playlistTitleExcludes'"
                                v-model="rule.filter.playlistTitleExcludes">
                                <template #label>Titel mag niet bevatten</template>
                            </InputGroup>
                        </div>
                    </div>

                    <div class="buttons">
                        <Button class="tertiary" @click="rules.splice(i, 1); showEditDialog = false;">
                            Regel verwijderen
                        </Button>
                    </div>
                </ModalDialog>
            </Transition>
        </li>
        <li class="dummy add" v-if="!toggleOnly">
            <Button class="tertiary add-rule" @click="addRule">
                Regel toevoegen
            </Button>
        </li>
    </ul>
</template>

<style scoped>
.rule-list {
    &.toggle-only .rule>a>u {
        text-decoration: none;
    }

    &:not(.toggle-only) .rule>a {
        cursor: pointer;

        span {
            text-decoration: underline;
        }
    }
}

.rule {
    position: relative;

    &:not(.active) {

        .input :deep(.title) {
            opacity: 0.5;
        }

        small {
            opacity: 0.25;
        }
    }

    &>a {
        display: inline-block;
    }

    small {
        opacity: .75;
    }

    .timing-input {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .actions {
        position: absolute;
        right: 12px;
        bottom: 8px;
        display: flex;
        gap: 4px;
    }

    .buttons {
        display: flex;
        gap: 8px;
    }
}

.dialog-section-container {
    padding: 1rem;
    padding-block: 8px;
    padding-bottom: 8px;
    margin-top: 6px;
    margin-bottom: 16px;
    border-radius: 6px;
    background-color: #ffffff0d;

    &>p:first-child {
        margin-top: 8px;
    }

    &>.input {
        margin-block: 8px;
    }
}
</style>