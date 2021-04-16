import { GuildMember, Message, MessageEmbed } from 'discord.js'
import { channelType, Colors } from '../api'
import { Utils } from '../modules/utils'
import { Command } from './command'

export class WhoisCommand extends Command {
    public name = 'who is'
    public description = 'wyświetla informacje o użytkowniku'
    public aliases: string[] = ['kto to']
    public usage = '[użytkownik]'
    public channelType: channelType = channelType.botCommands

    public async execute(message: Message, args: string[]): Promise<void> {
        const member = await Utils.getMember(message, args.join(' '), true)

        if (!member) return

        const { user } = member

        await message.channel.send(new MessageEmbed({
            color: Colors.Info,
            author: {
                name: `${user.username}`,
                iconURL: Utils.getAvatar(user)
            },
            thumbnail: {
                url: Utils.getAvatar(user)
            },
            fields: [
                { name: 'id', value: member.id, inline: true },
                { name: 'Pseudo', value: member.nickname || 'Brak', inline: true },
                { name: 'Status', value: user.presence.status, inline: true },
                { name: 'Bot', value: user.bot ? 'Tak' : 'Nie', inline: true },
                { name: 'Utworzono', value: Utils.dateToString(user.createdAt) },
                { name: 'Dołączono', value: Utils.dateToString(member.joinedAt) },
                { name: `Role:[${member.roles.cache.array().length - 1}]`, value: this.getRoles(member) }
            ]
        }))
    }

    private getRoles(member: GuildMember): string {
        return member.roles.cache.filter(role => role.name !== '@everyone').sort((roleA , roleB) => roleB.position - roleA.position).map(role => role).join('\n') || 'Brak'
    }
}