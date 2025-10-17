import mime from "mime";

import { AudioDevice } from "../core/classes/AudioDevice";
import { Debug } from "./debugger";
import { ErrorCodes, WarningCodes } from "../console-codes";
import { Channel } from "../core/classes/Channel";
import { SUPPORTED_FILE_TYPES } from "./constants";
import { LoadAudioSourceOptions, AudioSourceData } from "../typings";
import { v4 } from "uuid";

export async function EnsureAudioPermission(): Promise<boolean> {

    let canEnumerateDevices: boolean = true;

    try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        stream.getTracks().forEach(function (track: MediaStreamTrack) {
            track.stop();
        });
    } catch (err) {
        canEnumerateDevices = false;
    }

    if (!canEnumerateDevices) Debug.Error("Permission to access media devices has not been granted.", [
        "Make sure the user has granted FluentGL permission to access media devices."
    ], ErrorCodes.NO_CONTEXT_PERMISSION)

    return canEnumerateDevices;
}

export async function ResolveAudioOutputDevices(): Promise<AudioDevice[]> {

    const devices = await navigator.mediaDevices.enumerateDevices();

    const audioDevices: AudioDevice[] = [];

    for (let device of devices)
        device.kind === "audiooutput" && audioDevices.push(new AudioDevice(device));

    return audioDevices;
}

export async function ResolveAudioInputDevices(): Promise<AudioDevice[]> {

    const devices = await navigator.mediaDevices.enumerateDevices();

    const audioDevices: AudioDevice[] = [];

    for (let device of devices)
        device.kind === "audioinput" && audioDevices.push(new AudioDevice(device));

    return audioDevices;
}

export async function ResolveDefaultAudioOutputDevice(): Promise<AudioDevice | null> {

    const audioDeviceInfos: MediaDeviceInfo[] = [];

    const devices = await navigator.mediaDevices.enumerateDevices();

    for (let device of devices)
        (device.kind === "audiooutput" && device.deviceId == "default")
            && audioDeviceInfos.push(device);

    devices.length === 0 && Debug.Warn("No default audio device found.", [], WarningCodes.NO_DEFAULT_AUDIO_DEVICE_FOUND);

    return devices.length === 0 ? null : new AudioDevice(audioDeviceInfos[0]);
}

export async function ResolveDefaultAudioInputDevice(): Promise<AudioDevice | null> {

    const audioDeviceInfos: MediaDeviceInfo[] = [];

    const devices = await navigator.mediaDevices.enumerateDevices();

    for (let device of devices)
        (device.kind === "audioinput" && device.deviceId == "default")
            && audioDeviceInfos.push(device);

    devices.length === 0 && Debug.Warn("No default audio device found.", [], WarningCodes.NO_DEFAULT_AUDIO_DEVICE_FOUND);

    return devices.length === 0 ? null : new AudioDevice(audioDeviceInfos[0]);
}

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

    if(file.status !== 200) {
        
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