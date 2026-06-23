import { reactive } from 'vue';
import { useStorage } from '@vueuse/core';
import chimes from '@assets/sounds/chimes.ogg';
import voiceQuinten from '@assets/sounds/voices/quinten.ogg';
import { getDefaultAnnouncerSound } from './auditoriums';

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
const importedVoicesStore = useStorage<StoredImportedVoice[]>(importedVoicesStorageKey, []);

const auditoriumMappings = useStorage<Record<string, string>>('announcer-auditorium-mappings', {});

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
            "chime01": [0, 3317.4149659863947], "chime02": [3417.4149659863947, 2385.6462585034014], "chime03": [5903.061224489796, 3356.2358276644], "chime04": [9359.297052154196, 2104.172335600907]
        }
    }),
    quinten: new Voice({
        name: 'Quinten',
        language: 'nl',
        gender: 'M',
        file: voiceQuinten,
        sprite: {
            "almost": [0, 484.80725623582765], "attention": [584.8072562358276, 602.7437641723355], "auditorium01": [1287.5510204081634, 743.7414965986395], "auditorium02": [2131.292517006803, 756.575963718821], "auditorium03": [2987.868480725624, 732.0861678004537], "auditorium04": [3819.954648526078, 725.6235827664397], "auditorium05": [4645.578231292518, 846.485260770975], "auditorium06": [5592.063492063492, 790.9297052154196], "auditorium07": [6482.993197278911, 939.3877551020404], "auditorium08": [7522.380952380951, 841.7006802721083], "auditorium09": [8464.081632653058, 1026.1904761904752], "auditorium10": [9590.272108843534, 711.0204081632645], "auditorium11": [10401.292517006797, 863.2653061224485], "auditorium12": [11364.557823129246, 1008.8208616780037], "auditorium13": [12473.378684807249, 869.6371882086175], "auditorium14": [13443.015873015867, 961.0430839002273], "auditorium15": [14504.058956916093, 1017.5283446712023], "auditorium16": [15621.587301587295, 1057.6643990929692], "auditorium17": [16779.251700680266, 1032.1315192743762], "auditorium18": [17911.383219954645, 958.7074829931978], "auditorium19": [18970.090702947844, 1050.8616780045336], "auditorium20": [20120.952380952378, 1045.6462585033996], "credits": [21266.59863945578, 704.2403628117917], "doorsopen": [22070.839002267574, 603.5147392290235], "end": [22774.353741496598, 389.2970521541947], "endshow": [23263.65079365079, 1004.1723356009059], "event": [24367.8231292517, 655.487528344672], "exit": [25123.310657596372, 799.4331065759645], "final": [26022.74376417234, 511.9501133786848], "finalshow": [26634.693877551024, 1056.1904761904764], "intermission": [27790.884353741505, 568.7301587301583], "mainshow": [28459.614512471664, 530.3401360544235], "plf4dx": [29089.954648526087, 780.6122448979593], "plfatmos": [29970.56689342405, 904.240362811791], "plfdolbycinema": [30974.807256235843, 724.8979591836751], "plfimax": [31799.70521541952, 616.4399092970534], "plfscreenx": [32516.14512471657, 739.6371882086186], "rooftop": [33355.78231292519, 689.6825396825363], "show": [34145.46485260773, 582.358276643994], "start": [34827.82312925172, 433.46938775510324], "startmainshow": [35361.292517006834, 1155.2607709750546], "startpreshow": [36616.553287981886, 1171.224489795918]
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

const decodedVoiceCache = new Map<string, Promise<AudioBuffer>>();
let previewAudioContext: AudioContext | null = null;
let activePreviewSource: AudioBufferSourceNode | null = null;

async function getDecodedVoiceBuffer(voice: Voice): Promise<AudioBuffer> {
    const key = String(voice.file);
    if (!decodedVoiceCache.has(key)) {
        const request = getVoiceFileBytes(voice)
            .then(async bytes => {
                if (!previewAudioContext) previewAudioContext = new AudioContext();
                if (previewAudioContext.state === 'suspended') await previewAudioContext.resume();
                const data = bytes.slice().buffer;
                return previewAudioContext.decodeAudioData(data);
            })
            .catch(error => {
                decodedVoiceCache.delete(key);
                throw error;
            });
        decodedVoiceCache.set(key, request);
    }
    return decodedVoiceCache.get(key)!;
}

export async function previewSpriteSound(spriteName: string, preferredVoices: Voice[] = []) {
    const allVoicesWithSprite = Object.values(voices).filter(candidate => !!candidate.sprite[spriteName]);
    if (!allVoicesWithSprite.length) {
        throw new Error(`Kon geluidsfragment niet vinden: "${spriteName}"`);
    }
    const preferredVoicesWithSprite = preferredVoices.filter(candidate => !!candidate.sprite[spriteName]);
    const candidates = preferredVoicesWithSprite.length ? preferredVoicesWithSprite : [allVoicesWithSprite[0]];
    const voice = candidates[Math.floor(Math.random() * candidates.length)];
    const [spriteOffsetMs, spriteDurationMs] = voice.sprite[spriteName] || [0, 0];

    if (!previewAudioContext) previewAudioContext = new AudioContext();
    if (previewAudioContext.state === 'suspended') await previewAudioContext.resume();

    const buffer = await getDecodedVoiceBuffer(voice);
    activePreviewSource?.stop();
    activePreviewSource?.disconnect();

    const source = previewAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(previewAudioContext.destination);
    source.start(0, spriteOffsetMs / 1000, spriteDurationMs / 1000);
    source.onended = () => {
        source.disconnect();
        if (activePreviewSource === source) activePreviewSource = null;
    };

    activePreviewSource = source;
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

export function getSoundName(string: string): string {
    const soundNames = {
        'auditorium#': '<naam zaal>',
        'chime00': "stil",
        almost: "bijna",
        attention: "let op",
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

    if (soundNames[string])
        return soundNames[string];

    let auditoriumMatch = string.match(/^(auditorium)([0-9]+|(#))$/);
    if (auditoriumMatch)
        return `zaal ${auditoriumMatch[2] == '#' ? '#' : Number(auditoriumMatch[2])}`;

    let chimeMatch = string.match(/^(chime)([0-9]+|(#))$/);
    if (chimeMatch)
        return `geluid ${chimeMatch[2] == '#' ? '#' : Number(chimeMatch[2])}`;

    return string;
}

export function findAuditoriumSound(auditorium: string): string {
    if (auditoriumMappings.value?.[auditorium])
        return auditoriumMappings.value[auditorium];

    return getDefaultAnnouncerSound(auditorium);
}
