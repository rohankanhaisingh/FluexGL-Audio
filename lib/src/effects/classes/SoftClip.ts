import { Effector } from "../../core/classes/Effector";
import { FluexGLWasmDSP } from "../../wasm";

export class SoftClip extends Effector {

    public drive: number = 1;

    public async Initialize(): Promise<void> {

        this.wasmInstance = await FluexGLWasmDSP.CreateSoftClipEffect(this.drive);
    
        console.log(this.wasmInstance);
    }

    public Process(buffer: Float32Array): void {

        // Simple soft clipping algorithm

    }

    public SetDrive(drive: number): void {  
        this.drive = drive;
    }
}