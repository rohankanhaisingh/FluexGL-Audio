import { v4 } from "uuid";
import { format } from "date-fns";

import { AudioClipEventMap, AudioClipEvents, AudioSourceData } from "../../typings";
import { Debug } from "../../utilities/debugger";
import { Channel } from "./Channel";

type ProgressPayload = Parameters<AudioClipEventMap["progress"]>[0];

export class AudioClip {

    public id: string = v4();
    public hasAttachedToChannel: boolean = false;

    public loop: boolean = false;
    public isPlaying: boolean = false;
    public startTime: number = 0;
    public offsetAtStart: number = 0;

    public gainNode: GainNode | null = null;
    public stereoPannerNode: StereoPannerNode | null = null;

    public parentialAudioContext: AudioContext | null = null;
    public parentialChannel: Channel | null = null;

    private audioBufferSourceNodes: AudioBufferSourceNode[] = [];
    private maxAudioBufferSourceNodes: number = 1;

    private progressInterval: number | null = 0;

    private events: AudioClipEvents = {
        "progress": []
    }

    constructor(public data: AudioSourceData) { }

    // Private methods.

    private createBufferSource(): AudioBufferSourceNode | null {

        if (!this.parentialAudioContext || !this.gainNode || !this.stereoPannerNode) return null;

        const context = this.parentialAudioContext;

        const bufferSource = context.createBufferSource();
        bufferSource.buffer = this.data.audioBuffer;
        bufferSource.connect(this.stereoPannerNode);

        bufferSource.loop = this.loop;

        return bufferSource;
    }

    // Public methods

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

    public Play(timestamp?: number, offset = 0) {

        if (!this.hasAttachedToChannel || !this.parentialAudioContext || !this.parentialChannel) return Debug.Error("Could not play the audio node because it is not attached to a channel", [
            "Call 'AttachAudioClip([node AudioNode])' on a channel, before playing this audio node."
        ]);

        const context = this.parentialAudioContext;
        const self = this;

        if (this.audioBufferSourceNodes.length > this.maxAudioBufferSourceNodes - 1) return;

        const bufferSource: AudioBufferSourceNode | null = this.createBufferSource();

        if (!bufferSource) return Debug.Error("Something went wrong while creating a buffer source.");

        this.startTime = context.currentTime;
        this.offsetAtStart = offset;
        this.isPlaying = true;

        if(this.progressInterval) clearInterval(this.progressInterval);

        if(this.isPlaying) this.progressInterval = setInterval(function() {

            if(!self.isPlaying) return;

            const current = self.offsetAtStart + (context.currentTime - self.startTime);
            const date: Date = new Date(current * 1000);

            const formattedTime = format(date, "mm:ss");

            const progressPayload: ProgressPayload = {
                current: parseFloat(current.toFixed(2)),
                startTime: self.startTime,
                offset: self.offsetAtStart,
                contextTimestamp: context.currentTime,
                formatted: formattedTime
            }

            self.events.progress.forEach(function(cb: (event: ProgressPayload) => void) {
                cb(progressPayload);
            });
        }, 20);

        bufferSource.start(timestamp ?? this.startTime, offset);

        bufferSource.addEventListener("ended", function () {

            const i = self.audioBufferSourceNodes.indexOf(bufferSource);

            bufferSource.disconnect();

            if (i === 0) self.isPlaying = false;

            if (i >= 0)
                return self.audioBufferSourceNodes.splice(i, 1);

        });

        this.audioBufferSourceNodes.push(bufferSource);
    }

    public Stop() {

        if (!this.hasAttachedToChannel || !this.parentialAudioContext) return Debug.Error("Could not stop the audio node because it is not attached to a channel", [
            "Call 'AttachAudioClip([node AudioNode])' on a channel, before stopping this audio node."
        ]);

        this.audioBufferSourceNodes.forEach(function (node: AudioBufferSourceNode) {

            node.stop();
            node.disconnect();
        });

        this.audioBufferSourceNodes.length = 0;
        this.isPlaying = false;

        if (this.progressInterval) {

            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }

		return this;
    }

    public SetVolume(volume: number): AudioClip | void {

        if (!this.gainNode || !this.parentialAudioContext) return Debug.Error("Something went wrong while setting the volume.", [
            `Gain node on audio clip '${this.id}' is undefined.`
        ]);

        this.gainNode.gain.setValueAtTime(volume, this.parentialAudioContext.currentTime);

        return this;
    }

    public SetPanLevel(panLevel: number): AudioClip | void {

        if (!this.stereoPannerNode || !this.parentialAudioContext) return Debug.Error("Something went wrong while setting the pan level", [
            `Stereo panner node on audio clip '${this.id}' is undefined`
        ]);

        if (panLevel < -1 || panLevel > 1) return Debug.Error("Could not set the pan level because it is not between -1 and 1.", [
            "Provide this method with a value between -1 and 1"
        ]);

        this.stereoPannerNode.pan.setValueAtTime(panLevel, this.parentialAudioContext.currentTime);

        return this;
    }

    public Loop(loop?: boolean) {

        this.audioBufferSourceNodes.forEach(function (node: AudioBufferSourceNode) {
            node.loop = loop ?? true;
        });

        return this.loop = loop ?? true;
    }

    public SetMaxAudioBufferSourceNodes(value: number) {

        Debug.Warn("Changing the amount of buffer source nodes may cause some properties of this class instance to work inproperly.", [
            "The default value is 1."
        ]);

        return this.maxAudioBufferSourceNodes = value;
    }

    public DisconnectAllAudioBufferSourceNodes(): void {
        return this.audioBufferSourceNodes.forEach(function (node: AudioBufferSourceNode) {
            node.disconnect();
        });
    }

    public AddEventListener<K extends keyof AudioClipEventMap>(event: K, cb: AudioClipEventMap[K]): () => void {

        this.events[event].push(cb);

        return () => this.RemoveEventListener(event, cb);
    }

    public Once<K extends keyof AudioClipEventMap>(event: K, cb: AudioClipEventMap[K]): () => void {

        const wrapper = ((...args: unknown[]) => {

            // @ts-ignore
            cb(...args);

            this.RemoveEventListener(event, wrapper as unknown as AudioClipEventMap[K]);
        }) as unknown as AudioClipEventMap[K];

        return this.AddEventListener(event, wrapper);
    }

    public RemoveEventListener<K extends keyof AudioClipEventMap>(event: K, cb: AudioClipEventMap[K]): AudioClip {

        const arr = this.events[event];

        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === cb) {
                arr.splice(i, 1);
                break;
            }
        }
        return this;
    }

    public ClearEventListeners(event?: keyof AudioClipEventMap): AudioClip {

        if (event) {
            this.events[event].length = 0;
        } else {
            (Object.keys(this.events) as (keyof AudioClipEventMap)[]).forEach((k) => (this.events[k].length = 0));
        }

        return this;
    }

    // Public getters and setters

    public get currentPlaybackTime(): number {
        return (!this.isPlaying || !this.parentialAudioContext)
            ? 0
            : this.offsetAtStart + (this.parentialAudioContext.currentTime - this.startTime);
    }

    public get duration(): number {
        return this.data.audioBuffer.duration;
    }
    
    public get formattedDuration(): string {

        const date = new Date(this.duration * 1000);

        return format(date, "mm:ss");
    }

    public get sampleRate(): number {
        return this.data.audioBuffer.sampleRate;
    }
    
    public get numberOfChannels(): number {
        return this.data.audioBuffer.numberOfChannels;
    }

    public get byteLength(): number {
        return this.data.arrayBuffer.byteLength;
    }
}