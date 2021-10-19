import { Message, MessageEmbed, Permissions } from "discord.js"
import { Colors } from "../api/types/colors"

export const RequireAdmin = async (message: Message): Promise<boolean> => {
    if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return true

    await message.channel.send({
        embeds: [new MessageEmbed({
            color: Colors.Error,
            image: {
                url: `https://animeislife449.files.wordpress.com/2016/10/giphy-2.gif`
            }
        })]
    })
    return false
}