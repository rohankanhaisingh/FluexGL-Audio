import { Effector } from "../../core/classes/Effector";

export class SoftClip extends Effector {

    public drive: number = 1;

    public Process(buffer: Float32Array): void {

        // Simple soft clipping algorithm

    }

    public SetDrive(drive: number): void {  
        this.drive = drive;
    }
}