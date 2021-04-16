import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors } from '../api'
import { Utils } from '../modules/utils'
import { Command } from './command'

export class AvatarCommand extends Command {
    public name = 'avatar'
    public description = 'Wyświetla twój lub czyjś avatar'
    public aliases: string[] = ['awatar']
    public usage = '[użytkownik]'
    public channelType: channelType = channelType.botCommands

    public async execute(message: Message, args: string[]): Promise<void> {
        const member = await Utils.getMember(message, args.join(' '), true)

        if (!member) return

        await message.channel.send(new MessageEmbed({
            color: Colors.Info,
            description: `Awatar dla: <@!${member.id}>`,
            image: {
                url: member.user.displayAvatarURL({
                    dynamic: true,
                    size: 128,
                    format: "png"
                })
            }
        }))
    }
}