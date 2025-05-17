export class Packet {
    packet: Uint8Array;

    constructor(
        sender: number = 0xFFFF,
        receiver: number = 0xFFFF,
        messageBody: Uint8Array | Function[] | Function
    ) {

        let byteArray: Uint8Array;
        if (messageBody instanceof Uint8Array) byteArray = messageBody;
        else if (Array.isArray(messageBody)) {
            byteArray = new Uint8Array(messageBody.reduce((acc, func) => acc + func.messageBody.length, 0));
            let offset = 0;
            for (const func of messageBody) {
                byteArray.set(func.messageBody, offset);
                offset += func.messageBody.length;
            }
        } else {
            byteArray = messageBody.messageBody;
        }

        const messageHeader = new Uint8Array(9);
        messageHeader.set([0xAA, 0xBB,
            sender >> 8, sender & 0xFF,
            receiver >> 8, receiver & 0xFF,
            byteArray.length >> 8, byteArray.length & 0xFF,
            (
                sender >> 8 ^ sender & 0xFF ^ receiver >> 8 ^ receiver & 0xFF ^ byteArray.length >> 8 ^ byteArray.length & 0xFF
            )
        ]);


        const messageEnding = new Uint8Array(1);
        messageEnding.set([
            (
                byteArray.reduce((acc, byte) => acc ^ byte, 0x00)
            )
        ]);


        this.packet = new Uint8Array(
            messageHeader.length + byteArray.length + messageEnding.length
        );
        this.packet.set(messageHeader);
        this.packet.set(byteArray, messageHeader.length);
        this.packet.set(messageEnding, messageHeader.length + byteArray.length);
    }

    toString() {
        return Array.from(this.packet).map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase();
    }
}

export class Function {
    static functionCode = 0x00;
    messageBody: Uint8Array;

    constructor() { }
}

/**
 * Send to initial segment (FC 00h)
 */
export class FunctionSendToInitialSegment extends Function {
    static functionCode = 0x00;

    constructor(
        displayData: Uint8Array | Command[] | Command,
    ) {
        super();

        let byteArray: Uint8Array;
        if (displayData instanceof Uint8Array) byteArray = displayData;
        else if (Array.isArray(displayData)) {
            byteArray = new Uint8Array(displayData.reduce((acc, command) => acc + command.messageBody.length, 0));
            let offset = 0;
            for (const command of displayData) {
                byteArray.set(command.messageBody, offset);
                offset += command.messageBody.length;
            }
        } else {
            byteArray = displayData.messageBody;
        }

        const messageBody = new Uint8Array(1 + byteArray.length);
        messageBody.set([(this.constructor as typeof Function).functionCode]);
        messageBody.set(byteArray, 1);

        this.messageBody = messageBody;
    }
}

export class FunctionSetClock extends Function {
    static functionCode = 0x01;

    constructor(
        date: Date,
    ) {
        super();

        const messageBody = new Uint8Array(1 + 7);
        messageBody.set([(this.constructor as typeof Function).functionCode]);
        messageBody.set([
            date.getFullYear() - 2000,
            date.getMonth() + 1,
            date.getDate(),
            date.getDay(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
        ], 1);

        this.messageBody = messageBody;
    }
}

export class FunctionClearAll extends Function {
    static functionCode = 0x07;

    constructor() {
        super();

        const messageBody = new Uint8Array(1);
        messageBody.set([(this.constructor as typeof Function).functionCode]);

        this.messageBody = messageBody;
    }
}

export class FunctionSendPing extends Function {
    static functionCode = 0x20;

    constructor() {
        super();

        const messageBody = new Uint8Array(1);
        messageBody.set([(this.constructor as typeof Function).functionCode]);

        this.messageBody = messageBody;
    }
}

export class FunctionRequestDisplayTransmissionResult extends Function {
    static functionCode = 0x21;

    constructor() {
        super();

        const messageBody = new Uint8Array(1);
        messageBody.set([(this.constructor as typeof Function).functionCode]);

        this.messageBody = messageBody;
    }
}

export class Command {
    static commandCode = 0x00;
    messageBody: Uint8Array;

    constructor() { }
}

/**
 * Clear display (CC 01h)
 */
export class CommandClearBuffer extends Command {
    static commandCode = 0x01;

    constructor() {
        super();

        const messageBody = new Uint8Array(1);
        messageBody.set([CommandClearBuffer.commandCode]);

        this.messageBody = messageBody;
    }
}

/**
 * Draw a text string (CC 03h)
 */
export class CommandShowTextString extends Command {
    static commandCode = 0x03;

    constructor(
        font: number = 0x00,
        fcolor: number = 0x03,
        bcolor: number = 0x00,
        x: number = 0x00,
        y: number = 0x00,
        textString: string,
    ) {
        super();

        const encodedText = encodeText(textString);

        const messageBody = new Uint8Array(6 + encodedText.length + 1);
        messageBody.set([CommandShowTextString.commandCode]);
        messageBody.set([
            font,
            fcolor,
            bcolor,
            x,
            y
        ], 1);
        messageBody.set(encodedText, 6);
        messageBody.set([0x00], messageBody.length - 1);

        this.messageBody = messageBody;
    }
}

export class CommandShowCurrentTime extends Command {
    static commandCode = 0x04;

    constructor(
        type: number = 0x02,
        font: number = 0x00,
        fcolor: number = 0x03,
        bcolor: number = 0x00,
        x: number = 0x37,
        y: number = 0x00,
    ) {
        super();

        const messageBody = new Uint8Array(7);
        messageBody.set([CommandShowCurrentTime.commandCode]);
        messageBody.set([
            type,
            font,
            fcolor,
            bcolor,
            x,
            y
        ], 1);

        this.messageBody = messageBody;
    }
}

export class CommandShowCurrentDate extends Command {
    static commandCode = 0x05;

    constructor(
        type: number = 0x03,
        font: number = 0x00,
        fcolor: number = 0x03,
        bcolor: number = 0x00,
        x: number = 0x00,
        y: number = 0x00,
    ) {
        super();

        const messageBody = new Uint8Array(7);
        messageBody.set([CommandShowCurrentDate.commandCode]);
        messageBody.set([
            type,
            font,
            fcolor,
            bcolor,
            x,
            y
        ], 1);

        this.messageBody = messageBody;
    }
}

export class CommandDelay extends Command {
    static commandCode = 0x06;

    constructor(
        delayTime: number = 0x0000,
    ) {
        super();

        const messageBody = new Uint8Array(3);
        messageBody.set([CommandDelay.commandCode]);
        messageBody.set([
            delayTime >> 8, delayTime & 0xFF
        ], 1);

        this.messageBody = messageBody;
    }
}

/**
 * Show the data on the display (CC 07h)
 */
export class CommandDisplayBuffer extends Command {
    static commandCode = 0x07;

    constructor(
        delayTime: number = 0x0000,
        mode: number = 0x00,
        speed: number = 0x09,
    ) {
        super();

        const messageBody = new Uint8Array(5);
        messageBody.set([CommandDisplayBuffer.commandCode]);
        messageBody.set([
            delayTime >> 8, delayTime & 0xFF,
            mode,
            speed
        ], 1);

        this.messageBody = messageBody;
    }
}

export class CommandShowTextImmediately extends Command {
    static commandCode = 0x08;

    constructor(
        mode: number = 0x00,
        speed: number = 0x04,
        font: number = 0x00,
        fcolor: number = 0x03,
        bcolor: number = 0x00,
        x: number = 0x00,
        y: number = 0x00,
        textString: string,
    ) {
        super();

        const encodedText = encodeText(textString);

        const messageBody = new Uint8Array(8 + encodedText.length + 1);
        messageBody.set([CommandShowTextImmediately.commandCode]);
        messageBody.set([
            mode,
            speed,
            font,
            fcolor,
            bcolor,
            x,
            y
        ], 1);
        messageBody.set(encodedText, 8);
        messageBody.set([0x00], messageBody.length - 1);

        this.messageBody = messageBody;
    }
}

/**
 * End of display data (CC 1Fh)
 */
export class CommandEndOfSegmentData extends Command {
    static commandCode = 0x1F;

    constructor() {
        super();

        const messageBody = new Uint8Array(1);
        messageBody.set([CommandEndOfSegmentData.commandCode]);

        this.messageBody = messageBody;
    }
}

export const characterSet = {
    "": 0x00,
    "": 0x01,
    "": 0x02,
    "": 0x03,
    "": 0x04,
    "": 0x05,
    "": 0x06,
    "": 0x07,
    "": 0x08,
    "	": 0x09,
    "\n": 0x0a,
    "": 0x0b,
    "": 0x0c,
    "\r": 0x0d,
    "": 0x0e,
    "": 0x0f,
    "": 0x10,
    "": 0x11,
    "": 0x12,
    "": 0x13,
    "": 0x14,
    "": 0x15,
    "": 0x16,
    "": 0x17,
    "": 0x18,
    "": 0x19,
    "": 0x1a,
    "": 0x1b,
    "": 0x1c,
    "": 0x1d,
    "": 0x1e,
    "": 0x1f,
    " ": 0x20,
    "!": 0x21,
    "\"": 0x22,
    "#": 0x23,
    "$": 0x24,
    "%": 0x25,
    "&": 0x26,
    "'": 0x27,
    "(": 0x28,
    ")": 0x29,
    "*": 0x2a,
    "+": 0x2b,
    ",": 0x2c,
    "-": 0x2d,
    ".": 0x2e,
    "/": 0x2f,
    "0": 0x30,
    "1": 0x31,
    "2": 0x32,
    "3": 0x33,
    "4": 0x34,
    "5": 0x35,
    "6": 0x36,
    "7": 0x37,
    "8": 0x38,
    "9": 0x39,
    ":": 0x3a,
    ";": 0x3b,
    "<": 0x3c,
    "=": 0x3d,
    ">": 0x3e,
    "?": 0x3f,
    "@": 0x40,
    "A": 0x41,
    "B": 0x42,
    "C": 0x43,
    "D": 0x44,
    "E": 0x45,
    "F": 0x46,
    "G": 0x47,
    "H": 0x48,
    "I": 0x49,
    "J": 0x4a,
    "K": 0x4b,
    "L": 0x4c,
    "M": 0x4d,
    "N": 0x4e,
    "O": 0x4f,
    "P": 0x50,
    "Q": 0x51,
    "R": 0x52,
    "S": 0x53,
    "T": 0x54,
    "U": 0x55,
    "V": 0x56,
    "W": 0x57,
    "X": 0x58,
    "Y": 0x59,
    "Z": 0x5a,
    "[": 0x5b,
    "\\": 0x5c,
    "]": 0x5d,
    "^": 0x5e,
    "_": 0x5f,
    "`": 0x60,
    "a": 0x61,
    "b": 0x62,
    "c": 0x63,
    "d": 0x64,
    "e": 0x65,
    "f": 0x66,
    "g": 0x67,
    "h": 0x68,
    "i": 0x69,
    "j": 0x6a,
    "k": 0x6b,
    "l": 0x6c,
    "m": 0x6d,
    "n": 0x6e,
    "o": 0x6f,
    "p": 0x70,
    "q": 0x71,
    "r": 0x72,
    "s": 0x73,
    "t": 0x74,
    "u": 0x75,
    "v": 0x76,
    "w": 0x77,
    "x": 0x78,
    "y": 0x79,
    "z": 0x7a,
    "{": 0x7b,
    "|": 0x7c,
    "}": 0x7d,
    "~": 0x7e,
    "": 0x7f,
    "": 0x80,
    "": 0x81,
    "": 0x82,
    "": 0x83,
    "": 0x84,
    "": 0x85,
    "": 0x86,
    "": 0x87,
    "": 0x88,
    "": 0x89,
    "": 0x8a,
    "": 0x8b,
    "": 0x8c,
    "": 0x8d,
    "": 0x8e,
    "": 0x8f,
    "": 0x90,
    "": 0x91,
    "": 0x92,
    "": 0x93,
    "": 0x94,
    "": 0x95,
    "": 0x96,
    "": 0x97,
    "": 0x98,
    "": 0x99,
    "": 0x9a,
    "": 0x9b,
    "": 0x9c,
    "": 0x9d,
    "": 0x9e,
    "": 0x9f,
    " ": 0xa0,
    "¡": 0xa1,
    "¢": 0xa2,
    "£": 0xa3,
    "¤": 0xa4,
    "¥": 0xa5,
    "¦": 0xa6,
    "§": 0xa7,
    "¨": 0xa8,
    "©": 0xa9,
    "ª": 0xaa,
    "«": 0xab,
    "¬": 0xac,
    "­": 0xad,
    "®": 0xae,
    "¯": 0xaf,
    "°": 0xb0,
    "±": 0xb1,
    "²": 0xb2,
    "³": 0xb3,
    "´": 0xb4,
    "µ": 0xb5,
    "¶": 0xb6,
    "·": 0xb7,
    "¸": 0xb8,
    "¹": 0xb9,
    "º": 0xba,
    "»": 0xbb,
    "¼": 0xbc,
    "½": 0xbd,
    "¾": 0xbe,
    "¿": 0xbf,
    "À": 0xc0,
    "Á": 0xc1,
    "Â": 0xc2,
    "Ã": 0xc3,
    "Ä": 0xc4,
    "Å": 0xc5,
    "Æ": 0xc6,
    "Ç": 0xc7,
    "È": 0xc8,
    "É": 0xc9,
    "Ê": 0xca,
    "Ë": 0xcb,
    "Ì": 0xcc,
    "Í": 0xcd,
    "Î": 0xce,
    "Ï": 0xcf,
    "Ð": 0xd0,
    "Ñ": 0xd1,
    "Ò": 0xd2,
    "Ó": 0xd3,
    "Ô": 0xd4,
    "Õ": 0xd5,
    "Ö": 0xd6,
    "×": 0xd7,
    "Ø": 0xd8,
    "Ù": 0xd9,
    "Ú": 0xda,
    "Û": 0xdb,
    "Ü": 0xdc,
    "Ý": 0xdd,
    "Þ": 0xde,
    "ß": 0xdf,
    "à": 0xe0,
    "á": 0xe1,
    "â": 0xe2,
    "ã": 0xe3,
    "ä": 0xe4,
    "å": 0xe5,
    "æ": 0xe6,
    "ç": 0xe7,
    "è": 0xe8,
    "é": 0xe9,
    "ê": 0xea,
    "ë": 0xeb,
    "ì": 0xec,
    "í": 0xed,
    "î": 0xee,
    "ï": 0xef,
    "ð": 0xf0,
    "ñ": 0xf1,
    "ò": 0xf2,
    "ó": 0xf3,
    "ô": 0xf4,
    "õ": 0xf5,
    "ö": 0xf6,
    "÷": 0xf7,
    "ø": 0xf8,
    "ù": 0xf9,
    "ú": 0xfa,
    "û": 0xfb,
    "ü": 0xfc,
    "ý": 0xfd,
    "þ": 0xfe,
    "ÿ": 0xff
}

/**
 * Encode a string to Uint8Array using the characterSet
 * @param text The text to encode
 * @returns The encoded Uint8Array
 */
export function encodeText(text: string): Uint8Array {
    const arr = text.split('').map(c => characterSet[c] ?? 0x00);
    return new Uint8Array(arr);
}
