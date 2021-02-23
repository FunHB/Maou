import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';
import { Config } from '../config'
import { MutedManager } from '../modules/mutedManager';
import { ModCommand } from './modCommand';
const config = new Config()
const modCommand = new ModCommand()

export class UnmuteCommand implements Command {
    public name = 'unmute'
    public description = 'Zdejmuje role wyciszonego!'
    public args = true
    public roles: string[] = [config.modRole]
    public usage = '<użytkownik>'
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 0

    public async execute(message: Message): Promise<void> {
        const { guild } = message
        const user = message.mentions.users.first()
        const modlogChannel = guild.channels.cache.get(config.modLogsChannel)
        const role = guild.roles.cache.get(config.muteRole)
        const type = this.name

        if (!guild.members.cache.get(user.id).roles.cache.has(config.muteRole)) {
            await message.channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Ta osoba nie jest wyciszona!'
            }))
            return
        }

        await guild.members.cache.get(user.id).roles.remove(role)
        await message.channel.send(modCommand.getMessageFromType(user, type))

        if (modlogChannel.isText()) {
            await modlogChannel.send(modCommand.getEmbedFromType(message, user, 'Ułaskawiony', type))
        }

        const mutedUsers = new MutedManager()

        mutedUsers.removeMuted(user.id)
        mutedUsers.saveChanges()
    }
}