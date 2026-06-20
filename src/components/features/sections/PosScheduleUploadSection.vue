<script setup lang="ts">
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { usePosScheduleStore } from '@/stores/posSchedule';

const store = usePosScheduleStore();
</script>

<template>
    <div id="upload">
        <div class="section-content">
            <FileUploadBlock @files-uploaded="store.uploadXml" accept="text/xml,.xml"
                :highlight="false">
                <p v-if="store.metadata" style="margin: 0; flex-grow: 1;"
                    :title="[`Bestandsnaam: ${store.metadata.name}`, `Gewijzigd op: ${format(store.metadata.lastModified, 'PPpp', { locale: nl })}`, `Geüpload op: ${format(store.metadata.uploadedDate, 'PPpp', { locale: nl })}`].join('\n')">
                    <span>
                        Aantallen van {{ format(store.metadata.timestamp, 'PPPPp', { locale: nl }) }}
                    </span>
                </p>
                <p v-else style="margin: 0; flex-grow: 1;">
                    Geen aantallen
                    <br>
                    <small>Upload een aantallenbestand (knop <b>POS</b> in RosettaBridge) met de knop of door hem hierheen te slepen.</small>
                </p>
                <template #buttons>
                    <slot name="buttons"></slot>
                </template>
            </FileUploadBlock>
        </div>
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