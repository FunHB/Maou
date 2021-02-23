import { Guild, Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';
import { Utils } from '../modules/utils';

export class ServerinfoCommand implements Command {
    public name = 'serverinfo'
    public description = 'Wyświetla informacje o serwerze!'
    public aliases: string[] = ['sinfo']
    public args = false
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 10

    public async execute(message: Message): Promise<void> {
        const { guild, channel } = message

        await channel.send(new MessageEmbed({
            color: Colors.Info,
            author: {
                name: `${guild.name}`,
                iconURL: guild.iconURL({
                    size: 128,
                    format: "jpg"
                })
            },
            thumbnail: {
                url: guild.iconURL({
                    size: 128,
                    format: "jpg"
                })
            },
            fields: [
                { name: 'ID serwera', value: guild.id, inline: true },
                { name: 'Właściciel', value: `<@!${guild.ownerID}>`, inline: true },
                { name: 'Utworzono', value: Utils.dateToString(guild.createdAt), inline: true },
                { name: 'Liczba użytkowników', value: guild.memberCount, inline: true },
                { name: 'Kanały tekstowe', value: this.getChannelCount(guild, 'text'), inline: true },
                { name: 'Kanały głosowe', value: this.getChannelCount(guild, 'voice'), inline: true },
                { name: `Role:[${guild.roles.cache.array().length}]`, value: `@everyone, ${this.getRoles(guild)}`, inline: true }
            ]
        }))
    }

    private getRoles(guild: Guild): string {
        let index = 0
        return guild.roles.cache.filter(role => role.name !== '@everyone' && ++index <= 10 ).map(role => `<@&${role.id}>`).join(", ")
    }

    private getChannelCount(guild: Guild, type: string): number {
        return guild.channels.cache.array().filter(channel => channel.type === type).length
    }
}