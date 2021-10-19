import { Message, MessageEmbed, Permissions } from "discord.js";
import { Colors } from "../api/types/colors";
import { DatabaseManager } from "../database/databaseManager";
import { ChannelEntity, ChannelType } from "../database/entity/Channel";
import { RoleEntity, RoleType } from "../database/entity/Role";

export enum channelType {
    normal,
    commands,
    arts,
    reports,
    upload
}

export const RequireChannel = async (message: Message, channel: channelType): Promise<boolean> => {
    const { guild, member } = message
    const modRole = await DatabaseManager.getEntity(RoleEntity, { guild: message.guild.id, type: RoleType.mod })

    if (member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || (modRole && member.roles.cache.get(modRole.id)) || channel === channelType.normal || !channel || await (await getChannelByChannelType(guild.id, channel)).includes(message.channel.id)) return true

    await message.channel.send({
        embeds: [new MessageEmbed({
            color: Colors.Error,
            description: `Polecenia można używać jedynie na kanale <#${await getChannelByChannelType(guild.id, channel)}>`
        })]
    })
    return false
}

const getChannelByChannelType = async (guildid: string, type: channelType): Promise<string[]> => {
    const channelType = getChannelType(type)
    if (!channelType) return []
    const channels = await DatabaseManager.getEntities(ChannelEntity, { guild: guildid, type: channelType })
    if (!channels) return []
    return channels.map(channel => channel.id)
}

const getChannelType = (type: channelType): ChannelType => {
    if (type === channelType.commands) return ChannelType.commands
    if (type === channelType.arts) return ChannelType.arts
    if (type === channelType.reports) return ChannelType.reports
    if (type === channelType.upload) return ChannelType.upload
    return null
}