import init, { SoftClip } from "../_dist/wasm/fluex_dsp";

let wasmInitialized = false;

export namespace FluexGLWasmDSP { 

    export async function InitializeModule(): Promise<void> {
        
        if(!wasmInitialized) {

            await init();
            wasmInitialized = true;
        }
    }

    export async function CreateSoftClipEffect(drive: number = 1) {

        await InitializeModule();
        return new SoftClip(drive);
    }
}