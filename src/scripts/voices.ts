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
            "attention": [0, 551.4965986394558], "auditorium01": [551.4965986394558, 914.1950113378686], "auditorium02": [1465.6916099773243, 696.0997732426301], "auditorium03": [2161.7913832199542, 661.8820861678003], "auditorium04": [2823.6734693877547, 776.7573696145123], "auditorium05": [3600.430839002267, 901.1564625850336], "auditorium06": [4501.5873015873, 834.557823129252], "auditorium07": [5336.145124716552, 846.9387755102042], "auditorium08": [6183.083900226757, 817.9138321995465], "auditorium09": [7000.997732426304, 965.6689342403632], "auditorium10": [7966.666666666667, 798.9569160997725], "auditorium11": [8765.623582766439, 894.4444444444439], "auditorium12": [9660.068027210884, 1031.1791383219954], "auditorium13": [10691.247165532879, 846.0770975056686], "auditorium14": [11537.324263038547, 859.3197278911564], "auditorium15": [12396.643990929704, 987.6190476190469], "auditorium16": [13384.26303854875, 1019.5691609977331], "auditorium17": [14403.832199546483, 1123.5600907029486], "auditorium18": [15527.392290249432, 965.7142857142862], "auditorium19": [16493.106575963717, 1087.7551020408164], "auditorium20": [17580.861678004534, 1087.7097505668942], "credits": [18668.571428571428, 704.2403628117917], "doorsopen": [19372.81179138322, 698.2539682539688], "end": [20071.06575963719, 427.95918367346883], "endshow": [20499.02494331066, 949.5918367346939], "exit": [21448.61678004535, 799.4331065759645], "final": [22248.049886621317, 508.97959183673436], "inspection": [22757.02947845805, 759.7278911564622], "intermission": [23516.757369614512, 568.7301587301583], "mainshow": [24085.48752834467, 530.34013605442], "num01": [24615.82766439909, 296.73469387754994], "num02": [24912.562358276642, 421.5192743764185], "num03": [25334.08163265306, 338.7074829931969], "num04": [25672.789115646257, 428.6621315192747], "num05": [26101.451247165533, 425.918367346938], "num06": [26527.36961451247, 414.8526077097507], "num07": [26942.22222222222, 470.22675736961617], "num08": [27412.448979591838, 416.4172335600895], "num09": [27828.866213151927, 568.1179138322001], "num10": [28396.984126984127, 302.403628117915], "num11": [28699.38775510204, 458.7301587301589], "num12": [29158.1179138322, 582.5850340136043], "num13": [29740.702947845803, 598.5487528344677], "num14": [30339.251700680274, 621.0657596371867], "num15": [30960.31746031746, 644.6712018140595], "num16": [31604.988662131516, 650.6122448979568], "num17": [32255.600907029475, 802.7891156462558], "num18": [33058.39002267573, 713.4240362811823], "num19": [33771.814058956916, 740.000000000002], "num20": [34511.814058956916, 596.4625850340112], "num21": [35108.276643990925, 866.190476190475], "num22": [35974.4671201814, 989.4557823129232], "num23": [36963.92290249433, 923.5827664399068], "num24": [37887.50566893423, 967.5283446712015], "num25": [38855.03401360544, 1021.9274376417218], "num26": [39876.96145124715, 924.8752834467098], "num27": [40801.83673469386, 1021.9274376417218], "num28": [41823.764172335585, 881.6099773242598], "num29": [42705.374149659845, 1187.4376417233564], "num30": [43892.8117913832, 582.743764172335], "num31": [44475.55555555554, 878.1859410430854], "num32": [45353.741496598625, 981.5419501133817], "num33": [46335.283446712005, 925.6689342403632], "num34": [47260.95238095237, 1055.4875283446704], "num35": [48316.43990929704, 984.3083900226759], "num36": [49300.74829931971, 966.98412698413], "num37": [50267.732426303846, 1042.154195011335], "num38": [51309.88662131518, 1016.462585034013], "num39": [52326.349206349194, 1064.4897959183695], "num40": [53390.83900226756, 821.496598639456], "num41": [54212.33560090702, 850.7029478458037], "num42": [55063.03854875282, 1003.2879818594083], "num43": [56066.32653061223, 1064.9659863945544], "num44": [57131.29251700678, 987.9365079365101], "num45": [58119.22902494329, 1012.9931972789095], "num46": [59132.222222222204, 1065.3514739229024], "num47": [60197.573696145104, 1158.9569160997755], "num48": [61356.53061224488, 955.1473922902503], "num49": [62311.67800453513, 1094.4444444444414], "num50": [63406.12244897957, 718.9342403628132], "num51": [64125.05668934239, 914.6938775510165], "num52": [65039.7505668934, 1090.3401360544221], "num53": [66130.09070294783, 1122.7664399092987], "num54": [67252.85714285713, 1027.4376417233525], "num55": [68280.29478458047, 1048.61678004535], "num56": [69328.91156462583, 1080.3854875283464], "num57": [70409.29705215417, 1133.3333333333399], "num58": [71542.63038548752, 1059.2290249433063], "num59": [72601.85941043081, 1175.7142857142924], "plf4dx": [73777.57369614512, 780.6122448979522], "plfatmos": [74558.18594104306, 904.240362811791], "plfdolbycinema": [75462.42630385485, 724.8979591836786], "plfimax": [76187.32426303854, 616.4399092970569], "plfscreenx": [76803.76417233559, 739.6371882086186], "rooftop": [77543.40136054422, 689.6825396825363], "row": [78233.08390022675, 516.5759637188216], "seat": [78749.65986394556, 538.7301587301607], "show": [79288.39002267573, 621.3832199546516], "start": [79909.77324263038, 433.46938775509614], "startmainshow": [80343.24263038547, 1027.0975056689338], "startpreshow": [81370.34013605441, 1180.3854875283405], "theanything": [82550.72562358275, 807.0748299319774], "timehours": [83357.80045351473, 320.24943310658216], "timeminutes": [83678.04988662132, 486.98412698412596], "timeseconds": [84165.03401360543, 604.5578231292552]
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
        plfscreenx: 'ScreenX',
        theanything: 'TheAnyThing',
        timehours: "uur",
        timeminutes: "minuten",
        timeseconds: "seconden"
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
