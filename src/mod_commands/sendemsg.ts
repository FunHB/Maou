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

        const messageContent = args.join()

        if (!messageContent) return

        if (channel.isText()) {
            await channel.send(new MessageEmbed({
                color: color,
                description: messageContent.length < 1024 ? messageContent : messageContent.slice(0, 1023)
            }))
        }

        await message.channel.send(new MessageEmbed({
            color: Colors.Success,
            description: `Wysłano wiadomość na kanał <#${channel.id}>`
        }))
    }
}