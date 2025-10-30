declare module "../_dist/wasm/fluex_dsp.js" {
    
  export default function init(module_or_path?: any): Promise<any>;

  export class SoftClip {
    constructor(drive: number);
    process(buffer: Float32Array): void;
    get_drive(): number;
    set_drive(drive: number): void;
    free(): void;
    [Symbol.dispose](): void;
  }

  export function dsp_version(): string;
}