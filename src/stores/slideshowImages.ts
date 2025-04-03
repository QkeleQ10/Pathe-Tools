import { ref, onMounted } from 'vue'
import { defineStore } from 'pinia'
import { useServerStore } from './server';

export const useSlideshowImagesStore = defineStore('slideshowImages', () => {
    const images = ref<string[]>([]);
    const status = ref<'no-connection' | 'no-credentials' | 'sending' | 'sent' | 'send-error' | 'receiving' | 'received' | 'receive-error' | 'error'>('no-connection');

    const serverStore = useServerStore();

    onMounted(connect);

    // const now = new Date();
    // const target = new Date();
    // target.setHours(5, 0, 0, 0);
    // if (now > target) target.setDate(target.getDate() + 1);
    // setTimeout(() => {
    //     connect();
    //     setInterval(connect, 24 * 60 * 60 * 1000); // Call connect every 24 hours
    // }, target.getTime() - now.getTime());

    async function connect() {
        while (images.value.length) images.value.pop();

        if (serverStore.username.length > 0) {
            try {
                status.value = 'receiving';
                const array = await getFromServer();
                if (Object.values(array)?.[0]) images.value.push(...array);
                status.value = 'received';
            } catch (error) {
                status.value = 'receive-error';
                console.error(error);
            }
        } else {
            status.value = 'no-connection';
        }
    }

    async function getFromServer(): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`${serverStore.url}/users/${serverStore.username}/pictures`, {
                    headers: {
                        'ngrok-skip-browser-warning': 'true'
                    }
                });
                if (!response.ok) throw new Error(`Server responded with ${response.status} ${response.statusText}`);

                const data = await response.json();
                if (!data) throw new Error('No data found');

                const array = await Promise.all(data.map(async (fileId: string) => await fetchImage(fileId)));
                resolve(array);
            } catch (error) {
                console.error("Error getting data from server:", error);
                reject(error);
            }
        });
    }

    async function filesUploaded(files: FileList | File[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                status.value = 'sending';

                const formData = new FormData();
                for (const file of files) {
                    formData.append('pictures', file);
                }

                const response = await fetch(`${serverStore.url}/users/${serverStore.username}/pictures`, {
                    method: 'POST',
                    headers: {
                        Authorization: 'Basic ' + btoa(`${serverStore.username}:${serverStore.password}`),
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: formData
                });
                if (!response.ok) throw new Error(`Server responded with ${response.status} ${response.statusText}`);

                const data = await response.json();
                if (!data) throw new Error('No data found');

                status.value = 'receiving';

                images.value = [
                    ...images.value,
                    ...(await Promise.all(data.files.map(async (fileId: string) => await fetchImage(fileId))))
                ].sort((a, b) => a.localeCompare(b));

                status.value = 'sent';
                resolve();
            } catch (error) {
                status.value = 'send-error';
                console.error(error)
                reject(error);
            }
        });
    }

    async function deleteAll(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                status.value = 'sending';

                const response = await fetch(`${serverStore.url}/users/${serverStore.username}/pictures`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: 'Basic ' + btoa(`${serverStore.username}:${serverStore.password}`),
                        'ngrok-skip-browser-warning': 'true'
                    }
                });
                if (!response.ok) throw new Error(`Server responded with ${response.status} ${response.statusText}`);

                images.value = [];

                status.value = 'sent';
                resolve();
            } catch (error) {
                status.value = 'send-error';
                reject(error);

            }
        });
    }

    async function fetchImage(fileId: string) {
        const response = await fetch(`${serverStore.url}/users/${serverStore.username}/pictures/${fileId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    return { images, filesUploaded, deleteAll, fetchImage, status, connect };
});
