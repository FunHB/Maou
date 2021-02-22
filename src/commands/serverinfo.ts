import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';

export class ServerinfoCommand implements Command {
    public name = 'serverinfo'
    public description = 'Wyświetla informacje o serwerze!'
    public aliases: string[] = ['sinfo']
    public args = false
    public roles: string[]
    public usage: string
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 10

    public async execute(message: Message): Promise<void> {
        await message.channel.send(new MessageEmbed({
            color: Colors.Info,
            author: {
                name: `${message.guild.name}`,
                iconURL: message.guild.iconURL({
                    size: 128,
                    format: "jpg"
                })
            },
            thumbnail: {
                url: message.guild.iconURL({
                    size: 128,
                    format: "jpg"
                })
            },
            fields: [
                { name: 'ID serwera', value: message.guild.id, inline: true },
                { name: 'Właściciel', value: message.guild.owner, inline: true },
                { name: 'Liczba użytkowników', value: message.guild.memberCount, inline: true }
            ]
        }))
    }
}