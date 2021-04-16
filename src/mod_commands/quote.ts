import { Message, MessageEmbed } from 'discord.js'
import { Colors } from '../api'
import { Command } from '../commands/command'

export class QuoteCommand extends Command {
    public name = 'quote'
    public description = 'Cytuje wiadomość i wysyła na podany kanał'
    public aliases: string[] = ['cytuj']
    public requireArgs = true
    public group = 'mod'
    public usage = '<id wiadomości> <id kanału>'

    public async execute(message: Message, args: string[]): Promise<void> {
        const quoted = await message.channel.messages.fetch(args.shift())
        if (!quoted) return

        const channel = message.guild.channels.cache.get(args.shift())
        if (!channel) return

        if (channel.isText()) {
            await channel.send(`>>> ${quoted.content}`, {
                files: quoted.attachments.array()
            })
        }

        await message.channel.send(new MessageEmbed({
            color: Colors.Success,
            description: `Wysłano wiadomość na kanał <#${channel.id}>`
        }))
    }
}