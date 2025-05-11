import { Voice } from '@/utils/voices';

// Helper to encode an AudioBuffer as a simple WAV blob
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 16; // 16-bit PCM
    const blockAlign = numChannels * (format / 8);
    const byteRate = sampleRate * blockAlign;
    const wavBuffer = new ArrayBuffer(44 + buffer.length * blockAlign);
    const view = new DataView(wavBuffer);

    let offset = 0;
    // RIFF chunk descriptor
    function writeString(s: string) {
        for (let i = 0; i < s.length; i++) {
            view.setUint8(offset++, s.charCodeAt(i));
        }
    }
    writeString('RIFF');
    view.setUint32(offset, 36 + buffer.length * blockAlign, true); offset += 4;
    writeString('WAVE');
    // fmt sub-chunk
    writeString('fmt ');
    view.setUint32(offset, 16, true); offset += 4;  // Subchunk1Size
    view.setUint16(offset, 1, true); offset += 2;   // PCM
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, byteRate, true); offset += 4;
    view.setUint16(offset, blockAlign, true); offset += 2;
    view.setUint16(offset, format, true); offset += 2;
    // data sub-chunk
    writeString('data');
    view.setUint32(offset, buffer.length * blockAlign, true); offset += 4;

    // Interleave channels
    for (let i = 0; i < buffer.length; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }
    return new Blob([view], { type: 'audio/wav' });
}

/**
 * Assemble a combined audio buffer from sprite segments (client-side).
 * @param segments { voice: Voice; spriteName: string; offset: number }[]
 * @returns A Promise resolving to an Object URL for a WAV blob of the combined audio
 */
export async function assembleAudioClient(
    segments: { voice: Voice; spriteName: string; offset?: number }[]
): Promise<string> {
    // First, decode each unique voice file into an AudioBuffer
    const audioCtx = new AudioContext();
    const decodedMap = new Map<Voice, AudioBuffer>();
    for (const { voice } of segments) {
        if (!decodedMap.has(voice)) {
            const resp = await fetch(voice.file);
            const data = await resp.arrayBuffer();
            const decoded = await audioCtx.decodeAudioData(data);
            decodedMap.set(voice, decoded);
        }
    }

    // Compute total length in seconds for final track
    // Accumulate each segment's start time + duration
    let currentTime = 0;
    let maxEndTime = 0;
    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        
        const [spriteOffsetMs, spriteDurationMs] = seg.voice.sprite[seg.spriteName] || [0, 0];
        // Schedule next snippet at currentTime
        const snippetEndTime = currentTime + spriteDurationMs / 1000;
        if (snippetEndTime > maxEndTime) maxEndTime = snippetEndTime;
        // Advance by the snippet length plus overlap
        currentTime += (spriteDurationMs + (seg.offset || 0)) / 1000;
    }

    // Create Offline context with enough length to hold everything
    const offlineCtx = new OfflineAudioContext(2, Math.ceil(maxEndTime * 44100), 44100);
    currentTime = 0;

    // Schedule each snippet in the offline context
    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];

        const [spriteOffsetMs, spriteDurationMs] = seg.voice.sprite[seg.spriteName] || [0, 0];
        const voiceBuffer = decodedMap.get(seg.voice);
        if (!voiceBuffer) return;

        // Create a source for the voice audio
        const source = offlineCtx.createBufferSource();
        source.buffer = voiceBuffer;

        // We can specify playback offset/time in seconds
        const startOffset = Math.max(0, currentTime); // clamp negative starts
        source.start(
            startOffset,                   // time in output buffer
            spriteOffsetMs / 1000,         // offset in voice file
            spriteDurationMs / 1000        // duration
        );
        source.connect(offlineCtx.destination);

        // Move current time forward (allow negative offset)
        currentTime += (spriteDurationMs + (seg.offset || 0)) / 1000;
    }

    // Render final buffer and convert to a WAV Blob
    const rendered = await offlineCtx.startRendering();
    const wavBlob = audioBufferToWavBlob(rendered);

    // Create an object URL for immediate playback
    return URL.createObjectURL(wavBlob);
}