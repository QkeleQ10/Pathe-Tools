import { ref, onMounted } from 'vue'
import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia'
import { FileMetadata, Show } from '@/scripts/types.ts'

interface TmsScheduleJson {
    timetable: Show[],
    metadata: FileMetadata
}

export const useTmsScheduleStore = defineStore('tmsSchedule', () => {
    const table = ref<Show[]>([]);
    const metadata = ref<FileMetadata | {}>({});
    const status = ref<'no-connection' | 'no-credentials' | 'sending' | 'sent' | 'send-error' | 'receiving' | 'received' | 'receive-error' | 'error'>('no-connection');
    const flags = ref<string[]>([]);


    const intermissionDuration = useStorage('intermission-duration', 15) // duration of intermissions in minutes

    async function filesUploaded(files: FileList | File[]) {
        try {
            const file = Array.isArray(files) ? files[0] : files.item(0);
            if (!file) throw new Error("No file provided");

            const json = await transformToJson(file);
            await importJson(json);
        } catch (error) {
            console.error("Error processing file:", error);
            throw error;
        }
    }

    async function importJson(json: TmsScheduleJson): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!json || !Object.values(json)?.[0] || !('timetable' in json) || !('metadata' in json)) return reject(new Error('Invalid JSON format'));

            const parsedTable = json.timetable.map(obj => ({
                ...obj,
                /* TODO */ title: extractExtras(obj.playlist).title, extras: extractExtras(obj.playlist).extras, /* TODO */
                scheduledTime: obj.scheduledTime && new Date(obj.scheduledTime),
                showTime: obj.showTime && new Date(obj.showTime),
                mainShowTime: obj.mainShowTime && new Date(obj.mainShowTime),
                intermissionTime: obj.intermissionTime && new Date(obj.intermissionTime),
                creditsTime: obj.creditsTime && new Date(obj.creditsTime),
                endTime: obj.endTime && new Date(obj.endTime)
            }));

            table.value = parsedTable;
            metadata.value = json.metadata;

            resolve();
        });
    }

    async function transformToJson(file: File): Promise<TmsScheduleJson> {
        return new Promise<TmsScheduleJson>(async (resolve, reject) => {
            flags.value = [];

            if (!file || !(isCsvFile(file) || isTsvFile(file))) return reject(new Error('Invalid file type'));

            const text = await file.text();
            const rows = text.split('\n');
            const headers = splitData(rows[0]);

            const parsedTable = rows
                .slice(1)
                .map(row => {
                    const data = splitData(row);
                    return headers.reduce((obj, header, index) => {
                        obj[header.trim()] = data[index]?.trim();
                        return obj;
                    }, {} as Record<string, string>);
                })
                .filter(obj => !obj.PLAYLIST.includes('TMS-BLACK'))
                .map(obj => {
                    const show: Show = {
                        title: extractExtras(obj.PLAYLIST).title,
                        extras: extractExtras(obj.PLAYLIST).extras,
                        playlist: obj.PLAYLIST,
                        feature: obj.FEATURE,
                        featureRating: obj.FEATURE_RATING,
                        auditorium: obj.AUDITORIUM,
                        auditoriumNumber: obj.AUDITORIUM === "IMAX" ? 1 : parseInt(obj.AUDITORIUM?.replace("Rooftop", "10").replace(/^\w+\s/, '')?.split(' ')[0]) || 0,
                        scheduledTime: timeStringToDate(obj.SCHEDULED_TIME),
                        showTime: timeStringToDate(obj.SHOW_TIME),
                        creditsTime: timeStringToDate(obj.CREDITS_TIME) || timeStringToDate(obj.END_TIME),
                        endTime: timeStringToDate(obj.END_TIME),
                        duration: obj.DURATION
                    };
                    const featureTime = timeStringToDate(obj.FEATURE_TIME);

                    // If the difference between SCHEDULED_TIME and FEATURE_TIME is more than 30 minutes, then FEATURE_TIME is probably the end of the intermission (so subtract {intermissionDuration} minutes for the intermission time). Otherwise, it's probably the main show time.
                    if (featureTime.getTime() - show.scheduledTime.getTime() > 1800000)
                        show.intermissionTime = new Date(featureTime.getTime() - (intermissionDuration.value * 60000));
                    else show.mainShowTime = featureTime;

                    return show;
                });

            resolve({
                timetable: parsedTable,
                metadata: {
                    name: file.name,
                    type: file.type,
                    lastModified: file.lastModified,
                    uploadedDate: Date.now(),
                    size: file.size,
                    flags: flags.value,
                }
            });
        });
    }

    function isCsvFile(file: File): boolean {
        return file.type === 'text/csv' || file.name.endsWith('.csv');
    }

    function isTsvFile(file: File): boolean {
        return file.type === 'text/tsv' || file.name.endsWith('.tsv');
    }

    function splitTsv(str: string): string[] {
        const regex = /"([^"]*)"/g;
        let match;
        const result: string[] = [];

        while ((match = regex.exec(str)) !== null) {
            result.push(match[1]);
        }

        return result;
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

    function splitData(str: string): string[] {
        const tsvPattern = /"[^"]*"\t"[^"]*"/;
        return tsvPattern.test(str) ? splitTsv(str) : splitCsv(str);
    }

    function timeStringToDate(timeString: string): Date {
        try {
            if (!timeString) return null; // No string provided

            const date = new Date(timeString);

            if (date.getTime() > 0) return date; // 'ISO' or 'Friendly' format
            else { // 'Times-only' format
                if (!flags.value.includes('times-only')) flags.value.push('times-only');

                const now = new Date();
                if (now.getHours() < 6) now.setDate(now.getDate() - 1);

                const date = new Date(`${now.toDateString()} ${timeString}`);
                if (date.getHours() < 6) date.setDate(date.getDate() + 1);

                if (date.getTime() === 0) return null;

                return date;
            }
        } catch (error) {
            console.error("Error converting time string to date:", error);
            return null;
        }
    }

    function extractExtras(string: string): { extras: string[], title: string } {
        let transformedString = string
            .replace(/^\.+|\.+$/, '')
            .replace("Nederlandse versie", "NL")
            .replace("Originele versie", "OV")
            .replace(" IMX", " IMAX")
            .replace(" PAUZE", '')

        let extraString = transformedString
            .match(/(\s((4DX)|(ATMOS)|(IMAX)|(SCREENX)|(3D)|(ROOFTOP)|(Music)|(Pride)|(PrideNight)|(Ladies)|(Premiere)|(Bollywood)|(BESLOTEN)|(\([A-Z]+\))))+/)?.[0].slice(1) || '';

        return {
            extras: extraString.length > 0 ? extraString.split(' ') : [],
            title: transformedString.replace(extraString, '').trim()
        };
    }

    return { table, metadata, filesUploaded, status };
});
