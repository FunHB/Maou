import { Message, MessageAttachment, MessageEmbed } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'

export class SendMsgCommand implements Command {
    public name = 'sendmsg'
    public description = 'Wysyła wiadomość na podany kanał'
    public aliases: string[] = ['wyślijwiadomość', 'wyślijwiadomośc', 'wyślijwiadomosć', 'wyslijwiadomosc', 'wyslijwiadomość', 'wyslijwiadomośc', 'wyslijwiadomosć', 'wyslijwiadomosc']
    public args = true
    public roles: string[] = [Config.modRole]
    public usage = '<id kanału> <wiadomość>'
    public channelType: channelType = channelType.normal
    public guildonly = true

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

        links.forEach(link => {
            attachments.push(new MessageAttachment(link, Math.random().toString(36).substring(2) + '.' + link.split('.').pop()))
        })

        return { attachments: attachments, messageContent: messageContent.replace(regex, '') }
    }
}