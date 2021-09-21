import { MessageEmbed } from "discord.js"
import { Colors } from "../api/colors"
import { Command } from "../api/command"
import { Module } from "../api/module"
import { Config } from "../config"

export class Help {
    private modules: Module[]

    constructor(...modules: Module[]) {
        this.modules = modules
    }

    public getHelp(commandName?: string): MessageEmbed[] {
        const config = new Config()

        if (!commandName) {
            const { group } = this.modules[0]
            const prefix = group.length > 1 ? `${config.prefix}${group} ` : config.prefix
            return [new MessageEmbed({
                color: Colors.Info,
                fields: this.modules.map(module => { return { name: `List of ${module.name} commands:`, value: module.commands.map(command => command.name).join(", ") } }),
                footer: { text: `To show informations about specific command use: ${prefix}help <command name>` },
            })]
        }

        const { module, command } = this.getModuleAndCommand(commandName)

        if (!command) {
            return [new MessageEmbed({
                color: Colors.Error,
                description: 'Specified command not found',
            })]
        }

        const prefix = module.group.length > 1 ? `${config.prefix}${module.group} ` : config.prefix
        const data = []

        const title = `**Command name:** ${command.name}`

        if (command.aliases) data.push({ name: "**Aliases:**", value: `${command.aliases.join(', ')}` })
        if (command.description) data.push({ name: "**Description:**", value: `${command.description}` })
        if (command.usage) data.push({ name: "**Usage:**", value: `${prefix}${command.name} ${command.usage}` })

        return [new MessageEmbed({
            color: Colors.Info,
            title: title,
            fields: data,
        })]
    }

    private getModuleAndCommand(commandName: string): { module: Module, command: Command } {
        let command: Command
        const module = this.modules.find(_module => {
            command = _module.commands.find(_command => _command.name === commandName || (_command.aliases && _command.aliases.includes(commandName)))
            return command !== undefined
        })
        return { module, command }
    }
}