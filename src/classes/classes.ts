export interface FileMetadata {
    name: string;
    type: string;
    size: number;
    lastModified: number;
    uploadedDate: number;
    flags?: string[];
};

export interface Show {
    index: number;
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

export interface AnnouncerShow extends Show {
    announcements: Announcement[];
}

export enum AnnouncementTypes {
    Start = 'start',
    Reception = 'reception',
    MainShow = 'mainShow',
    Credits = 'credits',
    End = 'end',
};

export interface Announcement {
    time: Date;
    type: AnnouncementTypes;
    sprites: string[];
    status: string;
    key?: string;
    show: Show;
}
