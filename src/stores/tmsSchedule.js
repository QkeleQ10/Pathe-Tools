import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTmsScheduleStore = defineStore('tmsSchedule', () => {
    const table = ref([])
    const metadata = ref({})

    async function addFiles(fileList) {
        if (!(fileList?.[0]?.type === 'text/csv' || fileList?.[0]?.type === 'application/vnd.ms-excel' || fileList?.[0]?.name?.endsWith('.csv'))) return
        const text = await fileList[0].text()

        const arr = text.split('\n')

        let jsonObj = []
        const headers = arr[0].splitCsv()
        for (var i = 0; i < arr.length; i++) {
            const data = arr[i].splitCsv()
            let obj = {}
            for (let j = 0; j < data.length; j++) {
                obj[headers[j]?.trim()] = data[j]?.trim()
            }
            jsonObj.push(obj)
        }
        jsonObj = jsonObj.map((row, i) => {
            if (i === 0) return row
            row.extra = row.PLAYLIST?.match(/(\s((4DX)|(ATMOS)|(IMX)|(3D)|(Music)|(ROOFTOP)|(PrideNight)|(Ladies)|(Premiere)|(\([A-Z]+\))))+/)?.[0]?.slice(1)
            row.extras = row.extra?.split(' ')
            row.title = row.PLAYLIST?.replace(row.extra, '')
            row.scheduledTime = timeStringToDate(row.SCHEDULED_TIME)
            row.showTime = timeStringToDate(row.SHOW_TIME)
            row.featureTime = timeStringToDate(row.FEATURE_TIME)
            row.creditsTime = timeStringToDate(row.CREDITS_TIME)
            row.endTime = timeStringToDate(row.END_TIME)
            return row
        })
        table.value = jsonObj
        metadata.value = { name: fileList[0].name, type: fileList[0].type, lastModified: fileList[0].lastModified, size: fileList[0].size }
    }

    return { table, metadata, addFiles }
})

String.prototype.splitCsv = function () {
    let tokens = [], token = '', insideQuotes = false
    for (let c of this) {
        if (c === '"') insideQuotes = !insideQuotes
        else if (c === ',' && !insideQuotes) tokens.push(token.trim()), token = ''
        else token += c
    }
    tokens.push(token.trim())
    return tokens
}

function timeStringToDate(string) {
    let now = new Date()
    if (now.getHours() < 6) now.setDate(now.getDate() - 1)
    let date = new Date(now.toDateString() + ' ' + string)
    if (date.getHours() < 6) date.setDate(date.getDate() + 1)
    return date
}
