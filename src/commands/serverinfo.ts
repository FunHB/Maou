import { Guild, Message, MessageEmbed } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Utils } from '../modules/utils'

export class ServerinfoCommand implements Command {
    public name = 'serverinfo'
    public description = 'Wyświetla informacje o serwerze!'
    public aliases: string[] = ['sinfo']
    public args = false
    public channelType: channelType = channelType.botCommands
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
                { name: `Role:[${guild.roles.cache.array().length}]`, value: this.getRoles(guild), inline: true }
            ]
        }))
    }

    private getRoles(guild: Guild, max = 10): string {
        let index = 0
        const roles = guild.roles.cache.filter(() => ++index <= max ).map(role => role.name === '@everyone' ? role.name : `<@&${role.id}>`)
        if (roles.length < max) roles.push('...')
        return roles.join(', ')
    }

    private getChannelCount(guild: Guild, type: string): number {
        return guild.channels.cache.array().filter(channel => channel.type === type).length
    }
}