import { Message, MessageEmbed, PermissionResolvable, Permissions } from "discord.js"
import { Colors } from "../api/colors"
import { DatabaseManager } from "../database/databaseManager"
import { RoleEntity, RoleType } from "../database/entity/Role"

let _permission: PermissionResolvable

export const requireAdminOrModOrChannelPermission = (permission: PermissionResolvable): (message: Message) => Promise<boolean> => {
    _permission = permission
    return checkPermissions
}

const checkPermissions = async (message: Message): Promise<boolean> => {
    const { member, channel } = message
    const modRole = await DatabaseManager.getEntity(RoleEntity, { guild: message.guild.id, type: RoleType.mod })

    if (member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || (modRole && member.roles.cache.get(modRole.id))) return true

    if (channel.type !== 'DM') {
        if (channel.permissionsFor(member.id) && channel.permissionsFor(member.id).has(_permission)) return true
    }

    await channel.send({
        embeds: [new MessageEmbed({
            color: Colors.Error,
            image: {
                url: `https://i.giphy.com/RX3vhj311HKLe.gif`
            }
        })]
    })
    return false
}