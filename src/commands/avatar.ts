import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';
import { Utils } from '../modules/utils';

export class AvatarCommand implements Command {
    public name = 'avatar'
    public description = 'Wyświetla twój lub czyjś avatar.'
    public aliases: string[] = ['awatar']
    public args = false
    public usage = '<osoba>'
    public channelType: channelType = channelType.botCommands
    public guildonly = true
    public cooldown = 10

    public async execute(message: Message, args: string[]): Promise<void> {
        const member = await Utils.getUser(message, args.join(' '))

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