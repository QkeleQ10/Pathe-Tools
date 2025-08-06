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
    mainShowTime?: Date;
    intermissionTime?: Date;
    creditsTime: Date;
    endTime: Date;
    duration: string;
};

export type TimetableShow = Show & {
    overlapWithPlf?: boolean;
    hasCreditsStinger?: boolean;
    nextStartTime?: Date;
    timeToNextUsherout?: number;
    isNearPlf?: boolean;
    intermissionAfter?: boolean;
};

export type Announcement = {
    time: Date;
    segments: { spriteName: string; offset: number }[];
    audio: HTMLAudioElement | null;
    show?: Show;
    scheduled?: boolean;
};

export type AnnouncementRule = {
    id: string;
    name?: string;
    enabled: boolean;
    segments: { spriteName: string; offset: number }[];
    trigger: {
        property: "scheduledTime" | "showTime" | "mainShowTime" | "intermissionTime" | "creditsTime" | "endTime";
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