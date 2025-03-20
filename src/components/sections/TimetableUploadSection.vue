<script setup lang="ts">
import { ref } from 'vue';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import { httpStatuses, useServerStore } from '@/stores/server';

const store = useTmsScheduleStore();

const serverStore = useServerStore();

const showOptions = ref<boolean>(false);
</script>

<template>
    <section id="upload">
        <h2>Gegevensbestand
            <button id="upload-status" @click="showOptions = true"
                :title="httpStatuses[store.status].long || store.status + '\nKlik om serveropties te wijzigen'">
                <div id="upload-status-light" :class="store.status"></div>
                {{ httpStatuses[store.status].short || store.status }}
            </button>
        </h2>
        <FileUploadBlock @files-uploaded="store.filesUploaded" accept="text/csv,.csv">
            <p v-if="'name' in store.metadata" style="flex-grow: 1;">
                {{ store.metadata.name }}
                <br>
                <small>
                    Laatst gewijzigd op {{ format(new Date(store.metadata.lastModified), 'PPPpp',
                        { locale: nl }) }}
                    <br>
                    Geüpload op {{ format(new Date(store.metadata.uploadedDate), 'PPPpp', { locale: nl })
                    }}
                </small>
            </p>
            <p v-else style="flex-grow: 1;">
                Geen gegevens
                <br>
                <small>Upload een CSV-bestand uit RosettaBridge (met optie 'times only')</small>
            </p>
        </FileUploadBlock>

        <Transition>
            <ModalDialog v-if="showOptions" @dismiss="showOptions = false">
                <h3>Opslag op server</h3>
                <p>
                    Als je een geldige gebruikersnaam en wachtwoord hebt opgegeven, dan worden de door jou ingelezen
                    gegevens bewaard op de server.
                    <br><br>
                    Je kunt vervolgens later (eventueel vanaf een ander apparaat) de gegevens downloaden als je daar ook
                    je gebruikersnaam opgeeft.
                    <br><br>
                    Er is altijd maar één set gegevens op de server beschikbaar. Als je dus nieuwe gegevens inleest, dan
                    worden de oude gewist.
                </p>
                <div id="server-options">
                    <em class="label">Status</em>
                    <div class="server-options-container">
                        <p>
                            <span id="upload-status-light" :class="store.status"></span>
                            <strong>{{ httpStatuses[store.status].short || store.status }}</strong>
                        </p>
                        <p>{{ httpStatuses[store.status].long }}</p>
                    </div>

                    <em class="label">Configuratie</em>
                    <div class="server-options-container">
                        <InputText v-model="serverStore.username" identifier="username">
                            <span>Gebruikersnaam</span>
                        </InputText>
                        <InputText v-model="serverStore.password" identifier="password">
                            <span>Wachtwoord</span>
                        </InputText>
                    </div>
                    <small v-if="['send-error', 'no-credentials', 'no-connection'].includes(store.status)"
                        style="display: block; margin-block: 12px;">Let op:
                        als
                        je gegevens vernieuwt, dan gaan niet-geüploade wijzigingen verloren.</small>
                    <ButtonPrimary class="full" @click="showOptions = false; store.connect();">
                        <Icon>check</Icon>Vernieuwen
                    </ButtonPrimary>
                </div>
            </ModalDialog>
        </Transition>
    </section>
</template>

<style scoped>
#upload-status {
    height: 53px;
    float: right;
    display: flex;
    align-items: center;

    background-color: transparent;
    border: none;
    color: currentColor;
    font: 16px Heebo, arial, sans-serif;
    text-shadow: 0px 0px 8px #000;

    cursor: pointer;

    &:hover,
    &:focus {
        text-decoration: underline;
    }

    #upload-status-light {
        box-shadow: 0px 0px 8px #000;
    }
}

#upload-status-light {
    display: inline-block;
    position: relative;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 10px;
    --background-color: hsl(0, 0%, 55%);
    background-color: var(--background-color);

    &.sent,
    &.received {
        --background-color: hsl(134, 80%, 55%);
    }

    &.error,
    &.send-error,
    &.receive-error {
        --background-color: hsl(354, 80%, 55%);
    }

    &.sending,
    &.receiving {
        --background-color: hsl(208, 80%, 55%);

        &::after {
            content: '';
            border: 2px solid var(--background-color);
            border-radius: 50%;
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            animation: pulsate 750ms infinite;
        }
    }

    &.receiving {
        &::after {
            animation: pulsate 750ms infinite reverse;
        }
    }
}

.server-options-container {
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

@keyframes pulsate {
    0% {
        scale: 0.8;
        opacity: 0.0;
    }

    50% {
        opacity: 1.0;
    }

    100% {
        scale: 1.3;
        opacity: 0.0;
    }
}
</style>