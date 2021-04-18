import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors } from '../api'
import { Config } from '../config'
import { Command } from './command'

export class HelpCommand extends Command {
    public name = 'help'
    public description = 'Wyświetla listę wszystkich poleceń lub informacje o danym poleceniu'
    public aliases: string[] = ['pomoc', 'h']
    public usage = '[polecenie]'
    public channelType: channelType = channelType.botCommands

    private _commands: Command[]

    public init(commands: Command[]): HelpCommand {
        this._commands = commands
        return this
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const { channel } = message
        const prefix = Config.prefix
        const data = []

        if (!args.length) {
            data.push({ name: 'Lista poleceń bota:\n', value: this._commands.map(command => command.name).join(", ") })
            const footer = `\nAby wyświetlić informacje na temat pojedynczego polecenia użyj: ${prefix}${this.name} ${this.usage}`

            await channel.send(new MessageEmbed({
                color: Colors.Info,
                fields: data,
                footer: { text: footer },
            }))
            return
        }

        const name = args.join(' ').toLowerCase()
        const command = this._commands.find(_command => _command.name === name || (_command.aliases && _command.aliases.includes(name)))

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
        if (command.usage) data.push({ name: "**Użycie:**", value: `${prefix}${command.group ? command.group + ' ' : ''}${command.name} ${command.usage}` })

        await channel.send(new MessageEmbed({
            color: Colors.Info,
            title: title,
            fields: data,
        }))
    }
}