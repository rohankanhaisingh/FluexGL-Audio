import { v4 } from "uuid";

import { Effector } from "./Effector";
import { ChannelOptions } from "../../typings";

export class Channel {

    public id: string = v4();
    public effects: Effector[] = [];
    public context: AudioContext = new AudioContext();

    public label: string | null;

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
}