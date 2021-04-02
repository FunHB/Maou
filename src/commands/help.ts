import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'

export class HelpCommand implements Command {
    public name = 'help'
    public description = 'Wyświetla listę wszystkich poleceń lub informacje o danym poleceniu'
    public aliases: string[] = ['pomoc', 'h']
    public args = false
    public roles: string[] = [Config.modRole]
    public usage = '[polecenie]'
    public channelType: channelType = channelType.botCommands
    public guildonly = true

    private _commands: Command[]
    private _modCommands: Command[]
    private _isForMods: boolean

    constructor(commands: Command[], modCommands: Command[], isForMods = false) {
        this._commands = commands
        this._modCommands = modCommands
        this._isForMods = isForMods
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const { channel } = message
        const prefix = Config.prefix
        const data = []

        if (!args.length) {
            data.push({ name: 'Lista poleceń bota:\n', value: this.getCommands().map(command => command.name).join(", ") })
            const footer = `\nAby wyświetlić informacje na temat pojedynczego polecenia użyj: ${prefix}${this.name} ${this.usage}`

            await channel.send(new MessageEmbed({
                color: Colors.Info,
                fields: data,
                footer: { text: footer },
            }))
            return
        }

        const name = args.shift().toLowerCase()
        const command = this.getCommands().find(cmd => cmd.name === name || (cmd.aliases && cmd.aliases.includes(name)))

        if (!command) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Taka komenda nie istnieje!',
            }))
            return
        }

        const title = `**Nazwa:** ${command.name}`

        if (command.aliases) data.push({ name: "**Aliasy:**", value: `${command.aliases.join(', ')}` })
        if (command.description) data.push({ name: "**Opis:**", value: `${command.description}` })
        if (command.usage) data.push({ name: "**Użycie:**", value: `${prefix}${command.name} ${command.usage}` })

        await channel.send(new MessageEmbed({
            color: Colors.Info,
            title: title,
            fields: data,
        }))
    }

    private getCommands(): Command[] {
        return this._isForMods ? this._modCommands : this._commands
    }
}