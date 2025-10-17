/**
 * FluexGL Audio
 * A javascript digital audio processor library.
 */

import { FluexGLAudioDescriptor } from "./typings";

export const FluexGLAudio: FluexGLAudioDescriptor = {
    name: "FluexGL Audio",
    author: "Rohan Kanhaisingh",
    version: "0.0.1",
    license: "MIT",
    repository: "https://github.com/rohankanhaisingh/FluexGL-Audio",
    options: {
        maxMasterChannels: 8,
        maxTotalChannels: 128,
        sampleRate: 44000,
        spatialization: "stereo",
        debugger: {
            showErrors: true,
            showInfo: true,
            showWarnings: true,
            breakOnError: true
        }
    }
}

export {
    Chorus,
    Distortion,
    Equalizer,
    Filter,
    Limiter,
    Saturation,
    StereoPanner,
    Compressor,
    MultibandCompressor,
    AdvancedDelay,
    MonoDelay,
    PingPongDelay,
    StereoDelay,
    ChamberReverb,
    ConvolverReverb,
    GenericReverb,
    HallReverb,
    RoomReverb
} from "./effects/exports";

export {
    AudioDevice,
    Channel,
    Effector,
    Master,
    AudioClip
} from "./core/exports";

export {
    EnsureAudioPermission,
    ResolveAudioOutputDevices,
    ResolveAudioInputDevices,
    ResolveDefaultAudioInputDevice,
    ResolveDefaultAudioOutputDevice,
    LoadAudioSource
} from "./utilities/helpers";

export {
    SUPPORTED_FILE_TYPES
} from "./utilities/constants";

export { 
    FluexGLAudioDescriptor,
    FluexGLAudioDebuggerOptions,
    FluexGLAudioOptions,
    LoadAudioSourceOptions,
    AudioSourceData,
    ChannelOptions,
    ChannelSpatialization
 } from "./typings";