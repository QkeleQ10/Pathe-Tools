import {
    AnnouncementRule,
    AnnouncementSegment,
    ScheduledAnnouncementDefinition,
    Show,
    TheAnyThingBooking,
} from '@/scripts/types';

import { findAuditoriumSound } from '@/scripts/voices';

export function createTmsAnnouncementDefinitions(
    shows: Show[],
    rules: AnnouncementRule[],
    now: number,
    retainedOriginKeys: ReadonlySet<string>
): ScheduledAnnouncementDefinition[] {
    const announcements: ScheduledAnnouncementDefinition[] = [];
    const showOriginKeys = getShowOriginKeys(shows);

    for (const rule of rules) {
        if (!rule.enabled) continue;

        let ruleAnnouncements = shows
            .filter(show => showMatchesRule(show, rule))
            .map(show => {
                const triggerTime = show[rule.trigger.property];
                if (!triggerTime) return undefined;

                const originKey = JSON.stringify([
                    'show',
                    rule.id,
                    showOriginKeys.get(show),
                ]);
                const segments = rule.segments.map(segment => ({
                    ...segment,
                    spriteName: segment.spriteName.replace('auditorium#', findAuditoriumSound(show.auditorium)),
                }));

                return {
                    source: 'show' as const,
                    originKey,
                    time: new Date(triggerTime.getTime() - (rule.trigger.preponeMinutes || 0) * 60000 - 5000),
                    segments,
                    tmsShow: show,
                };
            })
            .filter((announcement): announcement is NonNullable<typeof announcement> => !!announcement)
            .sort((a, b) => a.time.getTime() - b.time.getTime());

        const activePastAnnouncements = ruleAnnouncements.filter(announcement =>
            announcement.time.getTime() <= now && retainedOriginKeys.has(announcement.originKey)
        );
        let upcomingAnnouncements = ruleAnnouncements.filter(announcement => announcement.time.getTime() > now);
        if (rule.filter.firstShowOnly) upcomingAnnouncements = upcomingAnnouncements.slice(0, 1);
        if (rule.filter.lastShowOnly) upcomingAnnouncements = upcomingAnnouncements.slice(-1);
        announcements.push(...activePastAnnouncements, ...upcomingAnnouncements);
    }

    return announcements.sort((a, b) => a.time.getTime() - b.time.getTime());
}

function getShowOriginKeys(shows: Show[]) {
    const orderedShows = shows
        .map((show, index) => ({ show, index }))
        .sort((a, b) => a.show.scheduledTime.getTime() - b.show.scheduledTime.getTime() || a.index - b.index);
    const occurrenceCounts = new Map<string, number>();
    const originKeys = new Map<Show, string>();

    for (const { show } of orderedShows) {
        const scheduledDate = show.scheduledTime;
        const showGroup = JSON.stringify([
            show.auditorium,
            show.playlist,
            scheduledDate.getFullYear(),
            scheduledDate.getMonth(),
            scheduledDate.getDate(),
        ]);
        const occurrence = occurrenceCounts.get(showGroup) ?? 0;
        occurrenceCounts.set(showGroup, occurrence + 1);
        originKeys.set(show, JSON.stringify([showGroup, occurrence]));
    }

    return originKeys;
}

export function createTheAnyThingAnnouncementDefinition(
    booking: TheAnyThingBooking,
    nextBookingMode: 'none' | 'time' | 'duration'
): ScheduledAnnouncementDefinition {
    const segments = [
        { spriteName: 'endshow', offset: 0 },
        { spriteName: 'theanything', offset: 0 },
        { spriteName: `num${String(booking.roomNumber).padStart(2, '0')}`, offset: 400 },
    ];

    if (booking.nextBookingStartTime) {
        const timeUntilNextBooking = Math.max(0, booking.nextBookingStartTime.getTime() - booking.estimatedEndTime.getTime());
        const nextBookingIsToday = timeUntilNextBooking < 8 * 60 * 60 * 1000;

        switch (nextBookingMode) {
            case 'duration':
                segments.push(...(nextBookingIsToday
                    ? [{ spriteName: 'nextbookingin', offset: 0 }, ...durationToSegments(timeUntilNextBooking)]
                    : [{ spriteName: 'lastoftoday', offset: 0 }]));
                break;
            case 'time':
                segments.push(...(nextBookingIsToday
                    ? [{ spriteName: 'nextbookingat', offset: 0 }, ...timeToSegments(booking.nextBookingStartTime)]
                    : [{ spriteName: 'lastoftoday', offset: 0 }]));
                break;
        }
    }

    return {
        source: 'theanything',
        originKey: JSON.stringify(['theanything', booking.bookingId]),
        time: new Date(booking.estimatedEndTime),
        segments,
        theAnyThingBooking: booking,
    };
}

function showMatchesRule(show: Show, rule: AnnouncementRule) {
    const triggerTime = show[rule.trigger.property];
    if (!triggerTime || !triggerTime.getTime()) return false;
    if (rule.filter.plfOnly && !show.auditorium.includes('4DX')) return false;
    if (rule.filter.playlistTitleIncludes && !show.title.toLowerCase().includes(rule.filter.playlistTitleIncludes.toLowerCase())) return false;
    if (rule.filter.playlistTitleExcludes && show.title.toLowerCase().includes(rule.filter.playlistTitleExcludes.toLowerCase())) return false;
    return true;
}

function durationToSegments(durationMs: number): AnnouncementSegment[] {
    const segments: AnnouncementSegment[] = [];
    const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const addUnit = (value: number, unit: 'hours' | 'minutes') => {
        if (value <= 0) return;
        segments.push(
            { spriteName: `num${String(value).padStart(2, '0')}`, offset: 0 },
            { spriteName: `time${unit}`, offset: 0 },
        );
    };

    addUnit(hours, 'hours');
    if (hours < 3) addUnit(minutes, 'minutes');

    const timeUnitIndices = segments
        .map((segment, index) => segment.spriteName.startsWith('time') ? index : -1)
        .filter(index => index !== -1);
    const secondToLastTimeUnitIndex = timeUnitIndices.at(-2);
    if (secondToLastTimeUnitIndex !== undefined) {
        if (segments[secondToLastTimeUnitIndex].spriteName === 'timehours') {
            segments[secondToLastTimeUnitIndex].spriteName += 'alt';
        }
        segments.splice(secondToLastTimeUnitIndex + 1, 0, { spriteName: 'and', offset: 0 });
    }

    return segments;
}

function timeToSegments(time: Date): AnnouncementSegment[] {
    const hours = time.getHours() || 12;
    const minutes = time.getMinutes();
    const segments: AnnouncementSegment[] = [{ spriteName: `num${String(hours).padStart(2, '0')}`, offset: 0 }];

    if (minutes > 0) {
        segments.push(
            { spriteName: 'timehoursalt', offset: 0 },
            { spriteName: `num${String(minutes).padStart(2, '0')}`, offset: 0 },
        );
    } else {
        segments.push({ spriteName: 'timehours', offset: 0 });
    }

    return segments;
}
