import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Show } from '@/classes/classes'

export const useTmsScheduleStore = defineStore('tmsSchedule', () => {
    const table = ref<Show[]>([]);
    const metadata = ref < { name: string, type: string, lastModified: number, size: number } | {}>({});

    async function addFiles(fileList: FileList) {
        while (table.value.length) table.value.pop();
        metadata.value = {};

        const file = fileList[0];
        if (!isCsvFile(file)) return;

        const text = await file.text();
        const rows = text.split('\n');
        const headers = splitCsv(rows[0]);

        const parsedData = rows
            .slice(1)
            .map(row => {
                const data = splitCsv(row);
                return headers.reduce((obj, header, index) => {
                    obj[header.trim()] = data[index]?.trim();
                    return obj;
                }, {} as Record<string, string>);
            })
            .map(obj => new Show({
                playlist: obj.PLAYLIST,
                feature: obj.FEATURE,
                featureRating: obj.FEATURE_RATING,
                auditorium: obj.AUDITORIUM,
                scheduledTime: timeStringToDate(obj.SCHEDULED_TIME),
                showTime: timeStringToDate(obj.SHOW_TIME),
                featureTime: timeStringToDate(obj.FEATURE_TIME),
                creditsTime: timeStringToDate(obj.CREDITS_TIME),
                endTime: timeStringToDate(obj.END_TIME),
                duration: obj.DURATION
            }));

        table.value.push(...parsedData);

        metadata.value = {
            name: file.name,
            type: file.type,
            lastModified: file.lastModified,
            size: file.size
        };
    }

    return { table, metadata, addFiles };
});

function isCsvFile(file: File): boolean {
    return file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.name.endsWith('.csv');
}

function splitCsv(str: string): string[] {
    const tokens = [];
    let token = '';
    let insideQuotes = false;

    for (const char of str) {
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            tokens.push(token.trim());
            token = '';
        } else {
            token += char;
        }
    }
    tokens.push(token.trim());
    return tokens;
}

function timeStringToDate(timeString: string): Date {
    const now = new Date();
    if (now.getHours() < 6) now.setDate(now.getDate() - 1);

    const date = new Date(`${now.toDateString()} ${timeString}`);
    if (date.getHours() < 6) date.setDate(date.getDate() + 1);

    return date;
}
