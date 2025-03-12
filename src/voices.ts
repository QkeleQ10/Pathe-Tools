import voiceDefault from '@/assets/sounds/voices/rosetta.ogg';
import voiceGerwim from '@/assets/sounds/voices/gerwim.ogg';
import voiceJaron from '@/assets/sounds/voices/jaron.ogg';
import { SpriteMap } from '@vueuse/sound';

export class Voice {
    name: string;
    language: string;
    file: any;
    sprite: SpriteMap;
    constructor(voice: { name: string; language: string; file: any; sprite: SpriteMap; }) {
        this.name = voice.name;
        this.language = voice.language;
        this.file = voice.file;
        this.sprite = voice.sprite;
    }

    get sounds() {
        return Object.keys(this.sprite);
    }

    get additionalSounds() {
        return this.sounds.filter(sound => !voices.default.sounds.includes(sound));
    }
}

export const voices = {
    default: new Voice({
        name: "Rosetta",
        language: "nl",
        file: voiceDefault,
        sprite: {
            "auditorium01": [0, 1201.6326530612246], "auditorium02": [3000, 1332.2448979591836], "auditorium03": [6000, 1332.2448979591836], "auditorium04": [9000, 1384.489795918368], "auditorium05": [12000, 1436.7346938775504], "auditorium06": [15000, 1436.7346938775504], "auditorium07": [18000, 1515.102040816327], "auditorium08": [21000, 1515.102040816327], "auditorium09": [24000, 1488.9795918367347], "auditorium10": [27000, 1306.1224489795932], "auditorium11": [30000, 1462.8571428571427], "auditorium12": [33000, 1515.1020408163233], "auditorium13": [36000, 1488.9795918367383], "auditorium14": [39000, 1488.9795918367383], "auditorium15": [42000, 1567.3469387755076], "auditorium16": [45000, 1488.9795918367383], "auditorium17": [48000, 1515.1020408163233], "auditorium18": [51000, 1462.8571428571463], "auditorium19": [54000, 1724.0816326530605], "auditorium20": [57000, 1593.4693877551], "chime": [60000, 3084.51247165533], "credits": [65000, 1501.6099773242645], "end": [68000, 1563.7868480725672], "mainshow": [71000, 1793.3333333333367], "preshow": [74000, 1814.036281179142], "start": [77000, 989.9092970521508]
        }
    }),
    gerwim: new Voice({
        name: "Gerwim",
        language: "nl",
        file: voiceGerwim,
        sprite: {
            "auditorium01": [0, 824.9659863945578], "auditorium02": [2000, 870.9070294784577], "auditorium03": [4000, 790.2040816326528], "auditorium04": [6000, 886.8253968253965], "auditorium05": [8000, 838.5260770975051], "auditorium06": [10000, 866.757369614513], "auditorium07": [12000, 987.7777777777776], "auditorium10": [14000, 665.6689342403635], "credits": [16000, 936.5532879818588], "start": [18000, 638.9342403628114]
        }
    }),
    jaron: new Voice({
        name: "Jaron",
        language: "nl",
        file: voiceJaron,
        sprite: {
            "auditorium01": [0, 1346.7573696145125], "auditorium02": [3000, 1230.6575963718824], "auditorium03": [6000, 1369.977324263038], "auditorium04": [9000, 1544.1269841269848], "auditorium05": [12000, 1300.3174603174602], "auditorium06": [15000, 1114.5578231292532], "auditorium07": [18000, 1219.0476190476184], "auditorium08": [21000, 1346.7573696145116], "auditorium09": [24000, 1462.8571428571427], "auditorium10": [27000, 1033.2879818594095], "credits": [30000, 1520.907029478458], "end": [33000, 1358.3673469387777], "finalshow": [36000, 1486.077097505671], "geluidje": [39000, 2113.0158730158755], "jippie": [43000, 1300.3174603174584], "mainshow": [46000, 1335.1473922902528], "rollcredits": [49000, 1393.1972789115648], "start": [52000, 1428.027210884352], "waluigi": [55000, 1451.2471655328768]
        }
    })
};

export function getSoundInfo(string) {
    const soundNames = { start: "start", mainshow: "start hoofdfilm", credits: "aftiteling", end: "einde voorstelling", preshow: "start voorprogramma", finalshow: "laatste voorstelling", chime: "geluidje" };

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