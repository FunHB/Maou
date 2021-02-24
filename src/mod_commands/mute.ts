import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';
import { Config } from '../config'
import { Utils } from '../modules/utils'
// import { MutedManager } from '../modules/mutedManager'

export class MuteCommand implements Command {
    public name = 'mute'
    public description = 'Wycisza użytkownika na serwerze!'
    public aliases: string[] = ['wycisz']
    public args = true
    public roles: string[] = [Config.modRole]
    public usage = '<użytkownik> <czas trwania> [powód]'
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 0

    public async execute(message: Message, args: string[]): Promise<void> {
        const { channel } = message

        const member = await Utils.getUser(message, args.shift())
        const duration = parseInt(args.shift())
        const reasonArg = args.join(' ') || 'Brak.'
        const modlogChannel = message.guild.channels.cache.get(Config.modLogsChannel)
        const errorCode = Utils.errorCode(message, member)
        const role = message.guild.roles.cache.get(Config.muteRole)
        const type = this.name

        if (isNaN(duration)) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Musisz podać czas trwania wyciszenia!'
            }))
            return
        }

        if (errorCode) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: Utils.getMessageFromErrorCode(errorCode, type)
            }))
            return
        }

        await member.roles.add(role)
        await channel.send(Utils.getMessageFromType(member, type))

        if (modlogChannel.isText()) {
            await modlogChannel.send(Utils.getEmbedFromType(message, member.user, reasonArg, type).addField('Na ile:', `${this.getDurationString(duration)}`))
        }

        /* Database is required
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
        */
    }

    private getDurationString(duration: number): string {
        const days = Math.floor(duration / 24)
        const hours = duration - (days * 24)
        return `${days} dni ${hours} godzin`
    }
}