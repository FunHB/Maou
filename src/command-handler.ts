import { Collection, Message, MessageEmbed } from 'discord.js'
import { RequireChannel } from './preconditions/requireChannel'
import { Command } from './api/command'
import { Colors } from './api/colors'
import { Config } from './config'

// modules
import { Helper } from "./modules/helper"
import { Moderations } from "./modules/moderations"
import { Debug } from './modules/debug'
import { Upload } from './modules/upload'
//

export class CommandHandler {

    public get commands(): Collection<string, Command[]> { return this._commands }

    private _commands: Collection<string, Command[]>

    constructor() {
        const helper = new Helper()
        const mod = new Moderations()
        const dev = new Debug()
        const upload = new Upload()

        this._commands = new Collection([
            [dev.group, dev.commands],
            [mod.group, mod.commands],
            [upload.group, upload.commands],
            [helper.group, helper.commands]     // Helper module MUST be the last element of Collection
        ])
    }

    async handleMessage(message: Message): Promise<void> {
        const { channel, guild, author } = message
        const config = new Config()

        if (author.bot || !message.content.startsWith(config.prefix)) return

        let messageContent = message.content.slice(config.prefix.length)

        const group = this.getModule(messageContent.toLowerCase())

        if (group.length > 1) messageContent = messageContent.slice(group.length + 1)

        const command = this.getCommand(messageContent.toLowerCase(), group)

        // check if command exist
        if (!command) return

        const regex = /"[^"]+"|[^\\ ]+/gm
        const args: string[] = []

        messageContent = this.fixedMessageContent(messageContent, command)

        if (messageContent.length > 0) {
            messageContent.match(regex).forEach(element => {
                return args.push(element.replace(/"/g, ''))
            })
        }

        // check guild only
        if (command.guildonly && !guild) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Polecenia można używać jedynie na serwerze Maou-subs'
            }))
            return
        }

        // log of command
        console.info(`[Command Handler] Command: ${command.name} by: ${author.tag}`)

        if (command.precondition && !(await command.precondition(message))) return

        if (!(await RequireChannel(message, command.channelType))) return

        // check arguments for this command
        if (command.requireArgs && !args.length) {
            this.getCommand('help', group).execute(message, [command.name])
            return
        }

        try {
            await command.execute(message, args)
        } catch (exception) {
            await message.reply(new MessageEmbed({
                color: Colors.Error,
                description: 'Wystąpił nieoczekiwany błąd. Zgłoś go do administracji!'
            }))
            console.error(`[Comamnd handler] command ${command.name} error: ${exception}`)
        }
    }

    public isCommand(messageContent: string): boolean {
        if (!messageContent.startsWith(new Config().prefix)) return false
        const group = this.getModule(messageContent.toLowerCase())
        if (group.length > 1) messageContent = messageContent.slice(group.length + 1)
        const command = this.getCommand(messageContent.toLowerCase(), group)
        if (!command) return false
        return true
    }

    private getCommand(messageContent: string, group: string): Command {
        return this._commands.get(group).find(command => messageContent.startsWith(command.name) || (command.aliases && command.aliases.find(alias => messageContent.startsWith(alias))))
    }

    private getModule(messageContent: string): string {
        return Array.from(this._commands.keys()).find(group => messageContent.startsWith(group))
    }

    private fixedMessageContent(messageContent: string, command: Command): string {
        const regex = new RegExp(`(${command.name}${command.aliases ? '|' + command.aliases.join('|') : ''})`, 'm')
        return messageContent.replace(regex, command.name).slice(command.name.length)
    }
}