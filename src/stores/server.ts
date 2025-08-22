import { ref } from "vue";
import { useLocalStorage, useUrlSearchParams } from "@vueuse/core";
import { defineStore } from "pinia";

export const useServerStore = defineStore('server', () => {
    const params = useUrlSearchParams('history');

    const url = params.url ? ref(params.url as string) : ref("https://kid-daring-robin.ngrok-free.app");
    const username = params.username ? ref(params.username as string) : useLocalStorage('server-username', '');
    const password = params.password ? ref(params.password as string) : useLocalStorage('server-password', '');

    return { url, username, password };
});

export const httpStatuses = {
    'sending': {
        short: 'Versturen naar cloud...',
        long: 'Er worden gegevens geüpload naar de cloudserver...'
    },
    'sent': {
        short: 'Verstuurd naar cloud',
        long: 'De ingelezen gegevens zijn succesvol geüpload naar de cloudserver.'
    },
    'send-error': {
        short: 'Fout bij versturen naar cloud',
        long: 'De ingelezen gegevens konden niet worden geüpload naar de cloudserver. Controleer de inloggegevens en of de cloudserver bereikbaar is.'
    },
    'no-credentials': {
        short: 'Niet verstuurd naar cloud',
        long: 'De ingelezen gegevens zijn niet geüpload naar de cloudserver, omdat de benodigde inloggegevens niet ingevoerd zijn.'
    },
    'receiving': {
        short: 'Ophalen uit cloud...',
        long: 'Er worden gegevens gedownload van de cloudserver...'
    },
    'received': {
        short: 'Opgehaald uit cloud',
        long: 'De gegevens zijn succesvol gedownload van de cloudserver.'
    },
    'receive-error': {
        short: 'Fout bij ophalen uit cloud',
        long: 'De gegevens konden niet worden gedownload van de cloudserver. Controleer de inloggegevens en of de cloudserver bereikbaar is.'
    },
    'no-connection': {
        short: 'Niet verbonden met cloud',
        long: 'Er is geen verbinding met de cloudserver. Controleer de inloggegevens en of de cloudserver bereikbaar is.'
    },
    'error': {
        short: 'Fout',
        long: 'Er is een fout opgetreden bij het verbinden met de cloudserver. Controleer de inloggegevens en of de cloudserver bereikbaar is.'
    }
};
