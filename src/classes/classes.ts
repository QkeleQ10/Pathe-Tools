export interface FileMetadata {
    name: string;
    type: string;
    size: number;
    lastModified: number;
    uploadedDate: number;
    flags?: string[];
};

export interface Show {
    title: string;
    playlist: string;
    feature: string;
    featureRating: string;
    extras: string[];
    auditorium: string;
    auditoriumNumber: number;
    scheduledTime: Date;
    showTime: Date;
    mainShowTime: Date;
    creditsTime: Date;
    endTime: Date;
    duration: string;
};

export interface TimetableShow extends Show {
    overlapWithPlf?: boolean;
    hasPostCredits?: boolean;
    nextStartTime?: Date;
    timeToNextUsherout?: number;
    isNearPlf?: boolean;
    intermissionAfter?: boolean;
};

export enum AnnouncementTypes {
    Start = 'start',
    PlfStart = 'plfStart',
    MainShow = 'mainShow',
    Credits = 'credits',
    End = 'end',
    FinalMainShowStart = 'finalMainShowStart',
    Minecraft = 'minecraft',
};

export class Announcement {
    time: Date;
    type: AnnouncementTypes;
    announcement: string[];
    status: string;
    key?: string;
    show: Show;

    constructor(item: { time: Date, type: AnnouncementTypes, announcement: string[], status: string, scheduleItem: Show, key?: string }) {
        this.time = item.time;
        this.type = item.type;
        this.announcement = item.announcement;
        this.status = item.status;
        this.show = item.scheduleItem;
        this.key = item.key;
    }
}