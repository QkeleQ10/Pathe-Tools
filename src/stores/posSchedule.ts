import { ref } from 'vue';
import { defineStore } from 'pinia';
import { xml2js } from 'xml-js';

export const usePosScheduleStore = defineStore('posSchedule', () => {
    const shows = ref<{ _attributes: Record<string, any>, feature: { attributes: Record<string, any> } }[]>([]);
    const metadata = ref<{ name: string, type: string, lastModified: number, size: number, uploadedDate: number, timestamp: Date } | null>(null);

    async function uploadXml(fileList: File[] | FileList) {
        const file = fileList[0];
        if (!file || !isXmlFile(file)) return;

        shows.value = [];
        metadata.value = null;

        const text = await file.text();
        const xml = xml2js(text, { compact: true }) as { schedule: { show: [] } } | Record<string, any>;

        shows.value = xml?.schedule?.show || [];

        metadata.value = {
            name: file.name,
            type: file.type,
            lastModified: file.lastModified,
            size: file.size,
            uploadedDate: Date.now(),
            timestamp: new Date(xml?.schedule?._attributes?.timestamp || 0),
        };
    }

    return { shows, metadata, uploadXml };
});

function isXmlFile(file: File): boolean {
    return file.type === 'text/xml' || file.name.endsWith('.xml');
}
