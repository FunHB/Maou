import { Message, MessageEmbed, Permissions } from "discord.js";
import { Colors } from "../api/types/colors";
import { DatabaseManager } from "../database/databaseManager";
import { ChannelEntity, ChannelType } from "../database/entity/Channel";
import { RoleEntity, RoleType } from "../database/entity/Role";

export const RequireChannel = async (message: Message, channel: ChannelType): Promise<boolean> => {
    const { guild, member } = message
    const modRole = await DatabaseManager.getEntity(RoleEntity, { guild: message.guild.id, type: RoleType.mod })

    if (member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || (modRole && member.roles.cache.get(modRole.id)) || channel === ChannelType.normal || !channel || await (await getChannelByChannelType(guild.id, channel)).includes(message.channel.id)) return true

    await message.channel.send({
        embeds: [new MessageEmbed({
            color: Colors.Error,
            description: `Polecenia można używać jedynie na kanale <#${await getChannelByChannelType(guild.id, channel)}>`
        })]
    })
    return false
}

const getChannelByChannelType = async (guildid: string, type: ChannelType): Promise<string[]> => {
    if (!type) return []
    const channels = await DatabaseManager.getEntities(ChannelEntity, { guild: guildid, type: type })
    return channels && channels.map(channel => channel.id)
}