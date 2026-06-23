export function getAuditoriumToken(auditorium: string) {
    return auditorium.replace(/^\D+(?=\d)/, '').trim();
}

export function getDefaultTimetableAuditoriumName(auditorium: string) {
    return getAuditoriumToken(auditorium).split(/\s|-/)[0] || auditorium;
}

export function getDefaultScheduleAuditoriumName(auditorium: string) {
    return getAuditoriumToken(auditorium).split(/-/)[0] || auditorium;
}

export function getAuditoriumNumber(auditorium: string): number | null {
    const num = Number(getAuditoriumToken(auditorium).split(/\s|-/)[0]);
    return !isNaN(num) && num > 0 && num <= 20 ? num : null;
}

export function getDefaultAnnouncerSound(auditorium: string): string {
    const num = getAuditoriumNumber(auditorium);
    if (num) return `auditorium${String(num).padStart(2, '0')}`;

    const normalizedAuditorium = auditorium.toLowerCase();
    if (normalizedAuditorium.includes('rooftop')) return 'rooftop';
    if (normalizedAuditorium.includes('4dx')) return 'plf4dx';
    if (normalizedAuditorium.includes('atmos')) return 'plfatmos';
    if (normalizedAuditorium.includes('dolby')) return 'plfdolbycinema';
    if (normalizedAuditorium.includes('imax')) return 'plfimax';
    if (normalizedAuditorium.includes('scrnx')) return 'plfscreenx';

    return normalizedAuditorium;
}
