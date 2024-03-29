import { Collection, Message, MessageEmbed } from 'discord.js'
import { RequireChannel } from '../preconditions/requireChannel'
import { Command } from '../api/interfaces/command'
import { Colors } from '../api/types/colors'
import { Config } from '../config'
import { Module } from '../api/interfaces/module'

// modules
import { Helper } from "../modules/helper"
import { Moderations } from "../modules/moderations"
import { Debug } from '../modules/debug'
import { Upload } from '../modules/upload'
import { Profile } from '../modules/profile'
import { Logger } from './logger'
//

export class CommandHandler {
    public get modules(): Collection<string, Module> { return this._modules }

    private _modules: Collection<string, Module>

    public readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;

        const mod = new Moderations(logger)
        const dev = new Debug(logger)
        const upload = new Upload(logger)
        const profile = new Profile()
        const helper = new Helper(logger, profile)

        this._modules = new Collection([
            [dev.name, dev],
            [mod.name, mod],
            [upload.name, upload],
            [profile.name, profile],
            [helper.name, helper]
        ])
    }

    async handleMessage(message: Message): Promise<void> {
        const { channel, guild, author } = message
        const config = new Config()

        if (author.bot || !message.content.startsWith(config.prefix)) return

        let messageContent = message.content.slice(config.prefix.length)

        const { module, command, content } = this.getModuleAndCommand(messageContent)

        // check if command exist
        if (!command) return

        const regex = /"[^"]+"|[^\\ ]+/gm
        const args: string[] = []

        messageContent  = this.removeCommandName(content, command)

        if (messageContent.length > 0) {
            messageContent.match(regex).forEach(element => {
                return args.push(element.replace(/"/g, ''))
            })
        }

        // check guild only
        if (command.guildonly && !guild) {
            await channel.send({
                embeds: [new MessageEmbed({
                    color: Colors.Error,
                    description: 'Polecenia można używać jedynie na serwerze'
                })]
            })
            return
        }

        // log of command
        this.logger.HandleMessage(`[Command Handler] Command: ${command.name} by: ${author.tag}`, false)

        if (command.precondition && !(await command.precondition(message))) return

        if (!(await RequireChannel(message, command.channelType))) return

        // check arguments for this command
        if (command.requireArgs && !args.length) {
            this.getCommand('help', this.getModuleName(module)).execute(message, [command.name])
            return
        }

        try {
            await command.execute(message, args)
        } catch (exception) {
            await message.reply({
                embeds: [new MessageEmbed({
                    color: Colors.Error,
                    description: 'Wystąpił nieoczekiwany błąd. Zgłoś go do administracji!'
                })]
            })
            
            this.logger.HandleMessage(`[Command ${command.name}] Error: ${exception}`)
        }
    }

    public isCommand(messageContent: string): boolean {
        const { prefix } = new Config()
        if (!messageContent.startsWith(prefix)) return false
        const { command } = this.getModuleAndCommand(messageContent.slice(prefix.length).toLowerCase())
        if (!command) return false
        return true
    }

    public getModuleName(module: Module): string {
        return this._modules.findKey(_module => _module === module)
    }

    private getCommand(commandName: string, moduleName: string): Command {
        return this._modules.get(moduleName).commands.find(command => commandName.startsWith(command.name) || (command.aliases && command.aliases.find(alias => commandName.startsWith(alias))))
    }

    private getModuleAndCommand(messageContent: string): { module: Module, command: Command, content: string } {
        let command: Command
        let content: string
        const module = this.modules.find(_module => {
            if (!messageContent.startsWith(_module.group)) return false
            content = _module.group.length > 1 ? messageContent.slice(_module.group.length + 1) : messageContent
            command = _module.commands.find(command => content.startsWith(command.name) || (command.aliases && command.aliases.find(alias => content.startsWith(alias))))
            return command !== undefined
        })
        return { module, command, content }
    }

    private removeCommandName(content: string, command: Command): string {
        const regex = new RegExp(`(${command.name}${command.aliases ? '|' + command.aliases.join('|') : ''})`, 'm')
        return content.replace(regex, command.name).slice(command.name.length)
    }
}