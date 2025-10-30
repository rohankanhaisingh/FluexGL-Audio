import mime from "mime";
import { v4 } from "uuid";

import { AudioDevice } from "../core/classes/AudioDevice";
import { Debug } from "./debugger";
import { ErrorCodes, WarningCodes } from "../console-codes";
import { SUPPORTED_FILE_TYPES } from "./constants";
import { LoadAudioSourceOptions, AudioSourceData, DspPipelineInitializationOptions } from "../typings";
import { FluexGLWasmDSP } from "../wasm";

/**
 * Initializes the DSP pipeline by requesting audio permissions and initializing the WASM module.
 * Very important to call this function and wait for it to complete before using any audio features.
 * 
 * FluexGL DSP cannot be used without calling this function first.
 * @returns 
 */
export async function InitializeDspPipeline(options: DspPipelineInitializationOptions): Promise<boolean> {

    let initialized: boolean = true;

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        stream.getTracks().forEach(function (track: MediaStreamTrack) {
            track.stop();
        });
    } catch (err) {

        initialized = false;

        Debug.Error("Permission to access media devices has not been granted.", [
            "Make sure the user has granted FluentGL permission to access media devices."
        ], ErrorCodes.NO_CONTEXT_PERMISSION)
    }

    try {
        await FluexGLWasmDSP.InitializeModule();
    } catch (err) {

        initialized = false;

        Debug.Error("WASM module could not be initialized.", [
            "Make sure the WASM files are correctly hosted and accessible."
        ], ErrorCodes.WASM_MODULE_INITIALIZATION_FAILED);
    }

    try {

        const wasmFile = await fetch(options.pathToWasm as string, { method: "HEAD" });

        if (wasmFile.status !== 200) {

            initialized = false;

            Debug.Error("The specified path to the WASM file could not be found in the server.", [
                `Received status code: ${wasmFile.status}.`,
                `Make sure the path '${options.pathToWasm}' is correct and the file is accessible.`
            ], ErrorCodes.PATH_TO_WASM_FILE_NOT_FOUND);
        }

    } catch (err) {

        initialized = false;

        Debug.Error("The specified path to the WASM file could not be found in the server.", [
            `Make sure the path '${options.pathToWasm}' is correct and the file is accessible.`
        ], ErrorCodes.PATH_TO_WASM_FILE_NOT_FOUND);
    }

    FluexGLWasmDSP.pathToWasmFileInServer = options.pathToWasm;

    return initialized;
}

/**
 * Resolves a list of available audio output devices.
 * @returns 
 */
export async function ResolveAudioOutputDevices(): Promise<AudioDevice[]> {

    const devices = await navigator.mediaDevices.enumerateDevices();

    const audioDevices: AudioDevice[] = [];

    for (let device of devices)
        device.kind === "audiooutput" && audioDevices.push(new AudioDevice(device));

    return audioDevices;
}

/**
 * Resolves a list of available audio input devices.
 * @returns 
 */
export async function ResolveAudioInputDevices(): Promise<AudioDevice[]> {

    const devices = await navigator.mediaDevices.enumerateDevices();

    const audioDevices: AudioDevice[] = [];

    for (let device of devices)
        device.kind === "audioinput" && audioDevices.push(new AudioDevice(device));

    return audioDevices;
}

/**
 * Resolves the default audio output device.
 * @returns 
 */
export async function ResolveDefaultAudioOutputDevice(): Promise<AudioDevice | null> {

    const audioDeviceInfos: MediaDeviceInfo[] = [];

    const devices = await navigator.mediaDevices.enumerateDevices();

    for (let device of devices)
        (device.kind === "audiooutput" && device.deviceId == "default")
            && audioDeviceInfos.push(device);

    devices.length === 0 && Debug.Warn("No default audio device found.", [], WarningCodes.NO_DEFAULT_AUDIO_DEVICE_FOUND);

    return devices.length === 0 ? null : new AudioDevice(audioDeviceInfos[0]);
}

/**
 * Resolves the default audio input device.
 * @returns 
 */
export async function ResolveDefaultAudioInputDevice(): Promise<AudioDevice | null> {

    const audioDeviceInfos: MediaDeviceInfo[] = [];

    const devices = await navigator.mediaDevices.enumerateDevices();

    for (let device of devices)
        (device.kind === "audioinput" && device.deviceId == "default")
            && audioDeviceInfos.push(device);

    devices.length === 0 && Debug.Warn("No default audio device found.", [], WarningCodes.NO_DEFAULT_AUDIO_DEVICE_FOUND);

    return devices.length === 0 ? null : new AudioDevice(audioDeviceInfos[0]);
}

/**
 * Loads an audio source from a specified path.
 * @param path 
 * @param options 
 * @returns 
 */
export async function LoadAudioSource(path: string, options: Partial<LoadAudioSourceOptions> = { allowForeignFileTypes: false }): Promise<AudioSourceData | null> {

    const extension: string | null = mime.getType(path);

    if (!extension && !options.allowForeignFileTypes) {

        Debug.Error("The file type of the specified file could not be identified.", [
            `Set allowForeignFileTypes to true in the properties to allow foreign or unknown file types.`
        ], ErrorCodes.NO_FILE_TYPE_FOUND);
        return null;
    }

    if (!SUPPORTED_FILE_TYPES.includes(extension as string)) Debug.Warn("The file type of the specified file is unknown and possibly unknown, but will be used anyways.");

    const file = await fetch(path, { method: "get" });

    if (file.status !== 200) {

        Debug.Error("The specified file could not be loaded.", [
            `Received status code: ${file.status}.`
        ], ErrorCodes.PATH_TO_FILE_NOT_FOUND);
        return null;
    }

    const tempContext = new AudioContext(),
        arrayBuffer = await file.arrayBuffer(),
        audioBuffer = await tempContext.decodeAudioData(arrayBuffer);

    // IMPORTANT!
    tempContext.close();

    return {
        arrayBuffer, audioBuffer,
        id: v4(),
        timestamp: Date.now()
    }
}

export function LoadWorkletSourceAsScript(source: string) {

    const blob = new Blob([source], { type: "application/javascript" });

    return URL.createObjectURL(blob);
}