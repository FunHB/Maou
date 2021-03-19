import { Collection, GuildMember, Message, MessageEmbed, User } from "discord.js"
import { Colors } from "../api"
import { Config } from "../config"

export class Utils {
    // main methods
    public static dateToString(date: Date, seconds = true): string {
        const out = `${('0' + date.getUTCDate()).slice(-2)}.${('0' + (date.getUTCMonth() + 1)).slice(-2)}.${date.getUTCFullYear()} ${date.getUTCHours() !== 24 ? ('0' + (date.getUTCHours() + 1)).slice(-2) : '00'}:${('0' + date.getUTCMinutes()).slice(-2)}`
        if (!seconds) return out
        return `${out}:${('0' + date.getUTCSeconds()).slice(-2)}`
    }

    public static async getMember(message: Message, identificator: string, selfOnNone = false): Promise<GuildMember> {
        await message.guild.members.fetch()
        return (message.guild.members.cache.find(member => member.user === message.mentions.users.first() || member.id === identificator || member.user.username.toLowerCase() === identificator.toLowerCase() || (member.nickname && member.nickname.toLowerCase() === identificator.toLowerCase()))) || ((!identificator && selfOnNone) ? message.member : null)
    }

    public static getAvatar(user: User): string {
        return user.avatarURL({ size: 128, format: "jpg" }) || user.defaultAvatarURL
    }

    // reports
    private static _reports: Collection<string, { reported: Message, report: Message }> = new Collection()

    public static getReports(): Collection<string, { reported: Message, report: Message }> {
        return this._reports
    }

    public static setReports(reported: Message, report: Message): void {
        this._reports.set(report.id, { reported: reported, report: report })
    }

    public static deleteReport(id: string) {
        this._reports.delete(id)
    }

    // mod commands methods
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
            `Nie masz wystarczających uprawnień, aby ${this.getTypeWord(type)} tego użytkownika!`,
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