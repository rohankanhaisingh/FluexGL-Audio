# AudioClip

## About
The `AudioClip` class is part of the **FluexGL DSP** library. It represents a playable piece of audio (buffer + metadata) and acts as the *source* for channels. An `AudioClip` must be **attached to a [`Channel`](./Channel.md)** before it can be played, analysed, or routed. Without being attached to a channel, most operations will fail with a helpful `Debug.Error` message.

---

## Quick start
```ts
import { LoadAudioSource, AudioClip } from "@fluexgl/dsp";

const source = await LoadAudioSource("/assets/song.wav");

const clip = new AudioClip(source);

channel.AttachAudioClip(clip);

clip.Play();
```

> **Tip:** You can enable a *pre* and/or *post* analyser to read waveform data for visualizations (see **Analysers**).

---

## Constructor
### Signature
```ts
new AudioClip(data: AudioSourceData);
```

### Parameters
- `data: AudioSourceData` – Created by [`LoadAudioSource(path: string)`](../helpers/LoadAudioSource.md). It carries the decoded `AudioBuffer` and original `ArrayBuffer` plus basic metadata.

---

## Properties
| Name | Type | Description |
|---|---|---|
| `id` | `string` | Unique, auto‑generated UUID for the clip. |
| `loop` | `boolean` | If `true`, the created `AudioBufferSourceNode`(s) will loop. Default `false`. |
| `isPlaying` | `boolean` | `true` while the primary buffer source is playing. |
| `parentialAudioContext` | `AudioContext \| null` | The context from the channel this clip is attached to. |
| `parentialChannel` | `Channel \| null` | The channel this clip is attached to. |
| `gainNode` | `GainNode \| null` | Per‑clip gain stage inserted by the channel on attach. |
| `stereoPannerNode` | `StereoPannerNode \| null` | Per‑clip stereo panner inserted by the channel on attach. |
| `preAnalyser` / `postAnalyser` | `AnalyserNode \| null` | Optional analysers (upstream/downstream of clip routing). |
| `preAnalyserEnabled` / `postAnalyserEnabled` | `boolean` | Flags indicating whether each analyser is in the node chain. |

### Read‑only getters
| Getter | Type | Description |
|---|---|---|
| `currentPlaybackTime` | `number` | Seconds since the most recent `Play()` (including `offset`). |
| `duration` | `number` | Duration (seconds) derived from `AudioBuffer.duration`. |
| `formattedDuration` | `string` | Human friendly `"mm:ss"` format. |
| `sampleRate` | `number` | Clip’s `AudioBuffer.sampleRate`. |
| `numberOfChannels` | `number` | Clip’s `AudioBuffer.numberOfChannels`. |
| `byteLength` | `number` | Size (bytes) of the original `ArrayBuffer` in `AudioSourceData`. |

---

## Methods
> Unless noted otherwise, methods return the `AudioClip` instance for chaining or `null/false` on failure.

### Playback
```ts
Play(timestamp?: number, offsetSeconds?: number): AudioClip | null
Stop(): AudioClip | null
Loop(loop?: boolean): AudioClip
SetMaxAudioBufferSourceNodes(value: number): AudioClip
DisconnectAllAudioBufferSourceNodes(): boolean
```
- **`Play(timestamp?, offset=0)`** – Creates a new `AudioBufferSourceNode`, wires it into the chain, and starts playback. Fails if the clip is not attached to a channel or if the internal limit of buffer sources is reached (default = 1).
- **`Stop()`** – Stops and disconnects all active buffer sources for this clip.
- **`Loop(loop?)`** – Enables/disables looping for subsequently created buffer sources. If `loop` is omitted it defaults to `true`.
- **`SetMaxAudioBufferSourceNodes(n)`** – Advanced: allow more simultaneous sources (e.g., overlapping retriggers). Comes with a warning as it may change behaviour; default is `1`.
- **`DisconnectAllAudioBufferSourceNodes()`** – Immediately stops/disconnects every buffer source owned by the clip.

### Level & Panning
```ts
SetVolume(volume: number): AudioClip | void           // gain in linear [0..∞)
SetPanLevel(pan: number): AudioClip | void            // -1 (L) .. 0 (C) .. +1 (R)
```
- Returns `void` and logs a `Debug.Error` if the clip isn’t attached (missing nodes/context) or if `pan` is outside `[-1, 1]`.

### Data access
```ts
GetChannelData(channel?: number): Float32Array
```
- Returns the raw PCM channel data from the underlying `AudioBuffer` (read‑only view).

### Analysers
```ts
EnablePreAnalyser(): boolean
DisablePreAnalyser(): boolean
EnablePostAnalyser(): boolean
DisablePostAnalyser(): boolean

SetPreAnalyserOptions(options: AnalyserOptions): void
SetPostAnalyserOptions(options: AnalyserOptions): void
SetAnalyserOption(type: "pre" | "post", property: "fftSize" | "minDecibels" | "maxDecibels" | "smoothingTimeConstant", value: number): boolean

GetWaveformFloatData(type: "pre" | "post"): Float32Array | null
GetWaveformByteData(type: "pre" | "post"): Uint8Array | null
```
- *Pre* = analyser placed **before** the clip’s gain/pan; *Post* = analyser **after** routing.
- `SetPre/PostAnalyserOptions` accepts a subset of standard `AnalyserOptions` and applies changes immediately if an analyser exists.
- `GetWaveform*Data` returns *time‑domain* data suitable for oscilloscope‑style visualizations. Call each render tick to update a canvas/plot.
- If an analyser is not enabled, methods return `null` and a `Debug.Error` is logged with a remediation hint.

### Events
```ts
AddEventListener<K extends keyof AudioClipEventMap>(event: K, cb: AudioClipEventMap[K]): () => void
Once<K extends keyof AudioClipEventMap>(event: K, cb: AudioClipEventMap[K]): () => void
RemoveEventListener<K extends keyof AudioClipEventMap>(event: K, cb: AudioClipEventMap[K]): boolean
ClearEventListeners(event?: keyof AudioClipEventMap): AudioClip
```
- **Supported events**
  - `"progress"` – Fired roughly every ~20ms while playing. Useful payload fields include:
    - `current` (seconds), `duration` (seconds), `formatted` (`"mm:ss"`), and the clip `id`.
- `AddEventListener` returns an **unsubscribe** function. `Once` auto‑removes after first call.

---

## Behaviour & lifecycle notes
- A clip is inert until **attached** to a `Channel`. The attachment step wires up the per‑clip `GainNode`, `StereoPannerNode`, and optional analysers; it also stores the parent `AudioContext`.
- Calling `Play()` while already playing will create another `AudioBufferSourceNode` **only** if `SetMaxAudioBufferSourceNodes(n)` allowed more than 1.
- `currentPlaybackTime` is derived from `AudioContext.currentTime`, the last `startTime`, and the `offset` you supplied to `Play()`.
- Errors and warnings are routed through `Debug.Error` / `Debug.Warn` with clear remediation hints (e.g., “Attach the clip to a channel first”).

---

## Example: visualizing the post‑signal waveform
```ts
clip.EnablePostAnalyser();
clip.SetPostAnalyserOptions({ fftSize: 2048, smoothingTimeConstant: 0.85 });

function render() {
  const data = clip.GetWaveformByteData("post");
  if (data) drawOscilloscope(data); // your canvas code
  requestAnimationFrame(render);
}
render();
```

---

## Types & references
- [`Channel`](./Channel.md) – where `AudioClip` instances are attached and routed.
- [`AudioSourceData`](../interfaces/AudioSourceData.md) – input type for the constructor.
- [`LoadAudioSource`](../helpers/LoadAudioSource.md) – helper that yields `AudioSourceData` for constructor input.