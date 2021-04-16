import { Message, MessageAttachment, MessageEmbed } from 'discord.js'
import { Colors } from '../api'
import { Command } from '../commands/command'

export class SendMsgCommand extends Command {
    public name = 'sendmsg'
    public description = 'Wysyła wiadomość na podany kanał'
    public requireArgs = true
    public group = 'mod'
    public usage = '<id kanału> <wiadomość>'

    public async execute(message: Message, args: string[]): Promise<void> {
        const channel = message.guild.channels.cache.get(args.shift())

        if (!channel) return

        const { attachments, messageContent } = this.getAttachmentsAndMessageContent(args.join(' '))

        if (channel.isText()) {
            await channel.send(messageContent, {
                files: message.attachments.array().concat(attachments)
            })
        }

        await message.channel.send(new MessageEmbed({
            color: Colors.Success,
            description: `Wysłano wiadomość na kanał <#${channel.id}>`
        }))
    }

    private getAttachmentsAndMessageContent(messageContent: string): { attachments: MessageAttachment[], messageContent: string } {
        const regex = /(https:\/\/)\S*[(.png)(.jpg)(.gif)(.jpeg)(.mp4)(.mp3)]/gm
        const links: string[] = messageContent.match(regex)
        const attachments: MessageAttachment[] = []

        if (links) {
            links.forEach(link => {
                attachments.push(new MessageAttachment(link, Math.random().toString(36).substring(2) + '.' + link.split('.').pop()))
            })
        }

        return { attachments: attachments, messageContent: messageContent.replace(regex, '') }
    }
}