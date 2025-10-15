import { v4 } from "uuid";

import { Master } from "./Master";

export class AudioDevice {

    public id: string = v4();
    public timestamp: number = Date.now();

    public masterChannel: Master = new Master();

    constructor(public deviceInfo: MediaDeviceInfo) {

    }

    public SetMasterChannel(channel: Master) {
        
    }
}