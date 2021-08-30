import { Message, MessageEmbed, Permissions } from "discord.js"
import { Colors } from "../api/colors"
import { Config } from "../config"

export const RequireAdminOrMod = async (message: Message): Promise<boolean> => {
    const config = new Config()
    if (message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR) || (config.roles.mod && message.member.roles.cache.get(config.roles.mod))) return true

    await message.channel.send(new MessageEmbed({
        color: Colors.Error,
        image: {
            url: `https://i.giphy.com/RX3vhj311HKLe.gif`
        }
    }))
    return false
}