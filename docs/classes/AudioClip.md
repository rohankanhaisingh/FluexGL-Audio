# AudioClip

## About 
The AudioClip class is part of the FluexGL DSP library, and is seen as the input of playing any kind of audio. Any AudioClip instances should be attached to a [``Channel``](./Channel.md) in order to be used. Without being attached to a channel, the AudioClip cannot be used in any way.

## Constructor

### Interface
```ts
new AudioClip(data: AudioSourceData): AudioClip;
```

### Parameters

- ``data``: [``AudioSourceData``](../interfaces/AudioSourceData.md) -
This data comes from the [``LoadAudioSource(path: string)``](../helpers/LoadAudioSource.md) function.

## Properties

### id
```ts
id: string;
```

An unique generated ID.