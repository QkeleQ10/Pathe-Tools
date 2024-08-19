import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useTimetableFileStore = defineStore('timetableFile', () => {
  const table = ref([])
  
  async function addFiles(fileList) {
    if (fileList?.[0]?.type !== 'text/csv') return
    const text = await fileList[0].text()

    const arr = text.split('\n')

    let jsonObj = []
    const headers = arr[0].split(',')
    for (var i = 0; i < arr.length; i++) {
      const data = arr[i].split(',')
      let obj = {}
      for (let j = 0; j < data.length; j++) {
        obj[headers[j].trim()] = data[j].trim()
      }
      jsonObj.push(obj)
    }
    jsonObj = jsonObj.map((row, i) => {
      if (i === 0) return row
      row.scheduledTime = timeStringToDate(row.SCHEDULED_TIME)
      row.showTime = timeStringToDate(row.SHOW_TIME)
      row.featureTime = timeStringToDate(row.FEATURE_TIME)
      row.creditsTime = timeStringToDate(row.CREDITS_TIME)
      row.endTime = timeStringToDate(row.END_TIME)
      return row
    })
    table.value = jsonObj
  }

  return { table, addFiles }
})



function timeStringToDate(string) {
  let now = new Date()
  if (now.getHours() < 6) now.setDate(now.getDate() - 1)
  let date = new Date(now.toDateString() + ' ' + string)
  if (date.getHours() < 6) date.setDate(date.getDate() + 1)
  return date
}