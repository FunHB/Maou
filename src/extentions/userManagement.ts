import { GuildMember, Message, MessageAttachment, MessageEmbed, User } from "discord.js"
import { Utils } from './utils'
import { Colors } from "../api/colors"
import { Config } from "../config"

export class UserManagement {
    public static getEmbed(color: Colors | string, messageContent: string): MessageEmbed {
        const regex = /(https:\/\/)\S*[(.png)(.jpg)(.gif)(.jpeg)(.mp4)(.mp3)]/gm
        const links: string[] = messageContent.match(regex)
        const content = messageContent.replace(regex, '')

        const embed = new MessageEmbed().setColor(color)

        if (links && links.length > 0) {
            embed.setImage(links[0])
            if (links.length > 1) embed.setThumbnail(links[1])
        }

        if (content.length > 0) embed.setDescription(content)

        return embed
    }

    public static getAttachmentsAndMessageContent(messageContent: string): { attachments: MessageAttachment[], messageContent: string } {
        const regex = /(https:\/\/)\S*[(.png)(.jpg)(.gif)(.jpeg)(.mp4)(.mp3)]/gm
        const links: string[] = messageContent.match(regex)
        const attachments: MessageAttachment[] = []

        if (links) {
            links.forEach(link => {
                attachments.push(new MessageAttachment(link, Math.random().toString(36).substring(2) + '.' + link.split('.').pop()))
            })
        }

        return { attachments: attachments, messageContent: messageContent.replace(regex, '') }
    }

    public static errorCode(message: Message, member: GuildMember, checkBannable = false): number {
        if (Config.modLogsChannel === undefined) return 1
        if (!member) return 2
        if (checkBannable && member.id === message.author.id) return 3
        if (member.user.bot === true) return 4
        if (checkBannable && !member.bannable) return 5
        if (member.roles.cache.has(Config.muteRole)) return 6
        return 0
    }

    public static getMessageFromErrorCode(errorCode: number, type: string): string {
        const errorMessages = [
            'Serwer dla bota nie jest poprawnie skonfigurowany!',
            `Nie znaleziono osoby!`,
            `Nie możesz ${this.getTypeWord(type)} samego siebie!`,
            `Nie możesz ${this.getTypeWord(type)} bota!`,
            `Nie możesz go ${this.getTypeWord(type)} baakaa!`,
            'Ta osoba jest już wyciszona!'
        ]

        return errorMessages[errorCode - 1]
    }

    public static getEmbedFromType(message: Message, user: User, reason: string, type: string): MessageEmbed {
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
                { name: 'Kiedy:', value: Utils.dateToString(message.createdAt, false), inline: true }
            ],
            footer: { text: `Przez: ${message.author.username}` }
        })
    }

    public static getMessageFromType(member: GuildMember, type: string): MessageEmbed {
        return new MessageEmbed({
            color: Colors.Success,
            description: `:white_check_mark: <@!${member.id}> został ${this.getTypeWord(type, 'ony')}!`
        })
    }

    private static getTypeWord(type: string, suffix?: string): string {
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

    private static getColorFromType(type: string): Colors {
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