import { v4 } from "uuid";
import { Channel } from "./Channel";

export class Master {

    public id: string = v4();
    
    public channels: Channel[] = [];
}