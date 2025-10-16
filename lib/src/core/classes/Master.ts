import { v4 } from "uuid";

import { Channel } from "./Channel";

import { Debug } from "../../utilities/debugger";

export class Master {

    public id: string = v4();
    public channels: Channel[] = [];
    public context: AudioContext = new AudioContext();

    public AttachChannel(channel: Channel): void {

        if(this.channels.includes(channel)) return Debug.Error("Could not attach the channel because it is already part of this master channel.",[
            "Call .DetachChannel([channel Channel]) before attaching the channel."
        ]);

        this.channels.push(channel);

        return;
    }

    public DetachChannel(channel: Channel): void {

        if(!this.channels.includes(channel)) return Debug.Error("Could not detach the channel because it is not part of this master channel.", [
            "Call .AttachChannel([channel Channel]) before detaching the channel."
        ]);

        const self = this;

        this.channels.forEach(function(_channel: Channel, index: number) {
            if(channel.id === _channel.id)
                return self.channels.splice(index, 1);
        });
    }
}