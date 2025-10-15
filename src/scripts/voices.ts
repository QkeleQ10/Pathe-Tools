import chimes from '@assets/sounds/chimes.ogg';
import voiceDefault from '@assets/sounds/voices/rosetta.ogg';
import voiceGerwim from '@assets/sounds/voices/gerwim.ogg';
import voiceJaron from '@assets/sounds/voices/jaron.ogg';
import voiceDanique from '@assets/sounds/voices/danique.ogg';
import voiceQuinten from '@assets/sounds/voices/quinten.ogg';

interface SpriteMap {
    [key: string]: [number, number];
}

export class Voice {
    name?: string;
    language?: string;
    gender?: 'M' | 'F';
    characteristics?: string;
    file: any;
    sprite: SpriteMap;
    constructor(voice: { name?: string; language?: string; gender?: 'M' | 'F'; characteristics?: string; file: any; sprite: SpriteMap; }) {
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

export const voices = {
    chimes: new Voice({
        file: chimes,
        sprite: {
            "chime0": [0, 3300]
        }
    }),
    default: new Voice({
        name: "Rosetta",
        language: "nl",
        gender: "F",
        file: voiceDefault,
        sprite: {
            "auditorium01": [0, 937.0294784580499], "auditorium02": [1200, 982.9931972789117], "auditorium03": [2400, 863.6281179138323], "auditorium04": [3600, 1022.8571428571427], "auditorium05": [5800, 1023.1065759637188], "auditorium06": [8000, 1016.2585034013603], "auditorium07": [10200, 1187.2335600907036], "auditorium08": [12400, 1109.2290249433106], "auditorium09": [14600, 1185.2154195011337], "auditorium10": [16800, 959.9773242630398], "auditorium11": [18000.000000000004, 1122.6077097505681], "auditorium12": [20200.000000000004, 1185.8049886621309], "auditorium13": [22400.000000000004, 1159.6825396825388], "auditorium14": [24600, 1169.5918367346926], "auditorium15": [26800, 1240.1360544217682], "auditorium16": [29000, 1161.0884353741503], "auditorium17": [31200, 1213.2426303854907], "auditorium18": [33400.00000000001, 1123.990929705215], "auditorium19": [35600.00000000001, 1342.7664399092976], "auditorium20": [37800.000000000015, 1263.8321995464848], "credits": [44200.000000000015, 924.7165532879791], "end": [45400.000000000015, 1289.478458049885], "mainshow": [47600.00000000001, 1445.963718820863], "preshow": [49800.000000000015, 1364.3990929705226], "start": [52000.000000000015, 686.9841269841288]
        }
    }),
    quinten: new Voice({
        name: "Quinten",
        language: "nl",
        gender: "M",
        file: voiceQuinten,
        sprite: {
            "imax": [0, 720.1587301587301],
            "auditorium01": [1200, 743.7414965986393], "auditorium02": [2400, 756.575963718821], "auditorium03": [3600, 732.0861678004537], "auditorium04": [4800.000000000001, 725.6235827664401], "auditorium05": [6000.000000000001, 846.485260770975], "auditorium06": [7200.000000000001, 790.9297052154196], "auditorium07": [8400, 939.3877551020413], "auditorium08": [9600.000000000002, 841.7006802721083], "auditorium09": [10800, 1026.1904761904752], "auditorium10": [13000, 711.0204081632645], "auditorium11": [14200, 863.2653061224485], "auditorium12": [15399.999999999998, 1008.8208616780037], "auditorium13": [17599.999999999996, 869.6371882086175], "auditorium14": [18799.999999999996, 961.0430839002255], "auditorium15": [19999.999999999996, 1017.5283446712023], "auditorium16": [22199.999999999996, 1057.664399092971], "auditorium17": [24399.999999999996, 1032.1315192743762], "auditorium18": [26599.999999999993, 958.7074829931978], "auditorium19": [27799.999999999993, 1050.8616780045336], "auditorium20": [29999.999999999993, 1045.6462585034033], "credits": [32199.999999999996, 690.6122448979559], "end": [33399.99999999999, 1004.1723356009059], "finalshow": [35599.999999999985, 1056.1904761904727], "intermission": [37799.999999999985, 568.7301587301619], "mainshow": [38999.999999999985, 1155.2607709750546], "preshow": [41199.99999999998, 1171.224489795918], "start": [43399.999999999985, 547.0068027210857]
        }
    }),
    gerwim: new Voice({
        name: "Gerwim",
        language: "nl",
        gender: "M",
        file: voiceGerwim,
        sprite: {
            "auditorium01": [0, 824.9659863945578], "auditorium02": [1200, 870.907029478458], "auditorium03": [2400, 790.2040816326532], "auditorium04": [3600, 886.825396825397], "auditorium05": [4800, 838.526077097506], "auditorium06": [6000, 866.7573696145121], "auditorium07": [7199.999999999999, 987.7777777777776], "auditorium10": [8399.999999999998, 665.6689342403635], "credits": [9600, 936.5532879818588], "start": [10799.999999999998, 638.9342403628114]
        }
    }),
    jaron: new Voice({
        name: "Jaron",
        language: "nl",
        gender: "M",
        file: voiceJaron,
        sprite: {
            "auditorium01": [0, 996.2585034013606], "auditorium02": [1200, 977.2562358276645], "auditorium03": [2400, 1053.9229024943313], "auditorium04": [4600, 1109.8866213151925], "auditorium05": [6799.999999999999, 1125.5328798185947], "auditorium06": [9000, 1083.7641723356005], "auditorium07": [11200, 1070.2947845804988], "auditorium08": [13399.999999999998, 1134.9206349206345], "auditorium09": [15599.999999999998, 1259.2517006802736], "auditorium10": [17800, 750.5895691609971], "credits": [19000, 920.6575963718819], "end": [20200, 1177.0748299319714], "finalshow": [22400, 1377.0068027210875], "mainshow": [24599.999999999996, 1302.0634920634925], "start": [26799.999999999996, 737.8458049886625]
        }
    }),
    danique: new Voice({
        name: "Danique",
        language: "nl",
        gender: "F",
        file: voiceDanique,
        sprite: {
            "auditorium01": [0, 737.9591836734694], "auditorium02": [1200, 820.340136054422], "auditorium03": [2400.0000000000005, 677.482993197279], "auditorium04": [3600.0000000000005, 822.6530612244902], "auditorium05": [4800.000000000001, 810.5442176870747], "auditorium06": [6000.000000000001, 795.4875283446717], "auditorium07": [7200.000000000001, 926.8027210884355], "auditorium08": [8400, 871.0430839002274], "auditorium09": [9600.000000000002, 941.8820861677997], "auditorium10": [10800, 689.569160997733], "credits": [12000.000000000002, 786.3718820861685], "end": [13200.000000000004, 1149.2743764172335], "start": [15400.000000000002, 520.2040816326523]
        }
    })
};

export const defaultVoiceKey: keyof typeof voices = 'quinten';
export const defaultVoice = voices[defaultVoiceKey];

export function getSoundInfo(string) {
    const soundNames = { start: "start", mainshow: "start hoofdfilm", intermission: "pauze", credits: "aftiteling", end: "einde voorstelling", preshow: "start voorprogramma", finalshow: "laatste voorstelling", chime0: '♪', };

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

    return { id, name, valid, probability }
}