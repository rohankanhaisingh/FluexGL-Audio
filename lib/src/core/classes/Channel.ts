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

        if(this.audioClips.includes(clip)) return Debug.Error("Could not attach audio node because it is already part of this channel", [
            "Call .DetachAudioNode([node AudioNode]) before attaching audio node."
        ]);

        clip.InitializeAudioClipOnAttaching(this);
        this.audioClips.push(clip);
    }
}