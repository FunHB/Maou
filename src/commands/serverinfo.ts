import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';

export class ServerinfoCommand implements Command {
    public name = 'serverinfo'
    public description = 'Wyświetla informacje o serwerze!'
    public aliases: string[] = ['sinfo']
    public args = false
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
                { name: 'Właściciel', value: `<@!${message.guild.ownerID}>`, inline: true },
                { name: 'Liczba użytkowników', value: message.guild.memberCount, inline: true },
                { name: 'Role:', value: `@everyone, ${this.getRoles(message)}`, inline: true }
            ]
        }))
    }

    private getRoles(message: Message): string {
        return message.guild.roles.cache.filter(role => role.name !== '@everyone').map(role => `<@&${role.id}>`).join(", ")
    }
}