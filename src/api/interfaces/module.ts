import { Help } from "../../extensions/help";
import { Command } from "./command";

export interface Module {
    name: string
    group: string
    commands: Command[]
    help?: Help
}