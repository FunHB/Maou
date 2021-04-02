import { Message, MessageEmbed, PartialMessage } from "discord.js";
import { Colors } from "../api";
import { Config } from "../config";
import { Utils } from './utils'

export class MessageDelete {
    public static async handle(message: Message | PartialMessage): Promise<void> {
        const { guild, member, channel } = message
        const { user } = member
        const messageDeleteLogChannel = guild.channels.cache.get(Config.messageDeleteLogChannel)

        if (user.bot) return

        console.info('Message Delete: ', user.tag, message.content)

        if (messageDeleteLogChannel.isText()) {
            await messageDeleteLogChannel.send((new MessageEmbed({
                color: Colors.Error,
                author: {
                    name: `${user.username}`,
                    iconURL: Utils.getAvatar(user)
                },
                fields: [
                    { name: 'Skasowana wiadomość', value: message.content },
                    { name: 'ID użytkownika', value: user.id, inline: true },
                    { name: 'Nazwa użytkownika', value: user.username || 'Brak', inline: true },
                    { name: '\u200b', value: '\u200b', inline: true },
                    { name: 'ID kanału', value: channel.id, inline: true },
                    { name: 'Nazwa kanału', value: guild.channels.cache.get(channel.id).name, inline: true },
                    { name: '\u200b', value: '\u200b', inline: true },
                    { name: 'Usunięto przez', value: await this.getExecutorUsername(message) }
                ]
            })))
        }
    }

    private static async getExecutorUsername(message: Message | PartialMessage): Promise<string> {
        const { guild, author } = message
        const { executor, target, createdTimestamp } = await guild.fetchAuditLogs({ limit: 1, type: 'MESSAGE_DELETE' }).then(audit => audit.entries.first())

        if (target.valueOf() === author.id && createdTimestamp > (Date.now() - 5000)) {
            return executor.username
        }
        return author.username
    }
}