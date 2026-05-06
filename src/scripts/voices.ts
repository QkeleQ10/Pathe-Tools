import { reactive } from 'vue';
import { useStorage, useLocalStorage } from '@vueuse/core';
import chimes from '@assets/sounds/chimes.ogg';
import voiceQuinten from '@assets/sounds/voices/quinten.ogg';

interface SpriteMap {
    [key: string]: [number, number];
}

interface VoiceData {
    name?: string;
    language?: string;
    gender?: 'M' | 'F';
    characteristics?: string;
    file: string;
    sprite: SpriteMap;
}

interface StoredImportedVoice extends VoiceData {
    id: string;
    sourceUrl: string;
}

const importedVoicesStorageKey = 'imported-voices';
const importedVoicesStore = useStorage<StoredImportedVoice[]>(importedVoicesStorageKey, [], localStorage, { mergeDefaults: true });

const auditoriumMappings = useLocalStorage<{ [key: string]: string }>('announcer-auditorium-mappings', {}, { mergeDefaults: true }); // mapping from auditorium names to sound sprite names, e.g. "PULR 1" => "auditorium1"

export class Voice {
    name?: string;
    language?: string;
    gender?: 'M' | 'F';
    characteristics?: string;
    file: string;
    sprite: SpriteMap;
    constructor(voice: VoiceData) {
        this.name = voice.name;
        this.language = voice.language;
        this.gender = voice.gender;
        this.characteristics = voice.characteristics;
        this.file = voice.file;
        this.sprite = voice.sprite;
    }

    get sounds() {
        return Object.keys(this.sprite);
    }

    get additionalSounds() {
        return this.sounds.filter(sound => !defaultVoice.sounds.includes(sound));
    }
}

export const voices = reactive<Record<string, Voice>>({
    chimes: new Voice({
        file: chimes,
        sprite: {
            "chime0": [
                3456.235827664399,
                3317.4149659863947
            ],
            "chime1": [
                0,
                3356.235827664399
            ],
        }
    }),
    quinten: new Voice({
        name: 'Quinten',
        language: 'nl',
        gender: 'M',
        file: voiceQuinten,
        sprite: {
            "almost": [0, 484.80725623582765], "attention": [584.8072562358276, 602.7437641723355], "auditorium01": [1287.5510204081634, 743.7414965986395], "auditorium02": [2131.292517006803, 756.575963718821], "auditorium03": [2987.868480725624, 732.0861678004537], "auditorium04": [3819.954648526078, 725.6235827664397], "auditorium05": [4645.578231292518, 846.485260770975], "auditorium06": [5592.063492063492, 790.9297052154196], "auditorium07": [6482.993197278911, 939.3877551020404], "auditorium08": [7522.380952380951, 841.7006802721083], "auditorium09": [8464.081632653058, 1026.1904761904752], "auditorium10": [9590.272108843534, 711.0204081632645], "auditorium11": [10401.292517006797, 863.2653061224485], "auditorium12": [11364.557823129246, 1008.8208616780037], "auditorium13": [12473.378684807249, 869.6371882086175], "auditorium14": [13443.015873015867, 961.0430839002273], "auditorium15": [14504.058956916093, 1017.5283446712023], "auditorium16": [15621.587301587295, 1057.6643990929692], "auditorium17": [16779.251700680266, 1032.1315192743762], "auditorium18": [17911.383219954645, 958.7074829931978], "auditorium19": [18970.090702947844, 1050.8616780045336], "auditorium20": [20120.952380952378, 1045.6462585033996], "credits": [21266.59863945578, 704.2403628117917], "doorsopen": [22070.839002267574, 603.5147392290235], "end": [22774.353741496598, 391.7687074829921], "endshow": [23266.12244897959, 1004.1723356009059], "event": [24370.2947845805, 655.487528344672], "exit": [25125.78231292517, 799.4331065759645], "final": [26025.21541950114, 450.4081632653048], "finalshow": [26575.623582766442, 1056.1904761904764], "intermission": [27731.81405895692, 568.7301587301583], "mainshow": [28400.544217687082, 650.6802721088434], "plf4dx": [29151.224489795924, 780.6122448979593], "plfatmos": [30031.836734693887, 904.240362811791], "plfdolbycinema": [31036.07709750568, 724.8979591836751], "plfimax": [31860.975056689356, 616.4399092970498], "plfscreenx": [32577.414965986405, 739.6371882086186], "rooftop": [33417.05215419503, 689.6825396825363], "show": [34206.734693877566, 720.7029478458082], "start": [35027.43764172337, 507.61904761904475], "startmainshow": [35635.05668934242, 1155.2607709750546], "startpreshow": [36890.31746031748, 1171.224489795918]
        }
    })
});

export const defaultVoiceKey = 'quinten';
export const defaultVoice = voices[defaultVoiceKey];

export const importedVoicesMetadata = reactive<Record<string, StoredImportedVoice>>({});

function normalizeRemoteUrl(url: string) {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return url;
    }
    if (parsed.hostname !== 'github.com') return parsed.toString();

    const [owner, repo, mode, ...rest] = parsed.pathname.replace(/^\/+/, '').split('/');
    if (!owner || !repo || !mode || rest.length < 1) return parsed.toString();
    if (mode !== 'raw' && mode !== 'blob') return parsed.toString();

    const rawPath = `${owner}/${repo}/${rest.join('/')}`;
    return `https://raw.githubusercontent.com/${rawPath}`;
}

function getUrlCandidates(url: string) {
    const normalized = normalizeRemoteUrl(url);
    return [...new Set([url, normalized])];
}

async function fetchFromCandidates(url: string) {
    const attempts: string[] = [];
    for (const candidate of getUrlCandidates(url)) {
        try {
            const response = await fetch(candidate);
            if (!response.ok) {
                attempts.push(`${candidate} (${response.status})`);
                continue;
            }
            return { response, url: candidate };
        } catch {
            attempts.push(`${candidate} (network error)`);
        }
    }
    throw new Error(`Kon URL niet laden. Geprobeerd: ${attempts.join(', ')}`);
}

function isSpriteMap(value: unknown): value is SpriteMap {
    if (!value || typeof value !== 'object') return false;
    return Object.values(value).every(
        chunk => Array.isArray(chunk) && chunk.length === 2 && chunk.every(n => typeof n === 'number')
    );
}

function normalizeVoiceId(id: string) {
    return id.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function createVoiceId(name: string) {
    let baseId = normalizeVoiceId(name) || 'voice';
    if (baseId === defaultVoiceKey || baseId === 'chimes') baseId = `${baseId}-custom`;
    let uniqueId = baseId;
    let suffix = 2;
    while (voices[uniqueId]) {
        uniqueId = `${baseId}-${suffix++}`;
    }
    return uniqueId;
}

function buildImportedVoice(data: Omit<StoredImportedVoice, 'id' | 'sourceUrl'>, sourceUrl: string): StoredImportedVoice {
    const id = createVoiceId(data.name || 'voice');
    return {
        id,
        sourceUrl,
        ...data
    };
}

function readVoiceData(json: unknown, sourceUrl: string): Omit<StoredImportedVoice, 'id' | 'sourceUrl'> {
    if (!json || typeof json !== 'object') {
        throw new Error('Voice metadata is ongeldig.');
    }
    const parsed = json as Partial<VoiceData>;
    if (!parsed.file || typeof parsed.file !== 'string') {
        throw new Error('Voice metadata bevat geen geldig "file"-veld.');
    }
    if (!isSpriteMap(parsed.sprite)) {
        throw new Error('Voice metadata bevat geen geldige "sprite"-map.');
    }
    const resolvedFile = normalizeRemoteUrl(new URL(parsed.file, sourceUrl).toString());
    return {
        name: parsed.name,
        language: parsed.language,
        gender: parsed.gender,
        characteristics: parsed.characteristics,
        file: resolvedFile,
        sprite: parsed.sprite
    };
}

function hydrateImportedVoices() {
    const storedVoices = importedVoicesStore.value;
    const validVoices: StoredImportedVoice[] = [];
    for (const item of storedVoices) {
        if (!item?.id || !item.file || !isSpriteMap(item.sprite)) continue;
        const normalizedItem = {
            ...item,
            file: normalizeRemoteUrl(item.file),
            sourceUrl: normalizeRemoteUrl(item.sourceUrl)
        };
        voices[normalizedItem.id] = new Voice(normalizedItem);
        importedVoicesMetadata[normalizedItem.id] = normalizedItem;
        validVoices.push(normalizedItem);
    }
    importedVoicesStore.value = validVoices;
}
hydrateImportedVoices();

const voiceFileCache = new Map<string, Promise<Uint8Array>>();
export async function getVoiceFileBytes(voice: Voice): Promise<Uint8Array> {
    const key = String(voice.file);
    if (!voiceFileCache.has(key)) {
        const request = fetchFromCandidates(voice.file)
            .then(async ({ response }) => new Uint8Array(await response.arrayBuffer()))
            .catch(error => {
                voiceFileCache.delete(key);
                throw error;
            });
        voiceFileCache.set(key, request);
    }
    return voiceFileCache.get(key)!;
}

export async function preloadVoiceAudio(voice: Voice) {
    await getVoiceFileBytes(voice);
}

export async function addImportedVoiceFromUrl(url: string): Promise<string> {
    const sourceUrl = normalizeRemoteUrl(url.trim());
    if (!sourceUrl) throw new Error('Voer een URL in.');
    const { response, url: loadedFrom } = await fetchFromCandidates(sourceUrl);
    const json = await response.json();
    const voiceData = readVoiceData(json, loadedFrom);
    const voice = buildImportedVoice(voiceData, loadedFrom);

    voices[voice.id] = new Voice(voice);
    importedVoicesMetadata[voice.id] = voice;
    importedVoicesStore.value = [...Object.values(importedVoicesMetadata)];
    return voice.id;
}

export function removeImportedVoice(voiceId: string) {
    if (voiceId === defaultVoiceKey || voiceId === 'chimes') return;
    if (!importedVoicesMetadata[voiceId]) return;
    delete voices[voiceId];
    delete importedVoicesMetadata[voiceId];
    importedVoicesStore.value = [...Object.values(importedVoicesMetadata)];
}

export function getSelectableVoiceEntries() {
    return Object.entries(voices)
        .filter(([id, voice]) => id !== 'chimes' && !!voice.name)
        .map(([id, voice]) => ({ id, voice, metadata: importedVoicesMetadata[id] }));
}

export function getSoundInfo(string: string) {
    const soundNames = {
        almost: "bijna",
        attention: "let op",
        chime0: "♪",
        chime1: "♪",
        credits: "aftiteling",
        doorsopen: "inloop",
        end: "einde",
        endshow: "einde voorstelling",
        event: "evenement",
        exit: 'uitloop',
        final: "laatste",
        finalshow: "laatste voorstelling",
        intermission: "pauze",
        mainshow: "hoofdfilm",
        show: "voorstelling",
        start: "start",
        startmainshow: "start hoofdfilm",
        startpreshow: "start voorprogramma",
        plf4dx: '4DX',
        plfimax: 'IMAX',
        plfatmos: 'Dolby Atmos',
        plfdolbycinema: 'Dolby Cinema',
        plfscreenx: 'ScreenX'
    };

    string = string.toLowerCase().trim();
    let id = string.replace(/\?+/g, '');

    let name = soundNames[id] || id,
        valid = Object.values(voices).some(voice => voice.sounds.includes(id)),
        probability = 1 / Math.pow(2, (string.match(/\?+/g) || [''])[0].length);

    if (string.includes('|')) {
        name = string.split('|').map(str => getSoundInfo(str).name).join('|');
        valid = name.split('|').every(name => name !== id);
        probability = 1;
    }

    let auditoriumMatch = id.match(/^(auditorium)([0-9]+|(#))$/);
    if (auditoriumMatch) {
        name = `zaal ${auditoriumMatch[2] == '#' ? '#' : Number(auditoriumMatch[2])}`;
        valid = true;
    }

    return { id, name, valid, probability };
}

export function findAuditoriumSound(auditorium: string): string {
    if (auditoriumMappings.value[auditorium])
        return auditoriumMappings.value[auditorium];

    const num = parseInt(auditorium?.replace(/^\w+\s/, '')?.split(' ')[0]);
    if (!isNaN(num) && num > 0 && num <= 20)
        return `auditorium${String(num).padStart(2, '0')}`;

    if (auditorium === 'IMAX') return 'auditorium01';
    if (auditorium === 'Amersfoort SCRNX') return 'auditorium08';

    return auditorium.toLowerCase();
}
