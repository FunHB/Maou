import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'
import { MutedManager } from '../modules/mutedManager'
import { Utils } from '../modules/utils'

export class ShowmutedCommand implements Command {
    public name = 'showmuted'
    public description = 'pokazuje wszystkich wyciszonych'
    public aliases: string[] = ['showm', 'smuted']
    public args = false
    public roles: string[] = [Config.modRole]
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 0

    public async execute(message: Message): Promise<void> {
        const { guild } = message

        MutedManager.setMuted(guild.id)

        const mutedUsers = MutedManager.getMuted(guild.id)

        await message.channel.send(new MessageEmbed({
            color: Colors.Info,
            title: 'Wyciszeni:',
            description: mutedUsers.map(user => `<@!${user.id}> [do: ${Utils.dateToString(new Date(new Date(user.start).getTime() + user.duration), true)}] - ${user.reason}`).join('\n')
        }))
    }
}