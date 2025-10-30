import init, { SoftClip } from "../_dist/wasm/fluex_dsp";

import { Debug } from "./utilities/debugger";

let wasmInitialized = false;

export namespace FluexGLWasmDSP { 

    export const physicalWasmFilePath = new URL("../_dist/wasm/fluex_dsp_bg.wasm", import.meta.url);
    export const physicalWasmJsFilePath = new URL("../_dist/wasm/fluex_dsp.js", import.meta.url);

    export let pathToWasm: string | null = null;

    /**
     * Sets the path to the WASM file located in the server.
     * @param path 
     */
    export function SetPathToWasmFileInServer(path: string): void {
        pathToWasm = path;
    }

    export async function InitializeModule(): Promise<void> {
        
        if(!wasmInitialized) {

            const output = await init();

            wasmInitialized = true;
        }
    }

    export function CreateSoftClipEffect(drive: number = 1): SoftClip | void {
        return wasmInitialized ? new SoftClip(drive) : Debug.Error("Could not create SoftClip effect because WASM module is not initialized", [
            "Call 'await FluexGLWasmDSP.InitializeModule()' and wait for it to complete before creating any WASM based effects."
        ]);
    }
}