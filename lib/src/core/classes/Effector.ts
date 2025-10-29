import { v4 } from "uuid";

export abstract class Effector {
    
    public id: string = v4();
    public label: string | null = null;

    public gainNode: GainNode | null = null;

    public parentialContext: AudioContext | null = null;

    protected wasmInstance: any;

    public InitializeOnAttachment(parentialContext: AudioContext): void {

    }

    public abstract Initialize(): Promise<void>;
    public abstract Process(buffer: Float32Array): void;
}