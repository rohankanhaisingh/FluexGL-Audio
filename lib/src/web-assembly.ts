import { Master } from "./core/exports";
import { Debug } from "./utilities/debugger";

export let hasInitializedWasm: boolean = false;

export async function LoadWorkletOnMasterChannel(master: Master) {

    const context: AudioContext = master.context;
    
    Debug.Log("Loading worklet modules on master channel...", [
        `Channel ID: ${master.id}`
    ]);

    const url = new URL("./processors/SoftClipProcessor.ts", import.meta.url);
    console.log(url);

    await context.audioWorklet.addModule(new URL("./processors/SoftClipProcessor.ts", import.meta.url));
}