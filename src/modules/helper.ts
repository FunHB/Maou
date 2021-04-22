import { MessageEmbed } from 'discord.js'
import arts from '../data/artdatabase.json'
import { channelType } from '../api/channelType'
import { Utils } from '../services/utils'
import { Command } from '../api/command'
import { Colors } from '../api/colors'
import { Config } from '../config'
import { Module } from '../api/module'
import { getHelpForModule } from '../services/help'

export class Helper implements Module {
    public group = ''

    public commands: Command[] = [
        {
            name: 'dodaj role',
            description: 'Pozwala nadać sobie jedną z dostępnych ról',
            aliases: ['add role'],
            requireArgs: true,
            usage: '<nazwa roli>',
            channelType: channelType.botCommands,

            execute: async function (message, args) {
                const { guild, channel, member } = message
                const identificator = args.join(' ')
                Utils.setRoles(guild)
                const roles = Utils.roles.get(guild.id)
                const role = roles.find(role => role.id == identificator || role.name.toLowerCase() == identificator.toLowerCase())

                if (!role) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Nie znaleziono podanej roli!'
                    }))
                    return
                }

                if (member.roles.cache.has(role.id)) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: `Użytkownik <@${member.id}> posiada już rolę <@&${role.id}>!`
                    }))
                    return
                }

                await member.roles.add(role.id)

                await channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Użytkownik <@${member.id}> nadał sobie rolę <@&${role.id}>`
                }))
            }
        },

        {
            name: 'art',
            description: 'Wyświetla losowy obrazke z anime',
            aliases: ['obrazek', 'fanart'],
            channelType: channelType.artschannel,

            execute: async function (message) {
                const index = Math.floor(Math.random() * arts.length)

                await message.channel.send(new MessageEmbed({
                    color: 'RANDOM',
                    description: `<@!${message.author.id}> o to obrazek dla ciebie <3`,
                    image: { url: arts[index] },
                    footer: { text: `Index: ${index}` }
                }))
            }
        },

        {
            name: 'awatar',
            description: 'Wyświetla twój lub czyjś avatar',
            aliases: ['avatar'],
            usage: '[użytkownik]',
            channelType: channelType.botCommands,

            execute: async function (message, args) {
                const member = await Utils.getMember(message, args.join(' '), true)

                if (!member) return

                await message.channel.send(new MessageEmbed({
                    color: Colors.Info,
                    description: `Awatar dla: <@!${member.id}>`,
                    image: {
                        url: member.user.displayAvatarURL({
                            dynamic: true,
                            size: 128,
                            format: "png"
                        })
                    }
                }))
            }
        },

        {
            name: 'info',
            description: 'Wyświetla informacje o bocie',
            aliases: ['informacje'],
            channelType: channelType.botCommands,

            execute: async function (message) {
                const { client } = message
                await message.channel.send(new MessageEmbed({
                    color: Colors.Info,
                    author: {
                        name: `${client.user.tag}`,
                        iconURL: Utils.getAvatar(client.user)
                    },
                    description: 'Bot stworzony dla grupy Maou Subs!',
                    thumbnail: {
                        url: Utils.getAvatar(client.user)
                    },
                    fields: [
                        { name: 'Autor', value: Config.botAuthor, inline: true },
                        { name: 'Wersja', value: Config.botVersion, inline: true }
                    ],
                    footer: { text: `Aktualny czas ${Date().toLocaleString().slice(16, 21)}` }
                }))
            }
        },

        {
            name: 'ping',
            description: 'Sprawdza opóźnienie między botem a serwerem',
            channelType: channelType.botCommands,

            execute: async function (message) {
                const pingMessage = await message.channel.send('Ping?')
                await pingMessage.delete()
                await message.channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Ping **<@!${message.member.id}>** wynosi - \`${pingMessage.createdTimestamp - message.createdTimestamp}ms\``
                }))
            }
        },

        {
            name: 'rekrutacja',
            description: 'Pozwala przystąpić do rekrutacji',

            execute: async function (message) {
                const { guild, channel } = message
                const roleID = '820040781079117881'
                const categoryID = '769188299692310538'

                if (!Utils.getRecrutationStatus()) {
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

                await channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: 'Zgłoszenie zostało przyjęte.'
                }))

                await recrutationChannel.send(new MessageEmbed({
                    color: Colors.Info,
                    description: 'Witamy na Twoim prywatnym kanale rekrutacyjnym. Chcesz spróbować swoich sił jako tłumacz, korektor, czy uploader?'
                }))
            }
        },

        {
            name: 'zdejmij role',
            description: 'Zdejmuje użytkownikowi role',
            aliases: ['zdejmij role'],
            requireArgs: true,
            usage: '<nazwa roli>',
            channelType: channelType.botCommands,

            execute: async function (message, args) {
                const { guild, channel, member } = message
                const identificator = args.join(' ')
                Utils.setRoles(guild)
                const roles = Utils.roles.get(guild.id)
                const role = roles.find(role => role.id == identificator || role.name.toLowerCase() == identificator.toLowerCase())

                if (!role) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Nie znaleziono podanej roli!'
                    }))
                    return
                }

                if (!member.roles.cache.has(role.id)) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: `Użytkownik <@${member.id}> nie posiada roli <@&${role.id}>!`
                    }))
                    return
                }

                await member.roles.remove(role.id)

                await channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Użytkownik <@${member.id}> zabrał sobie rolę <@&${role.id}>`
                }))
            }
        },

        {
            name: 'zgłoś',
            description: 'Pozwala na zgłoszenie wiadomości użytkownika',
            aliases: ['raport', 'report', 'zgloś', 'zgłos', 'zglos'],
            requireArgs: true,
            usage: '<id wiadomości> <powód zgłoszenia>',

            execute: async function (message, args) {
                const { channel, author, guild } = message
                const reportChannel = message.guild.channels.cache.get(Config.reportsChannel)
                const reportedID = args.shift()
                const reason = args.join(' ')
                const reportedMessage = await channel.messages.fetch(reportedID)
                const errorCode = Utils.reportErrorCode(reportedID, reason, reportedMessage)

                if (errorCode) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: Utils.getReportMessageFromErrorCode(errorCode)
                    }))
                    return
                }

                if (message.deletable) {
                    await message.delete()
                }

                await channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: 'Wiadomość została zgłoszona!'
                }))

                if (reportChannel.isText()) {
                    const reportMessage = await reportChannel.send(new MessageEmbed({
                        color: Colors.Info,
                        description: 'Report',
                        fields: [
                            { name: 'Zgłoszone przez:', value: `Użytkownik: <@!${author.id}> ID: ${author.id}` },
                            { name: 'Zgłoszona osoba:', value: `Użytkownik: <@!${reportedMessage.author.id}> ID: ${reportedMessage.author.id}` },
                            { name: 'Zgłoszono na kanale:', value: `<#${channel.id}>` },
                            { name: 'Id zgłoszonej wiadmości:', value: reportedID },
                            { name: 'Link do zgłoszonej wiadomości:', value: `https://discord.com/channels/${guild.id}/${channel.id}/${reportedID}` },
                            { name: 'Czas:', value: Utils.dateToString(message.createdAt) },
                            { name: 'Powód:', value: reason },
                            { name: 'Wiadomość:', value: reportedMessage.content }
                        ]
                    }))
                    Utils.setReports(reportMessage.id, reportedMessage)
                }
            }
        },

        {
            name: 'serverinfo',
            description: 'Wyświetla informacje o serwerze',
            aliases: ['sinfo'],
            channelType: channelType.botCommands,

            execute: async function (message) {
                const { guild, channel } = message

                const roles = guild.roles.cache.sort((roleA, roleB) => roleB.position - roleA.position).map(role => role)

                await channel.send(new MessageEmbed({
                    color: Colors.Info,
                    author: {
                        name: `${guild.name}`,
                        iconURL: guild.iconURL({
                            size: 128,
                            format: "jpg"
                        })
                    },
                    thumbnail: {
                        url: 'https://i.imgur.com/VNpcKCA.png'
                    },
                    fields: [
                        { name: 'ID serwera', value: guild.id, inline: true },
                        { name: 'Właściciel', value: `<@!${guild.ownerID}>`, inline: true },
                        { name: 'Utworzono', value: Utils.dateToString(guild.createdAt), inline: true },
                        { name: 'Liczba użytkowników', value: guild.memberCount, inline: true },
                        { name: 'Kanały tekstowe', value: Utils.getChannelCount(guild, 'text'), inline: true },
                        { name: 'Kanały głosowe', value: Utils.getChannelCount(guild, 'voice'), inline: true },
                        { name: `Role:[${roles.length}]`, value: roles.join(', ').length > 1024 ? roles.join(', ').substring(0, 1023) : roles.join(', '), inline: true }
                    ]
                }))
            }
        },

        {
            name: 'wypisz role',
            description: 'Wypisuje możliwe do nadania sobie role',
            aliases: ['show roles'],
            channelType: channelType.botCommands,

            execute: async function (message) {
                const { guild, channel } = message
                Utils.setRoles(guild)
                const roles = Utils.roles.get(guild.id)

                await channel.send(new MessageEmbed({
                    color: Colors.Info,
                    description: roles.map(role => role).join('\n')
                }))
            }
        },

        {
            name: 'kto to',
            description: 'wyświetla informacje o użytkowniku',
            aliases: ['who is'],
            usage: '[użytkownik]',
            channelType: channelType.botCommands,

            execute: async function (message, args) {
                const member = await Utils.getMember(message, args.join(' '), true)

                if (!member) return

                const { user } = member
                const roles = member.roles.cache.filter(role => role.name !== '@everyone').sort((roleA , roleB) => roleB.position - roleA.position).map(role => role)

                await message.channel.send(new MessageEmbed({
                    color: Colors.Info,
                    author: {
                        name: `${user.username}`,
                        iconURL: Utils.getAvatar(user)
                    },
                    thumbnail: {
                        url: Utils.getAvatar(user)
                    },
                    fields: [
                        { name: 'id', value: member.id, inline: true },
                        { name: 'Pseudo', value: member.nickname || 'Brak', inline: true },
                        { name: 'Status', value: user.presence.status, inline: true },
                        { name: 'Bot', value: user.bot ? 'Tak' : 'Nie', inline: true },
                        { name: 'Utworzono', value: Utils.dateToString(user.createdAt) },
                        { name: 'Dołączono', value: Utils.dateToString(member.joinedAt) },
                        { name: `Role:[${roles.length}]`, value: roles.join(', ').length > 1024 ? roles.join(', ').substring(0, 1023) : roles.join(', ') || 'brak' }
                    ]
                }))
            }
        },

        {
            name: 'pomoc',
            description: 'Wyświetla listę wszystkich poleceń lub informacje o danym poleceniu',
            aliases: ['help', 'h'],
            usage: '[polecenie]',
            channelType: channelType.botCommands,

            execute: async function (message, args) {
                await message.channel.send(getHelpForModule(new Helper(), args.join(' ').toLowerCase()))
            }
        }
    ]
}