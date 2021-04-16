import { Message, MessageEmbed } from 'discord.js'
import { Colors, IMuted } from '../api'
import { Command } from '../commands/command'
import { Config } from '../config'
import { MutedManager } from '../modules/mutedManager'
import { Utils } from '../modules/utils'

export class MuteCommand extends Command {
    public name = 'mute'
    public description = 'Wycisza użytkownika na serwerze!'
    public aliases: string[] = ['wycisz']
    public requireArgs = true
    public group = 'mod'
    public usage = '<użytkownik> <czas trwania> [powód]'
    public cooldown = 0

    public async execute(message: Message, args: string[]): Promise<void> {
        const { channel, guild } = message

        const member = await Utils.getMember(message, args.shift())
        const duration = parseInt(args.shift())
        const reasonArg = args.join(' ') || 'Brak.'
        const modlogChannel = guild.channels.cache.get(Config.modLogsChannel)
        const errorCode = Utils.errorCode(message, member)
        const type = this.name

        if (isNaN(duration)) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Musisz podać czas trwania wyciszenia!'
            }))
            return
        }

        if (duration < 1) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Czas wyciszenia nie może wynosić mniej niż jedna godzina!'
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

        await member.roles.add(Config.muteRole)
        await channel.send(Utils.getMessageFromType(member, type))

        if (modlogChannel.isText()) {
            await modlogChannel.send(Utils.getEmbedFromType(message, member.user, reasonArg, type).addField('Na ile:', `${this.getDurationString(duration)}`))
        }

        const muteUser: IMuted = {
            id: member.id,
            reason: reasonArg,
            start: message.createdAt,
            duration: (duration * 60 * 60 * 1000) 
        }
        
        MutedManager.setMuted(guild.id)
        MutedManager.addMuted(guild.id, muteUser)
    }

    private getDurationString(duration: number): string {
        const days = Math.floor(duration / 24)
        const hours = duration - (days * 24)
        return `${days} dni ${hours} godzin`
    }
}