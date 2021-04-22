import { Collection, Message, MessageEmbed, Permissions } from 'discord.js'
import { channelType } from './api/channelType'
import { Command } from './api/command'
import { Colors } from './api/colors'
import { Config } from './config'

// modules
import { Helper } from "./modules/helper"
import { Moderations } from "./modules/moderations"
//

export class CommandHandler {

    public get commands(): Collection<string, Command[]> { return this._commands }

    private _commands: Collection<string, Command[]>

    constructor() {
        const helper = new Helper()
        const mod = new Moderations()
        this._commands = new Collection([
            [mod.group, mod.commands],
            [helper.group, helper.commands]     // Helper module MUST be the last element of Collection
        ])
    }

    async handleMessage(message: Message): Promise<void> {
        const { member, channel, guild, author } = message

        if (author.bot || !message.content.startsWith(Config.prefix)) return

        let messageContent = message.content.slice(Config.prefix.length)

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


        // skip for admins and moderators
        if (!member.roles.cache.get(Config.modRole) && !member.hasPermission(Permissions.FLAGS.ADMINISTRATOR) && !(member === guild.owner)) {
            // check if user has one of required roles for this command usage
            if (group.length > 1) {
                await channel.send(new MessageEmbed({
                    color: Colors.Error,
                    image: {
                        url: `https://i.giphy.com/RX3vhj311HKLe.gif`
                    }
                }))
                return
            }

            // check if channel is valid for this command usage
            if (!this.validChannel(message, command.channelType)) {
                await channel.send(new MessageEmbed({
                    color: Colors.Error,
                    description: `Polecenia można używać jedynie na kanale <#${this.getChannelByChannelType(command.channelType)}>`
                }))
                return
            }
        }

        // check arguments for this command
        if (command.requireArgs && !args.length) {
            this.getCommand('help', group).execute(message, [command.name])
            return
        }

        try {
            command.execute(message, args)
        } catch (error) {
            await message.reply(new MessageEmbed({
                color: Colors.Error,
                description: 'Nie wywołano polecenia! Zygluś popsuł <:uuuu:723131980849479781>'
            }))
            throw error
        }
    }

    private validChannel(message: Message, type: channelType): boolean {
        switch (type) {
            case channelType.botCommands:
            case channelType.reports:
            case channelType.artschannel:
                return message.channel.id === this.getChannelByChannelType(type)

            case channelType.normal:
            default:
                return true
        }
    }

    private getChannelByChannelType(type: channelType): string {
        switch (type) {
            case channelType.botCommands:
                return Config.botCommandsChannel

            case channelType.reports:
                return Config.reportsChannel

            case channelType.artschannel:
                return Config.artsChannel

            case channelType.normal:
            default:
                return ''
        }
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