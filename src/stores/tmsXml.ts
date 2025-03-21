import { ref } from 'vue';
import { defineStore } from 'pinia';
import { xml2js } from 'xml-js';

export const useTmsXmlStore = defineStore('tmsXml', () => {
    const obj = ref<{}>({});
    const metadata = ref<{ name: string, type: string, lastModified: number, size: number } | {}>({});

    async function uploadXml(fileList: FileList) {
        const file = fileList[0];
        if (!file || !isXmlFile(file)) return;
        
        obj.value = {};
        metadata.value = {};

        const text = await file.text();
        const xml = xml2js(text, { compact: true }) as { CompositionPlaylist: Record<string, any> } | Record<string, any>;

        obj.value = xml?.CompositionPlaylist;

        metadata.value = {
            name: file.name,
            type: file.type,
            lastModified: file.lastModified,
            size: file.size
        };
    }

    return { obj, metadata, uploadXml };
});

function isXmlFile(file: File): boolean {
    return file.type === 'text/xml' || file.name.endsWith('.xml');
}
