export type FileMetadata = {
    name: string;
    type: string;
    size: number;
    lastModified: number;
    uploadedDate: number;
    flags?: string[];
};

export type Show = {
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

export type TimetableShow = Show & {
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

export type Announcement = {
    time: Date;
    show: Show;
    segments: { spriteName: string; offset: number }[];
    audio: HTMLAudioElement | null;
};

export type AnnouncementRule = {
    id: string;
    name?: string;
    enabled: boolean;
    segments: { spriteName: string; offset: number }[];
    trigger: {
        property: "scheduledTime" | "showTime" | "mainShowTime" | "creditsTime" | "endTime";
        preponeMinutes: number;
    };
    filter: {
        plfOnly: boolean;
        lastShowOnly: boolean;
        firstShowOnly: boolean;
        playlistTitleIncludes: string;
        playlistTitleExcludes: string;
    };
};