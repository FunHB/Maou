import { Collection, Message, MessageEmbed, Permissions } from 'discord.js'
import { Command, channelType, Colors } from './api'
import { CommandBody } from './commands/command'
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
//

// mod commands
import { MuteCommand } from './mod_commands/mute'
import { BanCommand } from './mod_commands/ban'
import { KickCommand } from './mod_commands/kick'
import { TestApiSanakanCommand } from './mod_commands/test-api-sanakan'
import { UnmuteCommand } from './mod_commands/unmute'
import { ResolveCommand } from './mod_commands/resolve'
import { ShowmutedCommand } from './mod_commands/showmuted'
//

export class CommandHandler {

    public get commands(): Command[] { return this._commands }

    private _commands: Command[]
    private _modCommands: Command[]
    private readonly _prefix: string

    constructor(prefix: string) {
        const commandClasses = [
            ArtCommand,
            AvatarCommand,
            InfoCommand,
            PingCommand,
            ReportCommand,
            ServerinfoCommand,
            WhoisCommand
        ]

        const modCommandClasses = [
            BanCommand,
            KickCommand,
            MuteCommand,
            TestApiSanakanCommand,
            UnmuteCommand,
            ResolveCommand,
            ShowmutedCommand
        ]

        this._commands = commandClasses.map(CommandClass => new CommandClass())
        this._modCommands = modCommandClasses.map(modCommandClass => new modCommandClass())
        this._commands.push(new HelpCommand(this._commands, this._modCommands))
        this._modCommands.push(new HelpCommand(this._commands, this._modCommands, true))
        this._prefix = prefix
    }

    async handleMessage(message: Message): Promise<void> {
        const { member, channel, guild, author } = message

        if (author.bot || !message.content.startsWith(this._prefix)) return

        const commandBody = new CommandBody(message, this._prefix)
        const command = this.getCommand(commandBody)

        // check if command exist
        if (!command) return

        // check guild only 
        if (command.guildonly && !guild) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Polecenia można używać jedynie na serwerze Maou-subs'
            }))
            return
        }

        // log of command
        console.info(`Wywołane polecenie: ${command.name} przez: ${author.tag}`)

        // check if channel is valid for this command usage
        // skip for admins and moderators
        if (!member.roles.cache.get(Config.modRole) || !member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)|| !(member === guild.owner)) {
            if (!this.validChannel(message, command.channelType)) {
                await channel.send(new MessageEmbed({
                    color: Colors.Error,
                    description: `Polecenia można używać jedynie na kanale <#${this.getChannelByChannelType(command.channelType)}>`
                }))
                return
            }
        }

        // check if user has one of required roles for this command usage
        if (commandBody.modCommand && !member.roles.cache.array().filter(role => command.roles.includes(role.name))) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                image: {
                    url: `https://i.giphy.com/RX3vhj311HKLe.gif`
                }
            }))
            return
        }

        // check arguments for this command
        if (command.args && !commandBody.args.length) {
            this._commands.pop().execute(message, [command.name])
            return
        }

        // Check cooldowns
        const cooldowns: Collection<string, Collection<string, Date>> = new Collection()

        if (!cooldowns.has(commandBody.commandName)) {
            cooldowns.set(commandBody.commandName, new Collection())
        }

        const date = new Date()
        const timestamps = cooldowns.get(commandBody.commandName)
        const cooldownAmount = (command.cooldown || 3) * 1000

        if (timestamps.has(author.id)) {
            const expirationTime = timestamps.get(author.id).getTime() + cooldownAmount

            if (date.getTime() < expirationTime) {
                const timeLeft = (expirationTime - date.getTime()) / 1000
                await channel.send(new MessageEmbed({
                    color: Colors.Warning,
                    description: `<@!${member.id}> Polecenia ${commandBody.commandName} możesz uzyć dopiero za ${timeLeft.toFixed(1)} sekund.`
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
            command.execute(message, commandBody.args)
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

    private getCommand(commandBody: CommandBody): Command {
        return commandBody.modCommand ? this._modCommands.find(command => this.validCommand(command, commandBody)) : this._commands.find(command => this.validCommand(command, commandBody))
    }

    private validCommand(command: Command, commandBody: CommandBody): boolean {
        return command.name === commandBody.commandName || (command.aliases && command.aliases.includes(commandBody.commandName))
    }
}