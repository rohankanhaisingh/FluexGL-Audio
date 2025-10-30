class SoftClipProcessor extends AudioWorkletProcessor {
    clip = null;

    constructor() {
        super();

        this.port.onmessage = async (e) => {
            const { type, wasmUrl } = e.data || {};
            if (type === "init" && wasmUrl) {

                await __wbg_init(wasmUrl);

                this.clip = new SoftClip(1.0);
                this.port.postMessage({ type: "ready" });

            }
        };
    }

    process(inputs, outputs) {
        if (!this.clip) return true;
        const outL = outputs?.[0]?.[0];
        if (outL) this.clip.process(outL);
        return true;
    }
}

registerProcessor("softclip-processor", SoftClipProcessor);