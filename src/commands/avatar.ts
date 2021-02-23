import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';

export class AvatarCommand implements Command {
    public name = 'avatar'
    public description = 'Wyświetla twój lub czyjś avatar.'
    public aliases: string[] = ['awatar']
    public args = false
    public usage = '<osoba>'
    public channelType: channelType = channelType.botCommands
    public guildonly = true
    public cooldown = 10

    public async execute(message: Message): Promise<void> {
        const member = message.mentions.users.first() || message.author

        await message.channel.send(new MessageEmbed({
            color: Colors.Neutral,
            description: `Awatar dla: <@!${member.id}>`,
            image: {
                url: member.displayAvatarURL({
                    dynamic: true,
                    size: 128,
                    format: "png"
                })
            }
        }))
    }
}