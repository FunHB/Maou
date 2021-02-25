import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'
import { Utils } from '../modules/utils'
import { MutedManager } from '../modules/mutedManager'

export class UnmuteCommand implements Command {
    public name = 'unmute'
    public description = 'Zdejmuje role wyciszonego!'
    public args = true
    public roles: string[] = [Config.modRole]
    public usage = '<użytkownik>'
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 0

    public async execute(message: Message, args: string[]): Promise<void> {
        const { guild } = message
        const member = await Utils.getMember(message, args.join(' '))
        const modlogChannel = guild.channels.cache.get(Config.modLogsChannel)
        const role = guild.roles.cache.get(Config.muteRole)
        const type = this.name

        if (!member) return

        if (!member.roles.cache.has(Config.muteRole)) {
            await message.channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Ta osoba nie jest wyciszona!'
            }))
            return
        }

        await member.roles.remove(role)
        await message.channel.send(Utils.getMessageFromType(member, type))

        if (modlogChannel.isText()) {
            await modlogChannel.send(Utils.getEmbedFromType(message, member.user, 'Ułaskawiony', type))
        }

        MutedManager.setMuted(guild.id)
        MutedManager.removeMuted(guild.id, member.id)
    }
}