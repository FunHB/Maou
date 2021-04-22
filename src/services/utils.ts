import { Collection, Guild, GuildMember, Message, MessageAttachment, MessageEmbed, Role, User } from "discord.js"
import { Colors } from "../api/colors"
import { Config } from "../config"
import fs from 'fs'

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

    public static getColor(color: string): Colors | string {
        switch (color) {
            case 'error':
                return Colors.Error

            case 'success':
                return Colors.Success

            case 'warning':
                return Colors.Warning

            case 'info':
                return Colors.Info

            case 'neutral':
                return Colors.Neutral

            case 'random':
                return 'RANDOM'

            default:
                return null
        }
    }

    public static getChannelCount(guild: Guild, type: string): number {
        return guild.channels.cache.array().filter(channel => channel.type === type).length
    }

    // report
    public static reportErrorCode(reported: string, reason: string, message: Message): number {
        if (!reported.match(/[0-9]{18}/)) return 1
        if (!reason) return 2
        if (!message) return 3
        return 0
    }

    public static getReportMessageFromErrorCode(errorCode: number): string {
        const messages = [
            'Id wiadomości się nie zgadza!',
            'Musisz podać powód zgłoszenia!',
            'upłynął limit czasu na zgłoszenie bądź wiadomosć nie znajduje się na tym kanale'
        ]
        return messages[errorCode-1]
    }

    public static getResolveDecision(decision: string): number {
        switch (decision) {
            case 'reject':
            case 'odrzuć':
            case 'odrzuc':
            case 'nah':
                return 0

            case 'approve':
            case 'zatwierdź':
            case 'zatwierdz':
            case 'ok':
                return 1

            default:
                return 2
        }
    }

    // recrutation
    public static getRecrutationStatus(): boolean {
        return fs.existsSync('./data/rekrutacja')
    }

    public static changeRecrutationStatus(): void {
        if (this.getRecrutationStatus()) {
            fs.unlinkSync('./data/rekrutacja')
            return
        }
        fs.writeFileSync('./data/rekrutacja', '')
    }

    // addable roles
    private static _path = './data/addableRoles.json'

    public static get roles(): Collection<string, Role[]> { return this._roles }
    private static _roles: Collection<string, Role[]> = new Collection()

    public static setRoles(guild: Guild): void {
        const object = JSON.parse(fs.readFileSync(this._path).toString() || '{}')
        this._roles = new Collection(Object.keys(object).map(key => [key, guild.roles.cache.filter(role => object[key].includes(role.id)).array()]))
        if (!this._roles.get(guild.id)) this._roles.set(guild.id, [])
    }

    // reports
    private static _reports: Collection<string, { reported: Message }> = new Collection()

    public static getReport(): Collection<string, { reported: Message }> {
        return this._reports
    }

    public static setReports(reportedID: string, reported: Message): void {
        this._reports.set(reportedID, { reported: reported })
    }

    public static deleteReport(id: string): void {
        this._reports.delete(id)
    }

    // mod commands methods

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