import { GuildMember, Message, MessageEmbed, User } from 'discord.js';
import { channelType, Colors, Command } from '../api';
import { Utils } from '../modules/utils';

export class WhoisCommand implements Command {
    public name = 'whois'
    public description = 'wyświetla informacje o użytkowniku'
    public aliases: string[] = ['ktoto']
    public args = false
    public usage = '[użytkownik]'
    public channelType: channelType = channelType.botCommands
    public guildonly = true

    public async execute(message: Message, args: string[]): Promise<void> {

        const user = this.getUser(message, args.shift())
        const member = message.guild.members.cache.array().find(member => member.id === user.id)

        await message.channel.send(new MessageEmbed({
            color: Colors.Info,
            author: {
                name: `${user}`,
                iconURL: user.avatarURL({
                    size: 128,
                    format: "jpg"
                })
            },
            thumbnail: {
                url: user.avatarURL({
                    size: 128,
                    format: "jpg"
                })
            },
            fields: [
                { name: 'id', value: user.id, inline: true },
                { name: 'Pseudo', value: member.nickname, inline: true },
                { name: 'Status', value: user.presence.status, inline: true },
                { name: 'Status', value: this.isBot(user), inline: true },
                { name: 'Utworzono', value: Utils.dateToString(user.createdAt), inline: true },
                { name: 'Dołączono', value: Utils.dateToString(member.joinedAt), inline: true },
                { name: `Role:[${member.roles.cache.array().length}]`, value: this.getRoles(member), inline: true }
            ]
        }))
    }

    private getUser(message: Message, username: string): User {
        if (message.mentions.users.first()) return message.mentions.users.first()
        if (username) return message.client.users.cache.get(message.guild.members.cache.find(user => user.nickname === username || user.id === username).id)
        return message.author
    }

    private isBot(user: User): string {
        return user.bot ? 'Tak' : 'Nie'
    }

    private getRoles(member: GuildMember): string {
        return member.roles.cache.array().map(role => `<@&${role.id}>`).join('\n')
    }
}