export class Show {
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

    constructor(item: { playlist: string, feature: string, featureRating: string, auditorium: string, scheduledTime: Date, showTime: Date, featureTime: Date, creditsTime: Date, endTime: Date, duration: string }) {
        const { title, extras } = Show.extractExtras(item.playlist);
        this.title = title;
        this.playlist = item.playlist;
        this.feature = item.feature;
        this.featureRating = item.featureRating;
        this.extras = extras;
        this.auditorium = item.auditorium;
        this.auditoriumNumber = parseInt(item.auditorium.replace(/^\w+\s/, '').split(' ')[0]) || 0;
        this.scheduledTime = item.scheduledTime;
        this.showTime = item.showTime;
        this.mainShowTime = item.featureTime;
        this.creditsTime = item.creditsTime;
        this.endTime = item.endTime;
        this.duration = item.duration;
    }

    private static extractExtras(string: string): { extras: string[], title: string } {
        let extraString = string.match(/(\s((4DX)|(ATMOS)|(IMX)|(3D)|(Music)|(ROOFTOP)|(PrideNight)|(Ladies)|(Premiere)|(\([A-Z]+\))))+/)?.[0].slice(1) || '';
        return {
            extras: extraString.length > 0 ? extraString.split(' ') : [],
            title: string.replace(extraString, '').trim()
        };
    }
}

export class TimetableShow extends Show {
    overlapWithPlf?: boolean;
    hasPostCredits?: boolean;
    nextStartTime?: Date;
    timeToNextUsherout?: number;
    isNearPlf?: boolean;
    intermissionAfter?: boolean;
}

export enum AnnouncementTypes {
    Start = 'start',
    PlfStart = 'plfStart',
    MainShow = 'mainShow',
    Credits = 'credits',
    End = 'end',
    FinalMainShowStart = 'finalMainShowStart'
}

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