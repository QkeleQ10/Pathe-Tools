<script setup lang="ts">
import { ref, watch } from 'vue';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';
import { httpStatuses, useServerStore } from '@/stores/server';

const store = useTmsScheduleStore();

const serverStore = useServerStore();

const showOptions = ref<boolean>(false);
const hideFileTypeNotice = ref<boolean>(false);

watch(store, () => hideFileTypeNotice.value = false, { deep: true });
</script>

<template>
    <section id="upload">
        <div class="floating">
            <!-- <h2>Gegevensbestand -->
            <button id="upload-status" @click="showOptions = true"
                :title="httpStatuses[store.status].long || store.status + '\nKlik om serveropties te wijzigen'">
                <div id="upload-status-light" :class="store.status"></div>
                {{ httpStatuses[store.status].short || store.status }}
            </button>
            <!-- </h2> -->
        </div>
        <FileUploadBlock @files-uploaded="store.filesUploaded" accept="text/csv,.csv,text/tsv,.tsv">
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
                <small>Upload een <b>TSV</b>-bestand uit RosettaBridge (optie <b>ISO</b>) met de knop of door hem
                    hierheen te slepen.</small>
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
                        <p>Serveradres<span style="float: right; opacity: .5;">{{ serverStore.url }}</span></p>
                        <InputText v-model="serverStore.username" identifier="username">
                            <span>Gebruikersnaam</span>
                        </InputText>
                        <InputText v-model="serverStore.password" identifier="password">
                            <span>Wachtwoord</span>
                        </InputText>
                    </div>
                    <small v-if="['send-error', 'no-credentials', 'no-connection'].includes(store.status)"
                        style="display: block; margin-block: 12px;">Let op: als je gegevens vernieuwt, dan gaan
                        niet-geüploade wijzigingen verloren.</small>
                    <Button class="primary full" @click="showOptions = false; store.connect();">
                        <Icon>check</Icon>Vernieuwen
                    </Button>
                </div>
            </ModalDialog>
        </Transition>

        <Transition>
            <ModalDialog
                v-if="(('type' in store.metadata && store.metadata.type.includes('csv')) || ('flags' in store.metadata && store.metadata.flags.includes('times-only'))) && !hideFileTypeNotice"
                @dismiss="hideFileTypeNotice = true">
                <h3>Opmerking</h3>
                <p id="file-upload-notice">
                    Je hebt een <span v-if="store.metadata.type.includes('csv')"><b>CSV</b>-</span>bestand
                    <span v-if="store.metadata.flags.includes('times-only')">met de optie <b>Times only</b></span>
                    geüpload. Meestal werkt dat prima, maar soms kunnen er problemen optreden.
                    <br>
                    <br>Kies de volgende keer in RosettaBridge
                    liever <span v-if="store.metadata.flags.includes('times-only')"><em>ISO</em> in plaats van <i>Times
                            only</i>.</span>
                    <span v-if="store.metadata.type.includes('csv')">
                        <span v-if="store.metadata.flags.includes('times-only')">
                            <br>Klik dan op</span> <em>TSV</em> in
                        plaats van
                        <i>CSV</i>.
                    </span> Dankjewel!
                    <br><br>
                    Groetjes,
                    <br>
                    Quinten
                </p>
            </ModalDialog>
        </Transition>
    </section>
</template>

<style scoped>
#upload {
    width: 90%;

    .floating {
        display: flex;
        justify-content: end;
    }
}

#upload-status {
    height: 53px;
    /* float: right; */
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

#file-upload-notice em {
    font-style: normal;
    font-weight: bold;
    color: #a6f678;
}

#file-upload-notice i {
    font-style: normal;
    color: #d78787;
}
</style>