import { Collection, Message, MessageEmbed, Permissions } from 'discord.js'
import { channelType, Colors } from './api'
import { Command } from './commands/command'
import { Config } from './config'

// commands
import { ArtCommand } from './commands/art'
import { AvatarCommand } from './commands/avatar'
import { HelpCommand } from './commands/help'
import { InfoCommand } from './commands/info'
import { PingCommand } from './commands/ping'
import { ReportCommand } from './commands/report'
import { ServerinfoCommand } from './commands/serverinfo'
import { WhoisCommand } from './commands/whois'
import { RekrutacjaCommand } from './commands/rekrutacja'
import { ShowrolesCommand } from './commands/showroles'
import { AddroleCommand } from './commands/addrole'
import { RemoveroleCommand } from './commands/removerole'
//

// mod commands
import { MuteCommand } from './mod_commands/mute'
import { BanCommand } from './mod_commands/ban'
import { KickCommand } from './mod_commands/kick'
import { UnmuteCommand } from './mod_commands/unmute'
import { ResolveCommand } from './mod_commands/resolve'
import { ShowmutedCommand } from './mod_commands/showmuted'
import { ModRekrutacjaCommand } from './mod_commands/rekrutacja'
import { ChangeNickCommand } from './mod_commands/changenick'
import { SendMsgCommand } from './mod_commands/sendmsg'
import { SendEMsgCommand } from './mod_commands/sendemsg'
import { ReactToMsgCommand } from './mod_commands/reacttomsg'
import { QuoteCommand } from './mod_commands/quote'
//

export class CommandHandler {

    public get commands(): Command[] { return this._commands }

    private _commands: Command[]
    private _modCommands: Command[]

    private _modPrefix = 'mod'

    constructor() {
        const commandClasses = [
            ArtCommand,
            AvatarCommand,
            InfoCommand,
            PingCommand,
            ReportCommand,
            ServerinfoCommand,
            WhoisCommand,
            RekrutacjaCommand,
            ShowrolesCommand,
            AddroleCommand,
            RemoveroleCommand
        ]

        const modCommandClasses = [
            BanCommand,
            KickCommand,
            MuteCommand,
            UnmuteCommand,
            ResolveCommand,
            ShowmutedCommand,
            ModRekrutacjaCommand,
            ChangeNickCommand,
            SendMsgCommand,
            SendEMsgCommand,
            ReactToMsgCommand,
            QuoteCommand
        ]

        this._commands = commandClasses.map(CommandClass => new CommandClass())
        this._modCommands = modCommandClasses.map(modCommandClass => new modCommandClass())
        this._commands.push(new HelpCommand().init(this._commands))
        this._modCommands.push(new HelpCommand().init(this._modCommands))
    }

    async handleMessage(message: Message): Promise<void> {
        const { member, channel, guild, author } = message

        if (author.bot || !message.content.startsWith(Config.prefix)) return

        const regex = /"[^"]+"|[^\\ ]+/gm
        let messageContent = message.content.slice(Config.prefix.length)

        const command = this.getCommand(messageContent.toLowerCase())

        // check if command exist
        if (!command) return

        const requireMod = messageContent.startsWith(this._modPrefix)
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
            if (requireMod) {
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
            (requireMod ? this._modCommands : this._commands).find(command => command.name === 'help').execute(message, [command.name])
            return
        }

        // Check cooldowns
        const cooldowns: Collection<string, Collection<string, Date>> = new Collection()

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection())
        }

        const date = new Date()
        const timestamps = cooldowns.get(command.name)
        const cooldownAmount = (command.cooldown || 3) * 1000

        if (timestamps.has(author.id)) {
            const expirationTime = timestamps.get(author.id).getTime() + cooldownAmount

            if (date.getTime() < expirationTime) {
                const timeLeft = (expirationTime - date.getTime()) / 1000
                await channel.send(new MessageEmbed({
                    color: Colors.Warning,
                    description: `<@!${member.id}> Polecenia ${command.name} możesz uzyć dopiero za ${timeLeft.toFixed(1)} sekund.`
                }))
                return
            }
        }

        timestamps.set(member.id, date)

        setTimeout(() => {
            timestamps.delete(member.id)
        }, cooldownAmount)
        //

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

    private getCommand(messageContent: string): Command {
        return messageContent.startsWith(this._modPrefix) ? this._modCommands.find(command => messageContent.slice(this._modPrefix.length + 1).startsWith(command.name) || (command.aliases && command.aliases.find(alias => messageContent.slice(this._modPrefix.length + 1).startsWith(alias)) || (!messageContent.slice(this._modPrefix.length + 1).length && command.name === 'help'))) : this._commands.find(command => messageContent.startsWith(command.name) || (command.aliases && command.aliases.find(alias => messageContent.startsWith(alias))))
    }

    private fixedMessageContent(messageContent: string, command: Command): string {
        const regex = new RegExp(`(${command.name}${command.aliases ? '|' + command.aliases.join('|') : ''})`, 'm')
        messageContent = messageContent.replace(regex, command.name)
        return messageContent.startsWith(this._modPrefix) ? messageContent.slice(this._modPrefix.length + 1).slice(command.name.length) : messageContent.slice(command.name.length)
    }
}