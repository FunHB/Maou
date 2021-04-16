import { Message, MessageEmbed } from 'discord.js'
import { Colors } from '../api'
import { Command } from '../commands/command'
import { MutedManager } from '../modules/mutedManager'
import { Utils } from '../modules/utils'

export class ShowmutedCommand extends Command {
    public name = 'show muted'
    public description = 'Pokazuje wszystkich wyciszonych!'
    public aliases: string[] = ['pokaż wyciszonych']
    public requireArgs = false
    public group = 'mod'
    public cooldown = 0

    public async execute(message: Message): Promise<void> {
        const { guild } = message

        MutedManager.setMuted(guild.id)

        const mutedUsers = MutedManager.getMuted(guild.id)

        await message.channel.send(new MessageEmbed({
            color: Colors.Info,
            title: 'Wyciszeni:',
            description: mutedUsers.map(user => `<@!${user.id}> [do: ${Utils.dateToString(new Date(new Date(user.start).getTime() + user.duration), false)}] - ${user.reason}`).join('\n')
        }))
    }
}