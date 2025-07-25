<script setup lang="ts">
import { ref } from 'vue';
import { AnnouncementRule } from '@/classes/classes';
import { getSoundInfo } from '@/utils/voices';

const showAnnouncementBuilder = ref(false);
const showFilterDialog = ref(false);

const rules = defineModel<AnnouncementRule[]>()
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

function addRule() {
    const rule: AnnouncementRule = {
        id: Date.now().toString(),
        enabled: true,
        segments: [
            { spriteName: 'chime', offset: -800 },
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
}
</script>

<template>
    <ul v-if="rules.length" class="rule-list" :class="{ 'toggle-only': toggleOnly }">
        <li class="rule" v-for="(rule, i) in rules" :key="rule.id" :class="{ active: rule.enabled }">
            <Icon v-if="!toggleOnly" style="float: right; cursor: pointer; padding: 2px;" @click="rules.splice(i, 1)">
                delete</Icon>

            <InputCheckbox class="toggler" :identifier="rule.id + 'enabled'" v-model="rule.enabled">
                {{ rule.name || "Eigen regel" }}
            </InputCheckbox>
            <div v-if="!toggleOnly" class="input timing-input">
                <span>Timing:</span>
                <span style="position: relative;">
                    <Input type="number" :id="rule.id + 'triggerPreponeMinutes'" v-model="rule.trigger.preponeMinutes"
                        style="width: 75px;" />
                    <span class="unit"
                        style="position: absolute; left: 48px; top: 12px; opacity: .5; font-size: 12px;">min.</span>
                    vóór
                    <Select :id="rule.id + 'triggerProperty'" v-model="rule.trigger.property" style="width: 200px;">
                        <option v-for="(value, key) in properties" :key="key" :value="key">
                            {{ value }}
                        </option>
                    </Select>
                </span>
            </div>
            <p v-else>
                Timing:
                <span style="opacity: .5;">
                    <span v-if="rule.trigger.preponeMinutes > 0"><b>{{ rule.trigger.preponeMinutes }} min.</b>
                        vóór</span>
                    <span v-else-if="rule.trigger.preponeMinutes < 0"><b>{{ -rule.trigger.preponeMinutes }} min.</b>
                        na</span>
                    <span v-else>bij</span> <b>{{ properties[rule.trigger.property] }}</b>
                </span>
            </p>

            <a @click="() => { if (!toggleOnly) showAnnouncementBuilder = true }">
                <u>Omroep</u>:
                <span style="opacity: .5;">
                    {{rule.segments.map(segment => getSoundInfo(segment.spriteName).name).join(' - ')}}
                </span>
            </a>
            <AnnouncementBuilder no-button v-model="rule.segments" v-model:show="showAnnouncementBuilder">
                <Icon>build</Icon>
                <span>{{rule.segments.map(segment => getSoundInfo(segment.spriteName).name).join(' - ')}}</span>
            </AnnouncementBuilder>

            <br>

            <a v-if="!toggleOnly || Object.values(rule.filter).some(v => typeof v === 'string' ? v.length > 0 : v)"
                @click="() => { if (!toggleOnly) showFilterDialog = true }">
                <u>Filter</u>:
                <span v-if="Object.values(rule.filter).some(v => typeof v === 'string' ? v.length > 0 : v)"
                    style="opacity: .5;">
                    alleen
                    <b v-if="rule.filter.lastShowOnly">de laatste </b>
                    <b v-if="rule.filter.firstShowOnly">de eerste </b>
                    <b v-if="rule.filter.plfOnly">4DX-</b>voorstelling{{ rule.filter.lastShowOnly ||
                        rule.filter.firstShowOnly ? '' :
                        'en' }}
                    <span v-if="rule.filter.playlistTitleIncludes">met <b>{{
                        rule.filter.playlistTitleIncludes
                            }}</b> in de titel
                    </span>
                    <span v-if="rule.filter.playlistTitleExcludes">zonder <b>{{
                        rule.filter.playlistTitleExcludes }}</b>
                        in de titel
                    </span>
                </span>
                <span v-else style="opacity: .5;">elke voorstelling</span>
            </a>

            <Transition>
                <ModalDialog v-if="showFilterDialog" @dismiss="showFilterDialog = false" class="filters">
                    <h3>Filter</h3>
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
                </ModalDialog>
            </Transition>
        </li>
    </ul>
    <p v-else>
        Geen regels gevonden.
    </p>
    <Button v-if="!toggleOnly" class="secondary add-rule" @click="addRule">
        <Icon>add</Icon>
        Nieuwe regel
    </Button>
</template>

<style scoped>
.rule-list {
    list-style-type: none;
    padding: 0;
    margin: 0;

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
    display: block;
    margin-top: 8px;
    margin-bottom: 8px;
    padding: 6px;
    background-color: #ffffff14;
    border-radius: 5px;

    &>.input,
    &>p,
    &>a,
    &>details {
        font-size: 14px;
    }

    &:not(.active) {
        opacity: 0.5;
    }

    &>* {
        margin: 6px;
    }

    &>a {
        display: inline-block;
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

    .filters label {
        margin-top: 8px;
        margin-bottom: 8px;
    }
}

.add-rule {
    margin-top: 8px;
}
</style>