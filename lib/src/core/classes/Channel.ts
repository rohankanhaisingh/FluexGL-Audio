import { v4 } from "uuid";

import { Effector } from "./Effector";
import { AudioClip } from "./AudioClip";

import { ChannelOptions } from "../../typings";
import { Debug } from "../../utilities/debugger";
import { Master } from "./Master";

export class Channel {

    public id: string = v4();
    public effects: Effector[] = [];
    public label: string | null;

    public parentialContext: AudioContext | null = null;
    public parentialMasterChannel: Master | null = null;

    public audioClips: AudioClip[] = [];

    public gainNode: GainNode | null = null;
    public stereoPannerNode: StereoPannerNode | null = null;

    constructor(public options: Partial<ChannelOptions> = {
        maxAudioNodes: 8,
        maxEffects: 8
    }) {

        this.label = options.label ?? null;
    }

    public InitializeChannelOnMasterAttachment(master: Master) {

        this.parentialMasterChannel = master;
        this.parentialContext = master.context;

        this.gainNode = new GainNode(this.parentialContext);
        this.stereoPannerNode = new StereoPannerNode(this.parentialContext);

        this.gainNode.connect(this.parentialMasterChannel.gainNode);
        this.stereoPannerNode.connect(this.gainNode);
    }

    public SetLabel(label: string): void {

        this.options.label = label;
        this.label = label;
    }

    public ClearLabel(): void {

        this.options.label = "";
        this.label = null;
    }

    public AttachAudioClip(clip: AudioClip) {

        if(this.audioClips.includes(clip)) return Debug.Error("Could not attach audio clip because it is already part of this channel", [
            "Call .DetachAudioClip([clip AudioClip]) before attaching audio clip."
        ]);

        clip.InitializeAudioClipOnAttaching(this);
        this.audioClips.push(clip);
    }

    public DetachAudioClip(clip: AudioClip) {

        if(!this.audioClips.includes(clip)) return Debug.Error("Could not detach audio clip, because it is not part of this channel.", [
            "Call .AttachAudioClip([clip AudioClip]) before deattaching audio clip."
        ]);

        const self: Channel = this;

        clip.parentialAudioContext = null;
        clip.parentialChannel = null;
        clip.hasAttachedToChannel = false;

        clip.stereoPannerNode?.disconnect();
        clip.gainNode?.disconnect();

        clip.DisconnectAllAudioBufferSourceNodes();

        this.audioClips.forEach(function(_clip: AudioClip, index: number) {
            if(clip.id === _clip.id)
                return self.audioClips.splice(index, 1);
        });
    }

    public SetVolume(volume: number): void {
        
        if(!this.gainNode) return Debug.Error("Could not set channel volume because the channel is not attached to a master channel.", [
            "Attach the channel to a master channel before setting the volume."
        ]);

        this.gainNode.gain.setValueAtTime(volume, this.parentialContext!.currentTime);
    }

    public SetPanLevel(pan: number): void {

        if(!this.stereoPannerNode) return Debug.Error("Could not set channel pan level because the channel is not attached to a master channel.", [
            "Attach the channel to a master channel before setting the pan level."
        ]);

        this.stereoPannerNode.pan.setValueAtTime(pan, this.parentialContext!.currentTime);
    }

    public get volume(): number | null {

        if(!this.gainNode) return null;
        return this.gainNode.gain.value;
    }

    public get panLevel(): number | null {

        if(!this.stereoPannerNode) return null;
        return this.stereoPannerNode.pan.value;
    }
}