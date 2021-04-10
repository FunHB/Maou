import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'
import { Utils } from '../modules/utils'

export class SendEMsgCommand implements Command {
    public name = 'sendemsg'
    public description = 'Wysyła wiadomość embed na podany kanał'
    public aliases: string[] = ['sendembed']
    public args = true
    public roles: string[] = [Config.modRole]
    public usage = '<id kanału> <kolor> <treść wiadomości>\nkolory: `error`, `info`, `success`, `warning`, `neutral`'
    public channelType: channelType = channelType.normal
    public guildonly = true

    public async execute(message: Message, args: string[]): Promise<void> {
        const channel = message.guild.channels.cache.get(args.shift())

        if (!channel) return

        const color = Utils.getColor(args.shift().toLowerCase())

        if (!color) return

        if (channel.isText()) {
            await channel.send(this.getEmbed(color, args.join(' ')))
        }

        await message.channel.send(new MessageEmbed({
            color: Colors.Success,
            description: `Wysłano wiadomość na kanał <#${channel.id}>`
        }))
    }

    private getEmbed(color: Colors, messageContent: string): MessageEmbed {
        const regex = /(https:\/\/)\S*[(.png)(.jpg)(.gif)(.jpeg)(.mp4)(.mp3)]/gm
        const links: string[] = messageContent.match(regex)
        const content = messageContent.replace(regex, '')

        const embed = new MessageEmbed().setColor(color)

        if (links && links.length > 0) {
            embed.setImage(links[0])
            if (links.length > 1) embed.setThumbnail(links[1])
        }

        if (content.length > 0) embed.setDescription(content)

        return embed
    }
}