import { ref } from 'vue'
import { defineStore } from 'pinia'
import { FileMetadata, Show } from '@/classes/classes'

export const useTmsScheduleStore = defineStore('tmsSchedule', () => {
    const table = ref<Show[]>([]);
    const metadata = ref<FileMetadata | {}>({});

    async function addFiles(fileList: FileList) {
        return new Promise<void>(async (resolve, reject) => {
            const file = fileList[0];
            if (!file || !isCsvFile(file)) return;

            while (table.value.length) table.value.pop();
            metadata.value = {};

            const text = await file.text();
            const rows = text.split('\n');
            const headers = splitCsv(rows[0]);

            const parsedTable = rows
                .slice(1)
                .map(row => {
                    const data = splitCsv(row);
                    return headers.reduce((obj, header, index) => {
                        obj[header.trim()] = data[index]?.trim();
                        return obj;
                    }, {} as Record<string, string>);
                })
                .map(obj => ({
                    title: extractExtras(obj.PLAYLIST).title,
                    extras: extractExtras(obj.PLAYLIST).extras,
                    playlist: obj.PLAYLIST,
                    feature: obj.FEATURE,
                    featureRating: obj.FEATURE_RATING,
                    auditorium: obj.AUDITORIUM,
                    auditoriumNumber: parseInt(obj.AUDITORIUM?.replace(/^\w+\s/, '')?.split(' ')[0]) || 0,
                    scheduledTime: timeStringToDate(obj.SCHEDULED_TIME),
                    showTime: timeStringToDate(obj.SHOW_TIME),
                    mainShowTime: timeStringToDate(obj.FEATURE_TIME),
                    creditsTime: timeStringToDate(obj.CREDITS_TIME),
                    endTime: timeStringToDate(obj.END_TIME),
                    duration: obj.DURATION
                }));

            table.value.push(...parsedTable);

            metadata.value = {
                name: file.name,
                type: file.type,
                lastModified: file.lastModified,
                uploadedDate: Date.now(),
                size: file.size
            };

            resolve();
        });
    }

    async function loadFromJson(json: object) {
        return new Promise<void>((resolve, reject) => {
            if (!json || !Object.values(json)?.[0] || !('timetable' in json) || !('metadata' in json)) return reject();

            while (table.value.length) table.value.pop();
            metadata.value = {};

            const data = json as { timetable: Show[], metadata: FileMetadata };

            const parsedTable = data.timetable.map(obj => ({
                ...obj,
                scheduledTime: new Date(obj.scheduledTime),
                showTime: new Date(obj.showTime),
                mainShowTime: new Date(obj.mainShowTime),
                creditsTime: new Date(obj.creditsTime),
                endTime: new Date(obj.endTime)
            }));

            table.value.push(...parsedTable);
            metadata.value = data.metadata;

            resolve();
        });
    }

    return { table, metadata, addFiles, loadFromJson };
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

function extractExtras(string: string): { extras: string[], title: string } {
    let extraString = string.match(/(\s((4DX)|(ATMOS)|(IMX)|(3D)|(Music)|(ROOFTOP)|(PrideNight)|(Ladies)|(Premiere)|(\([A-Z]+\))))+/)?.[0].slice(1) || '';
    return {
        extras: extraString.length > 0 ? extraString.split(' ') : [],
        title: string.replace(extraString, '').trim()
    };
}
