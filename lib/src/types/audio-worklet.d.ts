export { };

declare global {
    type AWPInputs = Float32Array[][];
    type AWPOutputs = Float32Array[][];
    type AWPParams = Record<string, Float32Array>;

    interface AudioParamDescriptor {
        name: string;
        defaultValue?: number;
        minValue?: number;
        maxValue?: number;
        automationRate?: "a-rate" | "k-rate";
    }

    interface AudioWorkletNodeOptions {
        numberOfInputs?: number;
        numberOfOutputs?: number;
        outputChannelCount?: number[];
        channelCount?: number;
        channelCountMode?: "max" | "clamped-max" | "explicit";
        channelInterpretation?: "speakers" | "discrete";
        parameterData?: Record<string, number>;
        processorOptions?: unknown;
    }

    interface AudioWorkletGlobalScope {
        readonly currentFrame: number;
        readonly currentTime: number;
        readonly sampleRate: number;
        readonly sampleSize?: number;
        readonly crossOriginIsolated?: boolean;

        registerProcessor(
            name: string,
            processorCtor: AudioWorkletProcessorConstructor
        ): void;
    }

    abstract class AudioWorkletProcessor extends EventTarget {
        readonly port: MessagePort;

        static parameterDescriptors?: AudioParamDescriptor[];

        constructor(options?: { processorOptions?: unknown });

        abstract process(
            inputs: AWPInputs,
            outputs: AWPOutputs,
            parameters: AWPParams
        ): boolean;
    }

    interface AudioWorkletProcessorConstructor {
        new(options?: { processorOptions?: unknown }): AudioWorkletProcessor;
        parameterDescriptors?: AudioParamDescriptor[];
    }

    function registerProcessor(
        name: string,
        processorCtor: AudioWorkletProcessorConstructor
    ): void;

    class AudioWorkletNode extends AudioNode {
        readonly parameters: Map<string, AudioParam>;
        readonly port: MessagePort;

        constructor(
            context: BaseAudioContext,
            name: string,
            options?: AudioWorkletNodeOptions
        );
    }

    interface ImportMeta {
        url: string;
    }
}
