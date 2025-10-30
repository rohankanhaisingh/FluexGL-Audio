import { Master } from "./core/exports";
import { Debug } from "./utilities/debugger";
import { ConstructProcessorWorklet } from "./utilities/helpers";
import { ProcessorWorklets } from "./processors/exports";

export let hasInitializedWasm: boolean = false;
export let compiledWebAssemblyModule: WebAssembly.Module | null = null;

export async function LoadWebAssemblyModule(path: string): Promise<WebAssembly.Module> {

    return new Promise(function(resolve, reject) {

        WebAssembly.compileStreaming(fetch(path)).then(function(module: WebAssembly.Module) {
            compiledWebAssemblyModule = module;
            resolve(module);
        }).catch(function(error: Error) {
            reject(error);
        });
    })
}

export async function LoadWorkletOnMasterChannel(master: Master) {

    const context: AudioContext = master.context,
        start: number = Date.now();
    
    Debug.Log("Loading worklet modules on master channel...", [
        `Channel ID: ${master.id}`
    ]);

    await ProcessorWorklets.MinifyProcessorWorkletCode();

    const worklets = [
        context.audioWorklet.addModule(ConstructProcessorWorklet(ProcessorWorklets.ChorusProcessor)),
        context.audioWorklet.addModule(ConstructProcessorWorklet(ProcessorWorklets.DistortionProcessor)),
        context.audioWorklet.addModule(ConstructProcessorWorklet(ProcessorWorklets.EqualizerProcessor)),
        context.audioWorklet.addModule(ConstructProcessorWorklet(ProcessorWorklets.FilterProcessor)),
        context.audioWorklet.addModule(ConstructProcessorWorklet(ProcessorWorklets.LimiterProcessor)),
        context.audioWorklet.addModule(ConstructProcessorWorklet(ProcessorWorklets.SaturationProcessor)),
        context.audioWorklet.addModule(ConstructProcessorWorklet(ProcessorWorklets.SoftClipProcessor)),
        context.audioWorklet.addModule(ConstructProcessorWorklet(ProcessorWorklets.StereoPannerProcessor))
    ]

    await Promise.all(worklets);

    const end: number = Date.now(),
        difference: number = end - start;

    Debug.Log("Succesfully loaded audio processor worklets into master channel.", [
        `Executed in ${difference}ms.`,
        `Added ${worklets.length} processor worklets into ${master.id}.`
    ]);

    const softClipNode = new AudioWorkletNode(context, "SoftClipProcessor", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
        parameterData: {
            drive: 1
        },
        processorOptions: {
            module: compiledWebAssemblyModule
        }
    });

    return true;
}