import { Command } from "./command";

export interface Module {
    group: string
    commands: Command[]
}