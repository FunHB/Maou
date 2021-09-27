import { Message, MessageEmbed } from 'discord.js'
import { AddableRoles } from '../extensions/addableRoles'
import { Utils } from '../extensions/utils'
import { Command } from '../api/command'
import { Colors } from '../api/colors'
import { Config } from '../config'
import { Module } from '../api/module'
import { Arts } from '../extensions/arts'
import { Moderations } from './moderations'
import { channelType } from '../preconditions/requireChannel'
import { PenaltyEntity, PenaltyType } from '../database/entity/Penalty'
import { ReportEntity } from '../database/entity/Report'
import { DatabaseManager } from '../database/databaseManager'
import { Help } from '../extensions/help'
import fs from 'fs'
import { ChannelEntity, ChannelType } from '../database/entity/Channel'
import { RoleEntity, RoleType } from '../database/entity/Role'
import { PenaltiesManager } from '../services/penaltiesManager'
import { ExpManager } from '../services/expManager'
import { MessageEntity, MessageType } from '../database/entity/Message'

export class Helper implements Module {
    public name = 'Podstawowe'
    public group = ''
    public help: Help

    constructor(...modules: Module[]) {
        this.help = new Help(this, ...modules)
    }

    public commands: Command[] = [
        {
            name: 'dodaj role',
            description: 'Pozwala nadać sobie jedną z dostępnych ról',
            aliases: ['add role'],
            requireArgs: true,
            usage: '<nazwa roli>',
            channelType: channelType.commands,

            execute: async function (message, args) {
                const { guild, channel, member } = message
                const identificator = args.join(' ')
                const roles = await AddableRoles.getRoles(guild)
                const role = roles.find(role => role.id == identificator || role.name.toLowerCase() == identificator.toLowerCase())

                if (!role) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Nie znaleziono podanej roli!'
                        })]
                    })
                    return
                }

                if (member.roles.cache.has(role.id)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: `Użytkownik <@${member.id}> posiada już rolę <@&${role.id}>!`
                        })]
                    })
                    return
                }

                await member.roles.add(role.id)

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Użytkownik <@${member.id}> nadał sobie rolę <@&${role.id}>`
                    })]
                })
            }
        },

        {
            name: 'art',
            description: 'Wyświetla losowy obrazke z anime',
            aliases: ['obrazek', 'fanart'],
            channelType: channelType.arts,

            execute: async function (message) {
                const artUrl = await Arts.getRandomImage()

                await message.channel.send({
                    embeds: [new MessageEmbed({
                        color: 'RANDOM',
                        description: `<@!${message.author.id}> o to obrazek dla ciebie <3`,
                        image: { url: artUrl },
                    })]
                })
            }
        },

        {
            name: 'awatar',
            description: 'Wyświetla twój lub czyjś avatar',
            aliases: ['avatar'],
            usage: '[użytkownik]',
            channelType: channelType.commands,

            execute: async function (message, args) {
                const member = await Utils.getMember(message, args.join(' '), true)

                if (!member) return

                await message.channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Info,
                        description: `Awatar dla: <@!${member.id}>`,
                        image: {
                            url: member.user.displayAvatarURL({
                                dynamic: true,
                                size: 128,
                                format: "png"
                            })
                        }
                    })]
                })
            }
        },

        {
            name: 'info',
            description: 'Wyświetla informacje o bocie',
            aliases: ['informacje'],
            channelType: channelType.commands,

            execute: async function (message) {
                const config = new Config()
                const { client } = message
                await message.channel.send({
                    embeds: [new MessageEmbed({
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
                            { name: 'Autor', value: config.creator, inline: true },
                            { name: 'Wersja', value: config.version, inline: true }
                        ],
                        footer: { text: `Aktualny czas ${Date().toLocaleString().slice(16, 21)}` }
                    })]
                })
            }
        },

        {
            name: 'ping',
            description: 'Sprawdza opóźnienie między botem a serwerem',
            channelType: channelType.commands,

            execute: async function (message) {
                const pingMessage = await message.channel.send('Ping?')
                await pingMessage.delete()
                await message.channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Ping **<@!${message.member.id}>** wynosi - \`${pingMessage.createdTimestamp - message.createdTimestamp}ms\``
                    })]
                })
            }
        },

        {
            name: 'rekrutacja',
            description: 'Pozwala przystąpić do rekrutacji',
            aliases: ['recrutation'],

            execute: async function (message) {
                const { guild, channel, member } = message

                if (!fs.existsSync('recrutation')) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Aktualnie nie prowadzimy rekrutacji!'
                        })]
                    })
                    return
                }

                const recrutationCategory = await DatabaseManager.getEntity(ChannelEntity, { guild: guild.id, type: ChannelType.recrutation })

                if (!recrutationCategory) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Nie ustawiono kategorii na kanały rekrutacyjne!'
                        })]
                    })
                    return
                }

                if (guild.channels.cache.find(channel => channel.name == (member.nickname || member.user.username).toLowerCase())) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Kanał rekrutacyjny już istnieje!'
                        })]
                    })
                    return
                }

                const recrutationRole = await DatabaseManager.getEntity(RoleEntity, { guild: guild.id, type: RoleType.recrutation })
                const recrutationChannel = await guild.channels.create((member.nickname || member.user.username), {
                    type: 'GUILD_TEXT',
                    parent: recrutationCategory.id,
                    permissionOverwrites: [
                        {
                            type: 'role',
                            id: guild.roles.everyone.id,
                            deny: ['VIEW_CHANNEL']
                        },
                        {
                            type: 'member',
                            id: member.id,
                            allow: ['VIEW_CHANNEL']
                        },
                        {
                            type: 'role',
                            id: recrutationRole.id || '',
                            allow: ['VIEW_CHANNEL', 'MANAGE_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_ROLES']
                        }
                    ]
                })

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: 'Zgłoszenie zostało przyjęte.'
                    })]
                })

                const recrutationMessage = await DatabaseManager.getEntity(MessageEntity, { guild: member.guild.id, type: MessageType.recrutation })

                if (!recrutationMessage || recrutationMessage.value === 'off') return
                await recrutationChannel.send(`${recrutationMessage.value.replace(/({user})/g, `<@${member.id}>`)} (<@&${recrutationRole.id}>)`)
            }
        },

        {
            name: 'zdejmij role',
            description: 'Zdejmuje użytkownikowi role',
            aliases: ['zdejmij role'],
            requireArgs: true,
            usage: '<nazwa roli>',
            channelType: channelType.commands,

            execute: async function (message, args) {
                const { guild, channel, member } = message
                const identificator = args.join(' ')
                const roles = await AddableRoles.getRoles(guild)
                const role = roles.find(role => role.id == identificator || role.name.toLowerCase() == identificator.toLowerCase())

                if (!role) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Nie znaleziono podanej roli!'
                        })]
                    })
                    return
                }

                if (!member.roles.cache.has(role.id)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: `Użytkownik <@${member.id}> nie posiada roli <@&${role.id}>!`
                        })]
                    })
                    return
                }

                await member.roles.remove(role.id)

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Użytkownik <@${member.id}> zabrał sobie rolę <@&${role.id}>`
                    })]
                })
            }
        },

        {
            name: 'zgłoś',
            description: 'Pozwala na zgłoszenie wiadomości użytkownika',
            aliases: ['raport', 'report', 'zgloś', 'zgłos', 'zglos'],
            requireArgs: true,
            usage: '<id wiadomości> <powód zgłoszenia>',

            execute: async function (message, args) {
                const { channel, member, guild } = message
                const reportChannel = message.guild.channels.cache.get((await DatabaseManager.getEntity(ChannelEntity, { guild: guild.id, type: ChannelType.reports })).id)
                const reportedID = args.shift()
                const reason = args.join(' ')

                if (!reason) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Musisz podać powód zgłoszenia!'
                        })]
                    })
                }

                let reportedMessage: Message

                try {
                    reportedMessage = await channel.messages.fetch(reportedID)
                    if (Date.now() - reportedMessage.createdTimestamp > 10800000) throw 'Time expired'
                } catch (exception) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'nie znaleziono wiadomości, lub wiadomość jest starsza niż 3 godziny!'
                        })]
                    })
                    console.info(`[Report] ${exception}`)
                    return
                }

                if (message.deletable) {
                    await message.delete()
                }

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: 'Wiadomość została zgłoszona!'
                    })]
                })

                if (member.id === reportedMessage.author.id) {
                    const penalty = new PenaltyEntity({
                        user: member.id,
                        guild: member.guild.id,
                        reason: 'Skoro tak bardzo chcesz',
                        startDate: message.createdAt,
                        duration: 24,
                        type: PenaltyType.mute
                    })

                    await PenaltiesManager.addPenalty(member, penalty)
                    await Moderations.notifyAboutPenalty(guild, member.user, penalty, 'Maou')

                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Success,
                            description: `<@${member.id}> został wyciszony`
                        })]
                    })
                    return
                }

                if (reportChannel && reportChannel.isText()) {
                    const reportMessage = await reportChannel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Info,
                            title: 'Report',
                            description: reportedMessage.content,
                            fields: [
                                { name: 'Zgłoszone przez:', value: `Użytkownik: <@!${member.id}> ID: ${member.id}` },
                                { name: 'Zgłoszona osoba:', value: `Użytkownik: <@!${reportedMessage.author.id}> ID: ${reportedMessage.author.id}` },
                                { name: 'Zgłoszono na kanale:', value: `<#${channel.id}>` },
                                { name: 'Id zgłoszonej wiadmości:', value: reportedID },
                                { name: 'Link do zgłoszonej wiadomości:', value: `https://discord.com/channels/${guild.id}/${channel.id}/${reportedID}` },
                                { name: 'Czas:', value: Utils.dateToString(message.createdAt) },
                                { name: 'Powód:', value: reason.substring(0, 1023) },
                            ]
                        })]
                    })

                    const report = new ReportEntity({
                        reportId: reportMessage.id,
                        guild: guild.id,
                        reportedUserId: reportedMessage.author.id,
                        reportingUserId: member.id,
                        channelId: channel.id,
                        messageId: reportedID,
                        date: message.createdAt,
                        reason: reason,
                        message: reportedMessage.content
                    })

                    await DatabaseManager.save(report)
                }
            }
        },

        {
            name: 'serverinfo',
            description: 'Wyświetla informacje o serwerze',
            aliases: ['sinfo'],
            channelType: channelType.commands,

            execute: async function (message) {
                const { guild, channel } = message

                const roles = guild.roles.cache.sort((roleA, roleB) => roleB.position - roleA.position).map(role => role)

                await channel.send({
                    embeds: [new MessageEmbed({
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
                            { name: 'Właściciel', value: `<@!${guild.ownerId}>`, inline: true },
                            { name: 'Utworzono', value: Utils.dateToString(guild.createdAt), inline: true },
                            { name: 'Liczba użytkowników', value: guild.memberCount.toFixed(), inline: true },
                            { name: 'Kanały tekstowe', value: Utils.getChannelCount(guild, 'GUILD_TEXT').toFixed(), inline: true },
                            { name: 'Kanały głosowe', value: Utils.getChannelCount(guild, 'GUILD_VOICE').toFixed(), inline: true },
                            { name: `Role:[${roles.length}]`, value: roles.join(', ').length > 1024 ? roles.join(', ').substring(0, 1023) : roles.join(', '), inline: true }
                        ]
                    })]
                })
            }
        },

        {
            name: 'wypisz role',
            description: 'Wypisuje możliwe do nadania sobie role',
            aliases: ['show roles'],
            channelType: channelType.commands,

            execute: async function (message) {
                const { guild, channel } = message
                const roles = await AddableRoles.getRoles(guild)

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Info,
                        description: roles.map(role => role).join('\n') || 'Brak.'
                    })]
                })
            }
        },

        {
            name: 'kto to',
            description: 'wyświetla informacje o użytkowniku',
            aliases: ['who is'],
            usage: '[użytkownik]',
            channelType: channelType.commands,

            execute: async function (message, args) {
                const member = await Utils.getMember(message, args.join(' '), true)

                if (!member) return

                const { user } = member
                const roles = member.roles.cache.filter(role => role.name !== '@everyone').sort((roleA, roleB) => roleB.position - roleA.position).map(role => role)

                await message.channel.send({
                    embeds: [new MessageEmbed({
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
                            { name: 'Status', value: member.presence.status, inline: true },
                            { name: 'Bot', value: user.bot ? 'Tak' : 'Nie', inline: true },
                            { name: 'Utworzono', value: Utils.dateToString(user.createdAt) },
                            { name: 'Dołączono', value: Utils.dateToString(member.joinedAt) },
                            { name: `Role:[${roles.length}]`, value: roles.join(', ').length > 1024 ? roles.join(', ').substring(0, 1023) : roles.join(', ') || 'brak' }
                        ]
                    })]
                })
            }
        },

        {
            name: 'iledopoziomu',
            description: 'Pokazuje brakujące punkty doświadczenia do awansu na kolejny poziom',
            aliases: ['idp', 'howmuchtolevelup', 'hmtlu', 'xp'],

            execute: async function (message) {
                const { channel, member } = message

                const user = await ExpManager.getUserOrCreate(member.id)
                const diff = ExpManager.expToNextLevel(user) - user.exp

                channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Info,
                        description: `<@${member.id}> potrzebuje ${diff.toFixed(0)} punktów doświadczenia do następnego poziomu.`
                    })]
                })
            }
        },

        {
            name: 'poziom',
            description: 'Pokazuje aktualny poziom użytkownika',
            aliases: ['level', 'lvl'],

            execute: async function (message) {
                const { channel, member } = message

                const user = await ExpManager.getUserOrCreate(member.id)

                channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Info,
                        description: `<@${member.id}> ma poziom **${user.level}**`
                    })]
                })
            }
        },

        // {
        //     name: 'vote mute',
        //     description: 'Rozpoczyna głosowanie o wyciszenie użytkownika',
        //     requireArgs: true,
        //     usage: '<użytkownik>',

        //     execute: async function (message, args) {
        //         const { member, guild, channel } = message
        //         const config = new Config()
        //         const emoji = '723131979540725841'

        //         const memberToMute = await Utils.getMember(message, args.shift())

        //         if (member.roles.cache.has(config.roles.mute) || memberToMute.roles.cache.has(config.roles.mute)) {
        //             channel.send({
        //                 embeds: [new MessageEmbed({
        //                     color: Colors.Error,
        //                     description: 'Ta zabawa nie ma sensu, jak biorący udział jest już wyciszony!'
        //                 })]
        //             })
        //             return
        //         }

        //         let votesMultiplier = 1

        //         if (memberToMute.roles.cache.has(config.roles.mod)) votesMultiplier = 2
        //         if (memberToMute.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) votesMultiplier = 3

        //         if (memberToMute === member) {
        //             const penalty = new PenaltyEntity({
        //                 user: member.id,
        //                 guild: member.guild.id,
        //                 reason: 'Głosowanie nie będzie potrzebne',
        //                 startDate: new Date(),
        //                 duration: (4 - votesMultiplier) * 24,
        //                 type: PenaltyType.mute
        //             })
        //             await member.roles.add(config.roles.mute)
        //             await DatabaseManager.save(penalty)
        //             await Moderations.notifyAboutPenalty(guild, member.user, penalty, 'Maou')
        //             return
        //         }

        //         let votes = 0
        //         const maxVotes = votesMultiplier * 10

        //         const vote = await channel.send({
        //             embeds: [new MessageEmbed({
        //                 color: Colors.Warning,
        //                 description: `Głosowanie za wyciszeniem użytkownika <@${memberToMute.id}> rozpoczęte`,
        //                 footer: { text: `${votes} / ${maxVotes}` }
        //             })]
        //         })

        //         await vote.react(emoji)

        //         const collector = vote.createReactionCollector((reaction: MessageReaction) => reaction.emoji.id === emoji, {
        //             time: 300000,
        //             maxUsers: maxVotes,
        //             dispose: true
        //         })

        //         collector.on('collect', async () => {
        //             await vote.edit({ embeds: [vote.embeds[0].setFooter(`${++votes} / ${maxVotes}`)] })
        //         })

        //         collector.on('remove', async () => {
        //             await vote.edit({ embeds: [vote.embeds[0].setFooter(`${--votes} / ${maxVotes}`)] })
        //         })

        //         collector.on('end', async () => {
        //             if (votes >= maxVotes) {
        //                 await vote.edit({ embeds: [vote.embeds[0].setColor(Colors.Success)] })
        //                 const penalty = new PenaltyEntity({
        //                     user: memberToMute.id,
        //                     guild: memberToMute.guild.id,
        //                     reason: 'Lud tak zdecydował',
        //                     startDate: new Date(),
        //                     duration: 24,
        //                     type: PenaltyType.mute
        //                 })
        //                 await memberToMute.roles.add(config.roles.mute)
        //                 await DatabaseManager.save(penalty)
        //                 await Moderations.notifyAboutPenalty(guild, memberToMute.user, penalty, 'Społeczeństwo')
        //                 return
        //             }

        //             await vote.edit({ embeds: [vote.embeds[0].setColor(Colors.Error)] })
        //             const penalty = new PenaltyEntity({
        //                 user: member.id,
        //                 guild: member.guild.id,
        //                 reason: 'Myślałeś, że obejdzie się bez konsekwencji?',
        //                 startDate: new Date(),
        //                 duration: votesMultiplier * 24,
        //                 type: PenaltyType.mute
        //             })
        //             await member.roles.add(config.roles.mute)
        //             await DatabaseManager.save(penalty)
        //             await Moderations.notifyAboutPenalty(guild, member.user, penalty, 'Maou')
        //         })
        //     },
        // },

        {
            name: 'pomoc',
            description: 'Wyświetla listę wszystkich poleceń lub informacje o danym poleceniu',
            aliases: ['help', 'h'],
            usage: '[polecenie]',
            channelType: channelType.commands,

            execute: async (message, args) => {
                await message.channel.send({ embeds: this.help.getHelp(args.join(' ').toLowerCase()) })
            }
        }
    ]
}