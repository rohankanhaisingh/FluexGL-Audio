import { Effector } from "../../core/classes/Effector";

export class SoftClip extends Effector {

    public drive: number = 1;

    public async Initialize(): Promise<void> {

    }

    public async InitializeOnAttachment(parentialContext: AudioContext): Promise<void> {

        this.parentialContext = parentialContext;

        this.gainNode = this.parentialContext.createGain();

        this.gainNode.gain.value = 1;
    }

    public Process(buffer: Float32Array): void {

        // Simple soft clipping algorithm

    }

    public SetDrive(drive: number): void {  
        this.drive = drive;
    }
}