import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { xml2js } from 'xml-js'

export const useTmsXmlStore = defineStore('tmsXml', () => {
    const obj = ref([])
    const metadata = ref({})

    async function addFiles(fileList) {
        if (!(fileList?.[0]?.type === 'text/xml' || fileList?.[0]?.name?.endsWith('.xml'))) return
        const text = await fileList[0].text()

        obj.value = xml2js(text, { compact: true })?.CompositionPlaylist
    console.log(obj.value)
        metadata.value = { name: fileList[0].name, type: fileList[0].type, lastModified: fileList[0].lastModified, size: fileList[0].size }
    }

    return { obj, metadata, addFiles }
})
