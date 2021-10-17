import { ColorResolvable, Guild, GuildMember, HexColorString, Message, User } from "discord.js"
import { Colors } from "../api/colors"
import { ChannelType } from "../database/entity/Channel"

export class Utils {
    public static dateToString(date: Date, seconds = true): string {
        const out = `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()} ${date.getHours() !== 24 ? ('0' + (date.getHours())).slice(-2) : '00'}:${('0' + date.getMinutes()).slice(-2)}`
        if (!seconds) return out
        return `${out}:${('0' + date.getSeconds()).slice(-2)}`
    }

    /**
     * Returning a GuildMember object for specified identificator
     * @param {Message} message - Message send by user.
     * @param {string} identificator - Identificator, may be user id, username, user nickname.
     * @param {boolean} selfOnNone - Whether to return a message author if identificator is not specified. Default false.
     */
    public static async getMember(message: Message, identificator: string, selfOnNone = false): Promise<GuildMember> {
        await message.guild.members.fetch()
        return (message.guild.members.cache.find(member => member.user === message.mentions.users.first() || member.id === identificator || member.user.username.toLowerCase() === identificator.toLowerCase() || (member.nickname && member.nickname.toLowerCase() === identificator.toLowerCase()))) || ((!identificator && selfOnNone) ? message.member : null)
    }

    public static getAvatar(user: User): string {
        return user.avatarURL({ size: 128, format: "jpg" }) || user.defaultAvatarURL
    }

    public static getColor(color: string | HexColorString): ColorResolvable {
        if (color === 'error') return Colors.Error
        if (color === 'success') return Colors.Success
        if (color === 'warning') return Colors.Warning
        if (color === 'info') return Colors.Info
        if (color === 'neutral') return Colors.Neutral
        if (color === 'random') return 'RANDOM'
        if ((/^#[0-9A-Fa-f]{6}$/).test(color)) return color as HexColorString
        return null
    }

    public static getChannelCount(guild: Guild, type: 'GUILD_TEXT' | 'GUILD_VOICE'): number {
        return guild.channels.cache.filter(channel => channel.type === type).map(channel => channel).length
    }

    public static getChannelType(channel: string): ChannelType {
        return (<any>ChannelType)[channel]
    }
}