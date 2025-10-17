import { v4 } from "uuid";

import { Effector } from "./Effector";
import { AudioClip } from "./AudioClip";

import { ChannelOptions, AudioSourceData } from "../../typings";
import { Debug } from "../../utilities/debugger";

export class Channel {

    public id: string = v4();
    public effects: Effector[] = [];
    public context: AudioContext = new AudioContext();

    public label: string | null;

    public audioClips: AudioClip[] = [];

    constructor(public options: Partial<ChannelOptions> = {
        maxAudioNodes: 8,
        maxEffects: 8
    }) {

        this.label = options.label ?? null;
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

        clip.audioBufferSourceNodes.forEach(function(node: AudioBufferSourceNode) {
            node.disconnect();
        });

        this.audioClips.forEach(function(_clip: AudioClip, index: number) {
            if(clip.id === _clip.id)
                return self.audioClips.splice(index, 1);
        });
    }
}