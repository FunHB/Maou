import { Guild, GuildMember, Message, User } from "discord.js"
import { Colors } from "../api/colors"

export class Utils {
    public static dateToString(date: Date, seconds = true): string {
        const out = `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()} ${date.getHours() !== 24 ? ('0' + (date.getHours())).slice(-2) : '00'}:${('0' + date.getMinutes()).slice(-2)}`
        if (!seconds) return out
        return `${out}:${('0' + date.getSeconds()).slice(-2)}`
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
                if ((/^#[0-9A-Fa-f]{6}$/).test(color)) return color
                return null
        }
    }

    public static getChannelCount(guild: Guild, type: string): number {
        return guild.channels.cache.array().filter(channel => channel.type === type).length
    }
}