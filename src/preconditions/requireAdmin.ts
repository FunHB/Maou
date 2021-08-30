import { Message, MessageEmbed, Permissions } from "discord.js"
import { Colors } from "../api/colors"

export const RequireAdmin = async (message: Message): Promise<boolean> => {
    if (message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR)) return true

    await message.channel.send(new MessageEmbed({
        color: Colors.Error,
        image: {
            url: `https://animeislife449.files.wordpress.com/2016/10/giphy-2.gif`
        }
    }))
    return false
}