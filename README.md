# 🎚️ FluexGL DSP
An open-source, web-based DSP library developed alongside FluexGL, with the purpose of creating and manipulating sound in various contexts.

This open-source project is part of the Fluex ecosystem and is maintained by Rohan Kanhaisingh, the lead developer of this library.

**Note: this project is still under development and may not work yet.**

## 🧩 About
FluexGL DSP is a modern, TypeScript-based Web Audio library for creating and manipulating sound. Inspired by and based on DAW-style workflows, it provides a flexible, object-oriented channel system with master and sub channels.

It integrates smoothly with FluexGL, making it ideal for use in games, interactive web experiences, and multimedia projects.

## 📦 Installation

```
$ npm install @fluexgl/dsp
```

## ⚡ Quick start

```ts
import { 
    AudioDevice, 
    InitializeDspPipeline, 
    LoadAudioSource, 
    ResolveDefaultAudioOutputDevice, 
    Channel, 
    AudioSourceData, 
    AudioClip 
} from "@fluexgl/dsp";

(async function() {

    // Make sure that FluexGL can access audio devices.
    const hasInitialized = await InitializeDspPipeline();

    if(!hasInitialized) return null;

    // Resolves the default audio output device.
    const audioDevice: AudioDevice | null = await ResolveDefaultAudioOutputDevice();

    if(!audioDevice) return;

    // Get the master channel from the default audio output device.
    const masterChannel = audioDevice.GetMasterChannel();

    // Create a new empty channel.
    const channel = new Channel();

    // Label the channel as 'BackgroundMusic'.
    channel.SetLabel("BackgroundMusic");

    // Attach the 'BackgroundMusic' channel, to the device's master channel.
    masterChannel.AttachChannel(channel);

    // Load the data from the audio source.
    const audioSourceData: AudioSourceData | null = await LoadAudioSource("/assets/data/bruh.mp3");

    if(!audioSourceData) return;

    // Create a audio node based on the data.
    const audioClip = new AudioClip(audioSourceData);

    // Attach the audio node to the channel.
    channel.AttachAudioClip(audioClip);

    // Click event listener on window.
    window.addEventListener("click", function() {

        // Play the audio clip
        audioClip.Play();
    });
})();
```

## 💡 Effects, tools and more
FluexGL DSP provides built-in such as effects, tools, and utilities for advanced web audio processing, such as reverbs, delays, and stereo imaging effects.

The library also includes a powerful debugging system that allows developers to inspect and analyze the audio pipeline for easier troubleshooting and optimization.

## Web Assembly

FluexGL DSP is partially made using Web Assembly, and Rust as programming language. In order to use FluexGL DSP, the wasm source code must be built, which can be done using the following steps.

### Requirements

The Rust toolchainer must be installed, in order to install the other tools.

```
$ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

```
$ rustup target add wasm32-unknown-unknown
```

```
$ cargo install wasm-bindgen-cli
```

```
$ cargo install wasm-pack
```

Optional:
```
$ sudo apt-get install -y binaryen
```

### NPM scripts

This command will build the entire project.
```
$ npm run build
```