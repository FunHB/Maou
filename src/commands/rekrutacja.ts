import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { ModRekrutacjaCommand } from '../mod_commands/rekrutacja'

export class RekrutacjaCommand implements Command {
    public name = 'rekrutacja'
    public description = 'polecenie do rekrutacji'
    public args = false
    public channelType: channelType = channelType.normal
    public guildonly = true

    public async execute(message: Message): Promise<void> {
        const { guild, channel } = message
        const roleID = '820040781079117881'
        const categoryID = '769188299692310538'

        if (!ModRekrutacjaCommand.status) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Rekrutacja została zakończona!'
            }))
            return
        }

        if (guild.channels.cache.find(channel => channel.name == message.author.username.toLowerCase())) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Już masz kanał rekrutacyjny!'
            }))
            return
        }

        await channel.send(new MessageEmbed({
            color: Colors.Success,
            description: 'Zgłoszenie zostało przyjęte.'
        }))

        const recrutationChannel = await guild.channels.create(message.author.username, {
            type: 'text',
            parent: categoryID,
            permissionOverwrites: [
                {
                    type: 'role',
                    id: guild.roles.everyone.id,
                    deny: ['VIEW_CHANNEL']
                },
                {
                    type: 'member',
                    id: message.author.id,
                    allow: ['VIEW_CHANNEL']
                },
                {
                    type: 'role',
                    id: roleID,
                    allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES']
                }
            ]
        })

        await recrutationChannel.send(new MessageEmbed({
            color: Colors.Info,
            description: 'Witamy na Twoim prywatnym kanale rekrutacyjnym. Chcesz spróbować swoich sił jako tłumacz, korektor, czy uploader?'
        }))
    }
}