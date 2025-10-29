import init, { SoftClip } from "../_dist/wasm/fluex_dsp";
import { Debug } from "./utilities/debugger";

let wasmInitialized = false;

export namespace FluexGLWasmDSP { 

    export async function InitializeModule(): Promise<void> {
        
        if(!wasmInitialized) {

            await init();
            wasmInitialized = true;
        }
    }

    export function CreateSoftClipEffect(drive: number = 1): SoftClip | void {
        return wasmInitialized ? new SoftClip(drive) : Debug.Error("Could not create SoftClip effect because WASM module is not initialized", [
            "Call 'await FluexGLWasmDSP.InitializeModule()' and wait for it to complete before creating any WASM based effects."
        ]);
    }
}