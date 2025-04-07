import { ref } from "vue";
import { useLocalStorage, useUrlSearchParams } from "@vueuse/core";
import { defineStore } from "pinia";

export const useServerStore = defineStore('server', () => {
    const params = useUrlSearchParams('history');

    const url = params.url ? ref(params.url as string) : ref("https://pathe-tools-server.onrender.com");
    const username = params.username ? ref(params.username as string) : useLocalStorage('server-username', '');
    const password = params.password ? ref(params.password as string) : useLocalStorage('server-password', '');

    return { url, username, password };
});

export const httpStatuses = {
    'sending': {
        short: 'Uploaden...',
        long: 'Er worden gegevens geüpload naar de server...'
    },
    'sent': {
        short: 'Geüpload naar server',
        long: 'De ingelezen gegevens zijn succesvol geüpload naar de server.'
    },
    'send-error': {
        short: 'Fout bij uploaden naar server',
        long: 'De ingelezen gegevens konden niet worden geüpload naar de server. Controleer de inloggegevens en of de server bereikbaar is.'
    },
    'no-credentials': {
        short: 'Niet geüpload',
        long: 'De ingelezen gegevens zijn niet geüpload naar de server, omdat de benodigde inloggegevens niet ingevoerd zijn.'
    },
    'receiving': {
        short: 'Downloaden...',
        long: 'Er worden gegevens gedownload van de server...'
    },
    'received': {
        short: 'Gedownload van server',
        long: 'De gegevens zijn succesvol gedownload van de server.'
    },
    'receive-error': {
        short: 'Fout bij downloaden van server',
        long: 'De gegevens konden niet worden gedownload van de server. Controleer de inloggegevens en of de server bereikbaar is.'
    },
    'no-connection': {
        short: 'Niet verbonden',
        long: 'Er is geen verbinding met de server. Controleer de inloggegevens en of de server bereikbaar is.'
    },
    'error': {
        short: 'Fout',
        long: 'Er is een fout opgetreden bij het verbinden met de server. Controleer de inloggegevens en of de server bereikbaar is.'
    }
};
