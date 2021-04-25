import { Message, MessageEmbed, PartialMessage, User } from "discord.js";
import { Colors } from "../api/colors";
import { Config } from "../config";
import { Utils } from "../extentions/utils";

export class MessageDelete {
    public static async handle(message: Message | PartialMessage): Promise<void> {
        const { guild, member, channel } = message
        const { user } = member
        const messageDeleteLogChannel = guild.channels.cache.get(Config.messageDeleteLogChannel)
        const executor = await this.getExecutor(message)
        const messageContent = await this.getMessageContentOrAttachments(message)

        if (executor.bot || !messageContent) return

        console.info(`[Message Delete] by: ${user.tag} content: ${messageContent}`)

        if (messageDeleteLogChannel.isText()) {
            await messageDeleteLogChannel.send((new MessageEmbed({
                color: Colors.Error,
                author: {
                    name: `${user.username}`,
                    iconURL: Utils.getAvatar(user)
                },
                description: messageContent,
                fields: [
                    { name: 'ID użytkownika', value: user.id, inline: true },
                    { name: 'Nazwa użytkownika', value: user.username || 'Brak', inline: true },
                    { name: '\u200b', value: '\u200b', inline: true },
                    { name: 'ID kanału', value: channel.id, inline: true },
                    { name: 'Nazwa kanału', value: guild.channels.cache.get(channel.id).name, inline: true },
                    { name: '\u200b', value: '\u200b', inline: true },
                    { name: 'Usunięto przez', value: executor.username }
                ]
            })))
        }
    }

    private static async getExecutor(message: Message | PartialMessage): Promise<User> {
        const { guild, author } = message
        const { executor, target, createdTimestamp } = await guild.fetchAuditLogs({ limit: 1, type: 'MESSAGE_DELETE' }).then(audit => audit.entries.first())

        if (target.valueOf() === author.id && createdTimestamp > (Date.now() - 5000)) return executor
        return author
    }

    private static async getMessageContentOrAttachments(message: Message | PartialMessage): Promise<string> {
        let output: string[] = []
        if (message.content) output.push(message.content)
        if (message.attachments) output.push(message.attachments.map(attachment => attachment.attachment).join('\n'))
        return output.join('\n')
    }
}