import { v4 } from "uuid";

import { AudioSourceData } from "../../typings";
import { Debug } from "../../utilities/debugger";
import { Channel } from "./Channel";

export class AudioClip {

    public id: string = v4();
    public hasAttachedToChannel: boolean = false;
    public audioBufferSourceNodes: AudioBufferSourceNode[] = [];
    public maxAudioBufferSourceNodes: number = 1;

    declare public gainNode: GainNode;
    declare public stereoPannerNode: StereoPannerNode;

    declare public parentialAudioContext: AudioContext;
    declare public parentialChannel: Channel;

    constructor(public data: AudioSourceData) {}

    private createBufferSource(): AudioBufferSourceNode | null {

        if(!this.parentialAudioContext || !this.gainNode || !this.stereoPannerNode) return null;

        const context = this.parentialAudioContext;

        const bufferSource = context.createBufferSource();
        bufferSource.buffer = this.data.audioBuffer;
        bufferSource.connect(this.stereoPannerNode);

        return bufferSource;
    }

    public InitializeAudioClipOnAttaching(channel: Channel): AudioClip {

        this.gainNode = new GainNode(channel.context);
        this.stereoPannerNode = new StereoPannerNode(channel.context);

        this.gainNode.connect(channel.context.destination);
        this.stereoPannerNode.connect(this.gainNode);

        this.parentialAudioContext = channel.context;
        this.parentialChannel = channel;
        this.hasAttachedToChannel = true;

        return this;
    }

    public Play(timestamp?: number) {

        if (!this.hasAttachedToChannel || !this.parentialAudioContext || !this.parentialChannel) return Debug.Error("Could not play the audio node because it is not attached to a channel", [
            "Call 'AttachAudioNode([node AudioNode])' on a channel, before playing this audio node."
        ]);

        const context = this.parentialAudioContext;
        const self = this;

        if (this.audioBufferSourceNodes.length > this.maxAudioBufferSourceNodes - 1) return;

        const bufferSource: AudioBufferSourceNode | null = this.createBufferSource();

        if(!bufferSource) return Debug.Error("Something went wrong while creating a buffer source.");

        this.audioBufferSourceNodes.push(bufferSource);
        
        bufferSource.start(timestamp);

        bufferSource.addEventListener("ended", function () {

            bufferSource.disconnect();
            self.audioBufferSourceNodes.shift();
        });
    }

    public SetVolume(volume: number): AudioClip | void {

        if(!this.gainNode) return Debug.Error("Something went wrong while setting the volume.", [
            `Gain node on audio clip '${this.id}' is undefined.`
        ]);

        this.gainNode.gain.setValueAtTime(volume, 0);

        return this;
    }

    public SetPanLevel(panLevel: number): AudioClip | void {

        if(!this.stereoPannerNode) return Debug.Error("Something went wrong while setting the pan level", [
            `Stereo panner node on audio clip '${this.id}' is undefined`
        ]);

        this.stereoPannerNode.pan.setValueAtTime(panLevel, 0);

        return this;
    }
}