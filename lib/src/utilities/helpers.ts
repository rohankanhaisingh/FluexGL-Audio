import { AudioDevice } from "../core/classes/AudioDevice";
import { Debug } from "./debugger";
import { ErrorCodes, WarningCodes } from "../error-codes";

export async function EnsureAudioPermission(): Promise<boolean> {

    let canEnumerateDevices: boolean = true;

    try {
        
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});

        stream.getTracks().forEach(function(track: MediaStreamTrack) {
            track.stop();
        });
    } catch(err) {
        canEnumerateDevices = false;
    }

    if(!canEnumerateDevices) Debug.Error("Permission to access media devices has not been granted.", [
        "Make sure the user has granted FluentGL permission to access media devices."
    ], ErrorCodes.NO_CONTEXT_PERMISSION)

    return canEnumerateDevices;
}

export async function ResolveAudioOutputDevices(): Promise<AudioDevice[]> {

    const devices = await navigator.mediaDevices.enumerateDevices();

    const audioDevices: AudioDevice[] = [];

    for(let device of devices) 
        device.kind === "audiooutput" && audioDevices.push(new AudioDevice(device));

    return audioDevices;
}

export async function ResolveAudioInputDevices(): Promise<AudioDevice[]> {

    const devices = await navigator.mediaDevices.enumerateDevices();

    const audioDevices: AudioDevice[] = [];

    for(let device of devices) 
        device.kind === "audioinput" && audioDevices.push(new AudioDevice(device));

    return audioDevices;
}

export async function ResolveDefaultAudioOutputDevice(): Promise<AudioDevice | null> {

    const audioDeviceInfos: MediaDeviceInfo[] = [];

    const devices = await navigator.mediaDevices.enumerateDevices();

    for(let device of devices) 
        (device.kind === "audiooutput" && device.deviceId == "default") 
            && audioDeviceInfos.push(device);

    devices.length === 0 && Debug.Warn("No default audio device found.", [], WarningCodes.NO_DEFAULT_AUDIO_DEVICE_FOUND);

    return devices.length === 0 ? null : new AudioDevice(audioDeviceInfos[0]);
}

export async function ResolveDefaultAudioInputDevice(): Promise<AudioDevice | null> {

    const audioDeviceInfos: MediaDeviceInfo[] = [];

    const devices = await navigator.mediaDevices.enumerateDevices();

    for(let device of devices) 
        (device.kind === "audioinput" && device.deviceId == "default") 
            && audioDeviceInfos.push(device);

    devices.length === 0 && Debug.Warn("No default audio device found.", [], WarningCodes.NO_DEFAULT_AUDIO_DEVICE_FOUND);

    return devices.length === 0 ? null : new AudioDevice(audioDeviceInfos[0]);
}