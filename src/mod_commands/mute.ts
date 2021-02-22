import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';
import { Config } from '../config'
import { ModCommand } from './modCommand';
const config = new Config()
const modCommand = new ModCommand()

export class MuteCommand implements Command {
    public name = 'mute'
    public description = 'Wycisza użytkownika na serwerze!'
    public aliases: string[] = ['wycisz']
    public args = true
    public roles: string[] = ['786941554090049556']
    public usage = '<użytkownik> [powód]'
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 0

    public async execute(message: Message, args: string[]): Promise<void> {
        const user = message.mentions.users.first()
        const reasonArg = args.slice(1).join(' ') || 'Brak.'
        const modlogChannel = message.guild.channels.cache.get(config.modLogsChannel)
        const errorCode = modCommand.errorCode(message, user)
        const role = message.guild.roles.cache.get(config.muteRole)
        const type = this.name

        if (errorCode) {
            await message.channel.send(new MessageEmbed({
                color: Colors.Error,
                description: modCommand.getMessageFromErrorCode(errorCode, type)
            }))
            return
        }

        await message.guild.members.cache.get(user.id).roles.add(role)
        await message.channel.send(modCommand.getMessageFromType(user, type))

        if (modlogChannel.isText()) {
            await modlogChannel.send(modCommand.getEmbedFromType(message, user, reasonArg, type))
        }
    }
}