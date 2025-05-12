<script setup lang="ts">
import { AnnouncementRule } from '@/classes/classes';
import { getSoundInfo } from '@/utils/voices';

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
    creditsTime: 'aftiteling',
    endTime: 'einde voorstelling'
}

function ruleId(rule: AnnouncementRule) {
    return rule.id || rule.sprites.join('-');
}

function addRule() {
    const rule: AnnouncementRule = {
        id: Date.now().toString(),
        enabled: true,
        sprites: ['chime', 'auditorium#'],
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
    <ul v-if="rules.length" class="rule-list">
        <li class="rule" v-for="(rule, i) in rules" :key="ruleId(rule)" :class="{ active: rule.enabled }">
            <Icon v-if="!toggleOnly" style="float: right; cursor: pointer; padding: 2px;" @click="rules.splice(i, 1)">
                delete</Icon>

            <InputCheckbox class="toggler" :identifier="ruleId(rule) + 'enabled'" v-model="rule.enabled">
                {{ rule.name || "Eigen regel" }}
            </InputCheckbox>
            <div v-if="!toggleOnly" class="input timing-input">
                <span>Timing</span>
                <span>
                    <InputNumber class="no-label" :identifier="ruleId(rule) + 'triggerPreponeMinutes'" unit="min."
                        v-model="rule.trigger.preponeMinutes"></InputNumber>
                    vóór
                    <InputSelect class="no-label" :identifier="ruleId(rule) + 'triggerProperty'"
                        v-model="rule.trigger.property">
                        <template #options>
                            <option v-for="(value, key) in properties" :key="key" :value="key">
                                {{ value }}
                            </option>
                        </template>
                    </InputSelect>
                </span>
            </div>
            <p v-else>
                Wordt <span v-if="rule.trigger.preponeMinutes > 0"><b>{{ rule.trigger.preponeMinutes }} min.</b>
                    vóór</span>
                <span v-else-if="rule.trigger.preponeMinutes < 0"><b>{{ -rule.trigger.preponeMinutes }} min.</b>
                    na</span>
                <span v-else>bij</span> <b>{{ properties[rule.trigger.property] }}</b> omgeroepen
            </p>

            <InputAnnouncement v-if="!toggleOnly" :identifier="ruleId(rule) + 'announcement'" v-model="rule.sprites">
                Omroep
            </InputAnnouncement>

            <p v-else>
                De omroep bestaat uit: <b>{{rule.sprites.map(s => getSoundInfo(s).name).join(' - ')}}</b>
            </p>

            <details v-if="!toggleOnly" class="filters">
                <summary>Filter:
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
                </summary>
                <InputCheckbox :identifier="ruleId(rule) + 'plfOnly'" v-model="rule.filter.plfOnly">
                    Alleen 4DX-voorstellingen
                </InputCheckbox>
                <InputCheckbox :identifier="ruleId(rule) + 'lastShowOnly'" v-model="rule.filter.lastShowOnly">
                    Alleen de laatste overeenkomst
                </InputCheckbox>
                <InputCheckbox :identifier="ruleId(rule) + 'firstShowOnly'" v-model="rule.filter.firstShowOnly">
                    Alleen de eerste overeenkomst
                </InputCheckbox>
                <InputText :identifier="ruleId(rule) + 'playlistTitleIncludes'"
                    v-model="rule.filter.playlistTitleIncludes">
                    Titel moet bevatten
                </InputText>
                <InputText :identifier="ruleId(rule) + 'playlistTitleExcludes'"
                    v-model="rule.filter.playlistTitleExcludes">
                    Titel mag niet bevatten
                </InputText>
            </details>

            <p v-else-if="Object.values(rule.filter).some(v => typeof v === 'string' ? v.length > 0 : v)">
                De omroep wordt alleen afgespeeld bij
                <b v-if="rule.filter.lastShowOnly">de laatste </b>
                <b v-if="rule.filter.firstShowOnly">de eerste </b>
                <b v-if="rule.filter.plfOnly">4DX-</b>voorstelling{{ rule.filter.lastShowOnly ||
                    rule.filter.firstShowOnly ? '' :
                    'en' }}
                <span v-if="rule.filter.playlistTitleIncludes">met <b>{{ rule.filter.playlistTitleIncludes }}</b>
                    in de titel
                </span>
                <span v-if="rule.filter.playlistTitleExcludes">zonder <b>{{ rule.filter.playlistTitleExcludes }}</b>
                    in de titel
                </span>
            </p>
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
}

.rule {
    display: block;
    margin-top: 8px;
    margin-bottom: 8px;
    padding: 6px;
    background-color: #ffffff14;
    border-radius: 5px;
    font-size: 14px;

    &:not(.active) {
        opacity: 0.5;
    }

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

.add-rule {
    margin-top: 8px;
}
</style>