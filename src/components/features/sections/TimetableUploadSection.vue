<script setup lang="ts">
import { ref, watch } from 'vue';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { useTmsScheduleStore } from '@/stores/tmsSchedule';

const store = useTmsScheduleStore();

const showOptions = ref<boolean>(false);
const hideFileTypeNotice = ref<boolean>(false);

watch(store, () => hideFileTypeNotice.value = false, { deep: true });
</script>

<template>
    <div id="upload">
        <div class="section-content">
            <FileUploadBlock @files-uploaded="store.filesUploaded" accept="text/csv,.csv,text/tsv,.tsv"
                :highlight="!store.table.length">
                <p v-if="'name' in store.metadata" style="margin: 0; flex-grow: 1;"
                    :title="[`Bestandsnaam: ${store.metadata.name}`, `Gewijzigd op: ${format(store.metadata.lastModified, 'PPpp', { locale: nl })}`, `Geüpload op: ${format(store.metadata.uploadedDate, 'PPpp', { locale: nl })}`].join('\n')">
                    <span v-if="store.metadata.flags.includes('times-only')">{{ store.metadata.name }}</span>
                    <span v-else>
                        Tijdenlijst {{ format(store.table[0].scheduledTime, 'PPPP', { locale: nl }) }}
                    </span>
                    <br>
                    <small>
                        Bevat {{ store.table.length }} voorstellingen
                        {{store.table.some(show => show.intermissionTime) ? 'met pauzes' : ''}}
                    </small>
                </p>
                <p v-else style="margin: 0; flex-grow: 1;">
                    Geen gegevens
                    <br>
                    <small>Upload een <b>TSV</b>-bestand uit RosettaBridge (optie <b>Dates - ISO</b>) met de knop of
                        door hem hierheen te slepen.</small>
                </p>
                <template #buttons>
                    <slot name="buttons"></slot>
                </template>
            </FileUploadBlock>
        </div>

        <Transition>
            <ModalDialog
                v-if="(('type' in store.metadata && store.metadata.type.includes('csv')) || ('flags' in store.metadata && store.metadata.flags.includes('times-only'))) && !hideFileTypeNotice"
                @dismiss="hideFileTypeNotice = true">
                <h3>Opmerking</h3>
                <p id="file-upload-notice">
                    Je hebt een <span v-if="store.metadata.type.includes('csv')"><b>CSV</b>-</span>bestand
                    <span v-if="store.metadata.flags.includes('times-only')">met de optie <b>Times only</b></span>
                    geüpload. Voor tijdenlijstjes is dat meestal prima, maar soms kunnen er problemen optreden.
                    <br>
                    <br>Kies in RosettaBridge liever
                    <span v-if="store.metadata.flags.includes('times-only')">
                        <em>Dates - ISO</em> in plaats van <i>Dates - Times only</i>.
                    </span>
                    <span v-if="store.metadata.type.includes('csv')">
                        <span v-if="store.metadata.flags.includes('times-only')">
                            <br>Klik dan op
                        </span>
                        <em>TSV</em> in plaats van <i>CSV</i>.
                    </span>
                    Dankjewel!
                </p>
            </ModalDialog>
        </Transition>
    </div>
</template>

<style scoped>
#upload {
    .floating {
        width: 90%;
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

.hover-text {
    .text-alt {
        display: none;
    }

    &:hover {
        .text-norm {
            display: none;
        }

        .text-alt {
            display: unset;
        }
    }
}
</style>