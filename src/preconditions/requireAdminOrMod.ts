import { Message, MessageEmbed, Permissions } from "discord.js"
import { Colors } from "../api/colors"
import { DatabaseManager } from "../database/databaseManager"
import { RoleEntity, RoleType } from "../database/entity/Role"

export const RequireAdminOrMod = async (message: Message): Promise<boolean> => {
    const modRole = await DatabaseManager.getEntity(RoleEntity, { guild: message.guild.id, type: RoleType.mod })
    if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || (modRole && message.member.roles.cache.get(modRole.id))) return true

    await message.channel.send({
        embeds: [new MessageEmbed({
            color: Colors.Error,
            image: {
                url: `https://i.giphy.com/RX3vhj311HKLe.gif`
            }
        })]
    })
    return false
}