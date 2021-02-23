import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command, Muted } from '../api';
import { Config } from '../config'
import { MutedManager } from '../modules/mutedManager';
import { ModCommand } from './modCommand';

export class MuteCommand implements Command {
    public name = 'mute'
    public description = 'Wycisza użytkownika na serwerze!'
    public aliases: string[] = ['wycisz']
    public args = true
    public roles: string[] = [Config.modRole]
    public usage = '<użytkownik> [czas trwania] [powód]'
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 0

    public async execute(message: Message, args: string[]): Promise<void> {
        const user = message.mentions.users.first()
        const duration = this.getDuration(args)
        const reasonArg = args.slice(1).join(' ') || 'Brak.'
        const modlogChannel = message.guild.channels.cache.get(Config.modLogsChannel)
        const errorCode = ModCommand.errorCode(message, user)
        const role = message.guild.roles.cache.get(Config.muteRole)
        const type = this.name

        if (errorCode) {
            await message.channel.send(new MessageEmbed({
                color: Colors.Error,
                description: ModCommand.getMessageFromErrorCode(errorCode, type)
            }))
            return
        }

        await message.guild.members.cache.get(user.id).roles.add(role)
        await message.channel.send(ModCommand.getMessageFromType(user, type))

        if (modlogChannel.isText()) {
            await modlogChannel.send(ModCommand.getEmbedFromType(message, user, reasonArg, type).addField('Na ile:', `${this.getDurationString(duration)}`))
        }

        const mutedUsers = new MutedManager()
        const muteUser: Muted = {
            id: user.id,
            guildID: message.guild.id,
            reason: reasonArg,
            start: message.createdAt,
            duration: (duration * 60 * 60 * 1000) 
        }

        mutedUsers.addMuted(muteUser)
        mutedUsers.saveChanges()
    }

    private getDuration(args: string[]): number {
        const tmp = args.shift()
        const duration = parseInt(tmp)
        if (!isNaN(duration)) return duration
        args.unshift(tmp)
        return 24
    }

    private getDurationString(duration: number): string {
        const days = Math.floor(duration / 24)
        const hours = duration - (days * 24)
        return `${days} dni ${hours} godzin`
    }
}