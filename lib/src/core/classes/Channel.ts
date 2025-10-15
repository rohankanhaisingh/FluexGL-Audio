import { v4 } from "uuid";
import { Effector } from "./Effector";

export class Channel {

    public id: string = v4();

    public effects: Effector[] = [];
}