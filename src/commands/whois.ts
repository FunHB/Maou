import { GuildMember, Message, MessageEmbed, User } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Utils } from '../modules/utils'

export class WhoisCommand implements Command {
    public name = 'whois'
    public description = 'wyświetla informacje o użytkowniku'
    public aliases: string[] = ['ktoto']
    public args = false
    public usage = '[użytkownik]'
    public channelType: channelType = channelType.botCommands
    public guildonly = true

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
                { name: 'Bot', value: this.isBot(user), inline: true },
                { name: 'Utworzono', value: Utils.dateToString(user.createdAt) },
                { name: 'Dołączono', value: Utils.dateToString(member.joinedAt) },
                { name: `Role:[${member.roles.cache.array().length - 1}]`, value: this.getRoles(member) }
            ]
        }))
    }

    private isBot(user: User): string {
        return user.bot ? 'Tak' : 'Nie'
    }

    private getRoles(member: GuildMember): string {
        return member.roles.cache.array().filter(role => role.name !== '@everyone').map(role => `<@&${role.id}>`).join('\n') || 'Brak'
    }
}