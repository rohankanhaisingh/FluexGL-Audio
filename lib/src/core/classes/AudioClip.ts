import { v4 } from "uuid";

import { AudioSourceData } from "../../typings";
import { Debug } from "../../utilities/debugger";
import { Channel } from "./Channel";

export class AudioClip {

    public id: string = v4();
    public hasAttachedToChannel: boolean = false;
    public audioBufferSourceNodes: AudioBufferSourceNode[] = [];
    public maxAudioBufferSourceNodes: number = 1;

    declare public parentialAudioContext: AudioContext;
    declare public parentialChannel: Channel;

    constructor(public data: AudioSourceData) {}

    private createBufferSource(): AudioBufferSourceNode | null {

        if(!this.parentialAudioContext) return null;

        const context = this.parentialAudioContext;

        const bufferSource = context.createBufferSource();
        bufferSource.buffer = this.data.audioBuffer;
        bufferSource.connect(context.destination);

        return bufferSource;
    }

    public InitializeAudioClipOnAttaching(channel: Channel): AudioClip {

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
}