import { Message, MessageEmbed } from 'discord.js'
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

        const messageContent = args.join(' ')

        if (!messageContent) return

        if (channel.isText()) {
            await channel.send(messageContent)
        }

        await message.channel.send(new MessageEmbed({
            color: Colors.Success,
            description: `Wysłano wiadomość na kanał <#${channel.id}>`
        }))
    }
}