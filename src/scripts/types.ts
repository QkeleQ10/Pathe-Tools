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
    scheduled?: NodeJS.Timeout;
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

export type PatheApiShow = {
    slug: string;
    title: string;
    releaseAt: string[];
    posterPath: {
        lg: string;
        md: string;
    };
    backgroundPath: {
        lg: string;
        md: string;
        sm: string;
    };
    label: string | null;
    contentRating: {
        ref: string;
        description: string;
        extendedDescription: string;
    };
    cinechecks: {
        ref: string;
        description: string;
    }[];
    isMovie: boolean;
    isNew: boolean;
    isEventSpecial: boolean;
    isComingSoon: boolean;
    homeOrder: number;
    genericOrder: number;
    hubbleCasting: string;
    type: string;
    upcomingOrder: number;
    mostAwaitedOrder: number;
    duration: number;
    genres: string[];
    warning: string | null;
    directors: string[];
    flag: string | null;
    flagColor: string | null;
    next24ShowtimesCount: number;
    notComingSoon: boolean;
    salesOpeningDatetime: string | null;
    showtimesDisplayDatetime: string | null;
    backgroundDominantColor: string;
    labelFlagColor: string | null;
    originalReleaseAt: string | null;
    showRef: string;
    specialEvent: boolean;
}

export type PatheApiShowDetails = {
    slug: string;
    title: string;
    titleTracking: string;
    releaseAt: Record<string, string>;
    contentRating: {
        ref: string;
        description: string;
        extendedDescription: string;
    };
    cinechecks: {
        ref: string;
        description: string;
    }[];
    genres: string[];
    genresTracking: string[];
    duration: number;
    directors: string;
    actors: string;
    synopsis: string;
    entertainementLogo: string | null;
    entertainementSubtitle: string | null;
    distribution: string | null;
    entertainementCasting: string;
    posterPath: {
        lg: string;
        md: string;
    };
    backgroundPath: {
        lg: string;
        md: string;
        sm: string;
    };
    backgroundDominantColor: string;
    isMovie: boolean;
    trailers: {
        externalId: string;
        videoType: string;
        title: string;
        snapshot: string;
        isMain: boolean;
        language: string;
    }[];
    presentation: string | null;
    calendar: string | null;
    warning: string | null;
    nationality: string | null;
    nationalityTracking: string | null;
    originalTitle: string;
    feelings: {
        countWishList: number;
        countEmotionDisappointed: number;
        countEmotionLike: number;
        countEmotionLove: number;
    };
    similarShows: any[];
    event: any[];
    redirectSlug: string | null;
    refHubble: string;
    isNew: boolean;
    notComingSoon: boolean;
    visaHubble: string | null;
    copiesCount: number;
    next24ShowtimesCount: number;
    tags: string[];
    salesOpeningDatetime: string | null;
    showtimesDisplayDatetime: string | null;
    vodAvailability: boolean;
    vod: any | null;
    refVista: string;
    labelFlagColor: string | null;
    label: string | null;
    originalReleaseAt: string | null;
    extraInformation: string | null;
    logoTitle: string | null;
}

export interface DisplayLine {
    fcolor: 0x00 | 0x01 | 0x02 | 0x03;
    bcolor: 0x00 | 0x01 | 0x02 | 0x03;
    enabled: boolean;
    textString: string;
    align: 'left' | 'center' | 'right' | 'marquee' | 'marquee-reverse';
    speed: number;
}