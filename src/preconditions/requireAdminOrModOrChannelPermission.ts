import { Message, MessageEmbed, PermissionResolvable, Permissions } from "discord.js"
import { Colors } from "../api/colors"
import { Config } from "../config"

let _permission: PermissionResolvable

export const requireAdminOrModOrChannelPermission = (permission: PermissionResolvable): (message: Message) => Promise<boolean> => {
    _permission = permission
    return checkPermissions
}

const checkPermissions = async (message: Message): Promise<boolean> => {
    const { member, channel } = message
    const config = new Config()

    if (member.hasPermission(Permissions.FLAGS.ADMINISTRATOR) || (config.roles.mod && member.roles.cache.get(config.roles.mod))) return true

    if (channel.type !== 'dm') {
        if (channel.permissionOverwrites.get(member.id) && channel.permissionOverwrites.get(member.id).allow.has(_permission)) return true
    }

    await channel.send(new MessageEmbed({
        color: Colors.Error,
        image: {
            url: `https://i.giphy.com/RX3vhj311HKLe.gif`
        }
    }))
    return false
}