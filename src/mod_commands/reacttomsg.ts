import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'

export class ReactToMsgCommand implements Command {
    public name = 'reacttomsg'
    public description = 'dodaje reakcje pod podaną wiadomość'
    public args = true
    public roles: string[] = [Config.modRole]
    public usage = '<id kanału> <id wiadomości> <reakcja>'
    public channelType: channelType = channelType.normal
    public guildonly = true

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