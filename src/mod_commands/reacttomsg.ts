import { Message, MessageEmbed } from 'discord.js'
import { Colors } from '../api'
import { Command } from '../commands/command'

export class ReactToMsgCommand extends Command {
    public name = 'r2msg'
    public description = 'dodaje reakcje pod podaną wiadomość'
    public requireArgs = true
    public group = 'mod'
    public usage = '<id kanału> <id wiadomości> <reakcja>'

    public async execute(message: Message, args: string[]): Promise<void> {
        const channel = message.guild.channels.cache.get(args.shift())

        if (!channel) return

        const messageForReaction = channel.isText() ? await channel.messages.fetch(args.shift()) : null

        if (!messageForReaction) return

        const reaction = args.shift()

        if (!reaction) return

        await messageForReaction.react(reaction)

        await message.channel.send(new MessageEmbed({
            color: Colors.Success,
            description: `dodano reakcje ${reaction} do wiadomości`
        }))
    }
}