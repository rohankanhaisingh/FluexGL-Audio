export type ChannelSpatialization = "mono" | "stereo" | "surround";

export interface FluexGLAudioDebuggerOptions {
    breakOnError: boolean;
    showInfo: boolean;
    showErrors: boolean;
    showWarnings: boolean;
}

export interface FluexGLAudioOptions {
    maxMasterChannels: number;
    maxTotalChannels: number;
    sampleRate: number;
    spatialization: ChannelSpatialization;
    debugger: FluexGLAudioDebuggerOptions;
}

export interface FluexGLAudioDescriptor {
    name: string;
    author: string;
    version: string;
    license: string;
    repository: string;
    options: FluexGLAudioOptions;
}

export interface LoadAudioSourceOptions {
    allowForeignFileTypes: boolean;
}

export interface ChannelOptions {
    label: string;
    maxAudioNodes: number;
    maxEffects: number;
}