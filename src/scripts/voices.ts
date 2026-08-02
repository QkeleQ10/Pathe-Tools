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
            "attention": [0, 774.3537414965987], "auditorium01": [774.3537414965987, 914.1950113378686], "auditorium02": [1688.5487528344672, 696.0997732426306], "auditorium03": [2384.648526077098, 661.8820861678003], "auditorium04": [3046.5306122448983, 776.7573696145123], "auditorium05": [3823.28798185941, 901.1564625850336], "auditorium06": [4724.444444444444, 834.557823129252], "auditorium07": [5559.002267573696, 846.9387755102042], "auditorium08": [6405.941043083901, 817.9138321995465], "auditorium09": [7223.854875283447, 965.6689342403624], "auditorium10": [8189.523809523809, 798.9569160997725], "auditorium11": [8988.480725623582, 894.4444444444439], "auditorium12": [9882.925170068025, 1031.1791383219954], "auditorium13": [10914.10430839002, 846.0770975056686], "auditorium14": [11760.18140589569, 859.3197278911564], "auditorium15": [12619.501133786845, 987.6190476190469], "auditorium16": [13607.120181405893, 1019.5691609977331], "auditorium17": [14626.689342403626, 1123.5600907029486], "auditorium18": [15750.249433106575, 965.7142857142844], "auditorium19": [16715.963718820858, 1087.7551020408164], "auditorium20": [17803.718820861675, 1087.7097505668942], "credits": [18891.42857142857, 704.2403628117917], "doorsopen": [19595.668934240362, 698.2539682539688], "end": [20293.92290249433, 389.2970521541947], "endshow": [20683.219954648524, 981.0884353741507], "exit": [21664.308390022674, 799.4331065759645], "final": [22463.74149659864, 511.9501133786848], "inspection": [22975.691609977326, 759.7278911564622], "intermission": [23735.419501133787, 568.7301587301583], "mainshow": [24304.149659863946, 530.34013605442], "num01": [24834.489795918365, 499.3197278911552], "num02": [25333.80952380952, 429.2743764172329], "num03": [25763.083900226753, 503.83219954648695], "num04": [26266.91609977324, 553.1746031746038], "num05": [26820.090702947844, 581.5192743764186], "num06": [27401.609977324264, 460.74829931972874], "num07": [27862.35827664399, 572.5850340136062], "num08": [28434.943310657596, 405.32879818594125], "num09": [28840.27210884354, 532.9705215419516], "num10": [29373.24263038549, 390.09070294784465], "num11": [29763.333333333336, 498.5487528344663], "num12": [30261.882086167803, 582.5850340136043], "num13": [30844.467120181405, 598.5487528344677], "num14": [31443.015873015873, 621.0657596371902], "num15": [32064.081632653066, 644.6712018140558], "num16": [32708.75283446712, 650.6122448979568], "num17": [33359.365079365074, 802.7891156462558], "num18": [34162.15419501133, 713.4240362811823], "num19": [34875.578231292515, 740.000000000002], "num20": [35615.578231292515, 596.4625850340112], "num21": [36212.04081632653, 866.190476190475], "num22": [37078.231292517004, 989.4557823129232], "num23": [38067.687074829926, 923.5827664399068], "num24": [38991.26984126983, 967.5283446712015], "num25": [39958.798185941036, 1021.9274376417218], "num26": [40980.72562358276, 924.8752834467098], "num27": [41905.60090702947, 1021.9274376417218], "num28": [42927.52834467119, 881.6099773242598], "num29": [43809.13832199545, 1187.4376417233564], "num30": [44996.5759637188, 582.743764172335], "num31": [45579.31972789114, 878.1859410430854], "num32": [46457.505668934224, 981.5419501133817], "num33": [47439.047619047604, 925.6689342403632], "num34": [48364.716553287966, 1055.4875283446704], "num35": [49420.20408163264, 984.3083900226759], "num36": [50404.51247165532, 966.98412698413], "num37": [51371.496598639445, 1042.154195011335], "num38": [52413.650793650784, 1016.462585034013], "num39": [53430.11337868479, 1064.4897959183695], "num40": [54494.603174603166, 821.496598639456], "num41": [55316.09977324262, 850.7029478458037], "num42": [56166.802721088425, 1003.2879818594083], "num43": [57170.09070294783, 1064.9659863945544], "num44": [58235.05668934239, 987.9365079365101], "num45": [59222.9931972789, 1012.9931972789095], "num46": [60235.9863945578, 1065.3514739229024], "num47": [61301.33786848071, 1158.9569160997755], "num48": [62460.29478458048, 955.1473922902503], "num49": [63415.44217687073, 1319.3650793650775], "num50": [64734.807256235814, 718.9342403628132], "plf4dx": [65453.741496598625, 780.6122448979522], "plfatmos": [66234.35374149658, 904.240362811791], "plfdolbycinema": [67138.59410430837, 724.8979591836786], "plfimax": [67863.49206349204, 616.4399092970569], "plfscreenx": [68479.9319727891, 739.6371882086186], "rooftop": [69219.56916099772, 689.6825396825363], "row": [69909.25170068025, 516.5759637188216], "seat": [70425.82766439908, 538.7301587301607], "show": [70964.55782312925, 582.358276643987], "start": [71546.91609977323, 433.46938775509614], "startmainshow": [71980.38548752833, 1027.0975056689338], "startpreshow": [73007.48299319726, 1180.3854875283405]
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
    const soundNames: { [key: string]: string } = {
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
        inspection: "controle",
        intermission: "pauze",
        mainshow: "hoofdfilm",
        row: "rij",
        seat: "stoel",
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

    let numMatch = string.match(/^(num)([0-9]+|(#))$/);
    if (numMatch)
        return `${numMatch[2] == '#' ? '#' : Number(numMatch[2])}`;

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
