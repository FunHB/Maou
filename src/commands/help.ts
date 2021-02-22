import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';
import { Config } from '../config';

export class HelpCommand implements Command {
    public name = 'help'
    public description = 'Wyświetla listę wszystkich poleceń lub informacje o danym poleceniu.'
    public aliases: string[] = ['pomoc', 'h']
    public args = false
    public roles: string[]
    public usage = '<komenda>'
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 2

    private _commands: Command[]

    constructor(commands: Command[]) {
        this._commands = commands
    }

    public async execute(message: Message, args: string[]): Promise<void> {
        const prefix = new Config().prefix

        const data = []

        if (!args.length) {
            data.push({ name: 'Lista poleceń bota:\n', value: this._commands.map(command => command.name).join(", ") })
            const footer = `\nAby wyświetlić informacje na temat pojedynczego polecenia użyj: ${prefix}${this.name}${this.usage}`

            await message.channel.send(new MessageEmbed({
                color: Colors.Info,
                fields: data,
                footer: { text: footer },
            }))
            return
        }

        const name = args[0].toLowerCase();
        const command = this._commands.find(cmd => cmd.name || (cmd.aliases && cmd.aliases.includes(name)))

        if (!command) {
            await message.channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Taka komenda nie istnieje!',
            }))
            return
        }

        const title = `**Nazwa:** ${command.name}`

        if (command.aliases) data.push({ name: "**Aliasy:**", value: `${command.aliases.join(', ')}` })
        if (command.description) data.push({ name: "**Opis:**", value: `${command.description}` })
        if (command.usage) data.push({ name: "**Użycie:**", value: `${prefix}${command.name} ${command.usage}` })

        await message.channel.send(new MessageEmbed({
            color: Colors.Info,
            title: title,
            fields: data,
        }));
    }
}