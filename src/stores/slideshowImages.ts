import { ref, onMounted } from 'vue'
import { defineStore } from 'pinia'
import { useServerStore } from './server';

export const useSlideshowImagesStore = defineStore('slideshowImages', () => {
    const images = ref<{ name: string, url: string }[]>([]);
    const status = ref<'no-connection' | 'no-credentials' | 'sending' | 'sent' | 'send-error' | 'receiving' | 'received' | 'receive-error' | 'error'>('no-connection');

    const serverStore = useServerStore();

    onMounted(connect);

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

    async function getFromServer(): Promise<{ name: string, url: string }[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`http://localhost:3541/users/${serverStore.username}/pictures`, {
                    headers: {
                        'ngrok-skip-browser-warning': 'true'
                    }
                });
                if (!response.ok) throw new Error(`Server responded with ${response.status} ${response.statusText}`);

                const data = await response.json();
                if (!data) throw new Error('No data found');

                const array = await Promise.all(data.map(async (fileName: string) => ({ name: fileName, url: await fetchImage(fileName) })));
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

                const response = await fetch(`http://localhost:3541/users/${serverStore.username}/pictures`, {
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
                    ...(await Promise.all(data.files.map(async (fileName: string) => ({ name: fileName, url: await fetchImage(fileName) }))))
                ].sort((a, b) => a.name.localeCompare(b.name));

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

                const response = await fetch(`http://localhost:3541/users/${serverStore.username}/pictures`, {
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

    async function deleteImage(fileId: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                status.value = 'sending';

                const response = await fetch(`http://localhost:3541/users/${serverStore.username}/pictures/${fileId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: 'Basic ' + btoa(`${serverStore.username}:${serverStore.password}`),
                        'ngrok-skip-browser-warning': 'true'
                    }
                });
                if (!response.ok) throw new Error(`Server responded with ${response.status} ${response.statusText}`);

                images.value = images.value.filter(image => image.name !== fileId);

                status.value = 'sent';
                resolve();
            } catch (error) {
                status.value = 'send-error';
                console.error(error);
                reject(error);
            }
        });
    }

    async function fetchImage(fileId: string) {
        const response = await fetch(`http://localhost:3541/users/${serverStore.username}/pictures/${fileId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    return { images, filesUploaded, deleteAll, deleteImage, fetchImage, status, connect };
});
