import { v4 } from "uuid";

import { Master } from "./Master";

import { ErrorCodes } from "../../console-codes";
import { Debug } from "../../utilities/debugger";

export class AudioDevice {

    public id: string = v4();
    public timestamp: number = Date.now();

    public masterChannel: Master = new Master();
    public masterChannels: Master[] = [];

    constructor(public deviceInfo: MediaDeviceInfo) {}

    public GetMasterChannel(): Master {
        return this.masterChannel;
    }

    public SetMasterChannel(channel: Master): void {
        
        if(channel.id === this.masterChannel.id) return Debug.Error("The provided master channel is the same as the current channel.", [
            "Provide this method with a different master channel.",
            `Received master channel ID ${channel.id}.`     
        ], ErrorCodes.SAME_MASTER_CHANNEL);

        this.masterChannel = channel;
    }

    public CreateMasterChannel(): Master {

        const master = new Master();

        this.masterChannels.push(master);
        return master;
    }
}