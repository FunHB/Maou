import { Message, MessageEmbed, User } from "discord.js";
import { Colors } from "../api";
import { Config } from '../config'
import { Utils } from "../modules/utils";
const config = new Config()

export class ModCommand {
    public errorCode(message: Message, user: User): number {
        if (config.modLogsChannel === undefined) return 1
        if (!user) return 2
        if (user.id === message.author.id) return 3
        if (user.bot === true) return 4
        if (!message.guild.members.cache.get(user.id).bannable) return 5
        if (message.guild.members.cache.get(user.id).roles.cache.has(config.muteRole)) return 6
        return 0
    }

    public getMessageFromErrorCode(errorCode: number, type: string): string {
        const errorMessages = [
            'Serwer dla bota nie jest poprawnie skonfigurowany!',
            `Musisz podać osobę, którą chcesz ${this.getTypeWord(type)}!`,
            `Nie możesz ${this.getTypeWord(type)} samego siebie!`,
            `Nie możesz ${this.getTypeWord(type)} bota!`,
            `Nie masz wystarczających uprawnień, aby ${this.getTypeWord(type)} tego użytkownika!`,
            'Ta osoba jest już wyciszona!'
        ]

        return errorMessages[errorCode - 1]
    }

    public getEmbedFromType(message: Message, user: User, reason: string, type: string): MessageEmbed {
        return new MessageEmbed({
            color: this.getColorFromType(type),
            author: {
                name: user.username,
                iconURL: user.displayAvatarURL({
                    dynamic: true,
                    size: 128,
                    format: "png"
                })
            },
            description: `Powód: ${reason}`,
            fields: [
                { name: 'UserId:', value: `${user.id}`, inline: true },
                { name: 'Typ:', value: type, inline: true },
                { name: 'Kiedy:', value: Utils.dateToString(message.createdAt, true), inline: true }
            ],
            footer: { text: `Przez: ${message.author.username}` }
        })
    }

    public getMessageFromType(user: User, type: string): MessageEmbed {
        return new MessageEmbed({
            color: Colors.Success,
            description: `:white_check_mark: <@!${user.id}> został ${this.getTypeWord(type, 'ony')}!`
        })
    }

    private getTypeWord(type: string, suffix?: string): string {
        switch (type) {
            case 'ban':
                if (suffix === 'ony') suffix = 'ny'
                return `zbanowa${suffix || 'ć'}`
            case 'kick':
                return `wyrzuc${suffix || 'ić'}`
            case 'mute':
                return `wycisz${suffix || 'yć'}`
            case 'unmute':
                return `ułaskawi${suffix || 'ć'}`
            default:
                return ''
        }
    }

    private getColorFromType(type: string): Colors {
        switch (type) {
            case 'ban':
                return Colors.Error
            case 'kick':
                return Colors.Warning
            case 'mute':
                return Colors.Info
            case 'unmute':
                return Colors.Success
            default:
                return Colors.Neutral
        }
    }
}