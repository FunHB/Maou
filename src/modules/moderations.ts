import { ColorResolvable, Guild, Message, MessageAttachment, MessageEmbed, Permissions, User } from 'discord.js'
import { Utils } from '../extensions/utils'
import { Command } from '../api/interfaces/command'
import { Colors } from '../api/types/colors'
import { Module } from '../api/interfaces/module'
import { RequireAdminOrMod } from '../preconditions/requireAdminOrMod'
import { requireAdminOrModOrChannelPermission } from '../preconditions/requireAdminOrModOrChannelPermission'
import { DatabaseManager } from '../database/databaseManager'
import { PenaltiesManager } from '../services/penaltiesManager'
import { PenaltyEntity, PenaltyType } from '../database/entity/Penalty'
import { ReportEntity } from '../database/entity/Report'
import fs from 'fs'
import { Help } from '../extensions/help'
import { ChannelEntity, ChannelType } from '../database/entity/Channel'
import { RoleEntity, RoleType } from '../database/entity/Role'
import { Logger } from '../services/logger'

export class Moderations implements Module {
    public name = 'Moderatorskie'
    public group = 'mod'
    public help: Help

    private readonly logger: Logger

    constructor(logger: Logger, ...modules: Module[]) {
        this.logger = logger
        this.help = new Help(this, ...modules)
    }

    public commands: Command[] = [
        {
            name: 'ban',
            description: 'Banuje użytkownika na serwerze!',
            requireArgs: true,
            usage: '<użytkownik> [powód]',
            precondition: RequireAdminOrMod,

            execute: async (message, args) => {
                const { channel } = message
                const member = await Utils.getMember(message, args.shift())
                const reason = args.join(' ') || 'Brak.'

                if (!member) return
                if (member.id === message.author.id) return
                if (!member.bannable || member.user.bot) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Tego użytkownika nie da się zbanować!'
                        })]
                    })
                    return
                }

                const penalty = new PenaltyEntity({
                    user: member.id,
                    guild: member.guild.id,
                    reason: reason,
                    startDate: message.createdAt,
                    duration: -1,
                    type: PenaltyType.ban
                })

                await member.ban({ reason: reason })
                await DatabaseManager.save(penalty)

                await Moderations.notifyAboutPenalty(message.guild, member.user, penalty, message.author.username)

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `<@${member.id}> został zbanowany`
                    })]
                })
            }
        },

        {
            name: 'kick',
            description: 'Wyrzuca użytkownika z serwera!',
            requireArgs: true,
            usage: '<użytkownik> [powód]',
            precondition: RequireAdminOrMod,

            execute: async (message, args) => {
                const { channel } = message
                const member = await Utils.getMember(message, args.shift())
                const reason = args.join(' ') || 'Brak.'

                if (!member) return
                if (member.id === message.author.id) return
                if (!member.bannable || member.user.bot) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Tego użytkownika nie da się zbanować!'
                        })]
                    })
                    return
                }

                const penalty = new PenaltyEntity({
                    user: member.id,
                    guild: member.guild.id,
                    reason: reason,
                    startDate: message.createdAt,
                    duration: -1,
                    type: PenaltyType.kick
                })

                await member.kick(reason)
                await DatabaseManager.save(penalty)

                await Moderations.notifyAboutPenalty(message.guild, member.user, penalty, message.author.username)

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `<@${member.id}> został wyrzucony`
                    })]
                })
            }
        },

        {
            name: 'mute',
            description: 'Wycisza użytkownika na serwerze!',
            requireArgs: true,
            usage: '<użytkownik> <czas trwania> [powód]',
            precondition: RequireAdminOrMod,

            execute: async (message, args) => {
                const { channel, guild } = message
                const muteRole = await DatabaseManager.getEntity(RoleEntity, { guild: guild.id, type: RoleType.mute })

                if (!muteRole) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Nie ustawiono roli wyciszonego!'
                        })]
                    })
                    return
                }

                const member = await Utils.getMember(message, args.shift())
                const duration = +args.shift().replace(/\D/, '')
                const reason = args.join(' ') || 'Brak.'

                if (isNaN(duration) || duration < 1) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Godzina to minimum!'
                        })]
                    })
                    return
                }

                if (!member) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Nie znaleziono użytkownika!'
                        })]
                    })
                    return
                }

                if (member.user.bot) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Ale co ci ten biedny bot zrobił?'
                        })]
                    })
                    return
                }

                if (member.roles.cache.has(muteRole.id)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Ta osoba jest już wyciszona!'
                        })]
                    })
                    return
                }

                const penalty = new PenaltyEntity({
                    user: member.id,
                    guild: member.guild.id,
                    reason: reason,
                    startDate: message.createdAt,
                    duration: duration,
                    type: PenaltyType.mute
                })

                await PenaltiesManager.addPenalty(member, penalty)
                await DatabaseManager.save(penalty)

                await Moderations.notifyAboutPenalty(guild, member.user, penalty, message.author.username)

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `<@${member.id}> został wyciszony`
                    })]
                })
            }
        },

        {
            name: 'show mutes',
            description: 'Pokazuje wszystkich wyciszonych!',
            precondition: RequireAdminOrMod,

            execute: async (message) => {
                const mutes = await PenaltiesManager.getPenaltiesByTypeOrGuild(PenaltyType.mute, message.guild.id)

                await message.channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Info,
                        title: 'Wyciszeni:',
                        description: mutes.map(penalty => `<@!${penalty.user}> [do: ${penalty.startDate.setHours(penalty.startDate.getHours() + penalty.duration) && Utils.dateToString(penalty.startDate, true, true, false)}] - ${penalty.reason}`).join('\n')
                    })]
                })
            }
        },

        {
            name: 'unmute',
            description: 'Zdejmuje role wyciszonego!',
            requireArgs: true,
            usage: '<użytkownik>',
            precondition: RequireAdminOrMod,

            execute: async (message, args) => {
                const { channel, guild } = message
                const muteRole = await DatabaseManager.getEntity(RoleEntity, { guild: guild.id, type: RoleType.mute })

                if (!muteRole) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Nie ustawiono roli wyciszonego!'
                        })]
                    })
                    return
                }

                const member = await Utils.getMember(message, args.join(' '))
                const role = guild.roles.cache.get(muteRole.id)

                if (!member) return

                if (!member.roles.cache.has(muteRole.id)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Ta osoba nie jest wyciszona!'
                        })]
                    })
                    return
                }

                await member.roles.remove(role)
                await PenaltiesManager.removePenalty(member.id, PenaltyType.mute)

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `<@${member.id}> został ułaskawiony`
                    })]
                })
            }
        },

        {
            name: 'unban',
            description: 'Zdejmuje bana!',
            requireArgs: true,
            usage: '<id użytkownika>',
            precondition: RequireAdminOrMod,

            execute: async (message, args) => {
                const { channel, guild } = message
                const memberId = args.join(' ')

                if (guild.bans.cache.has(memberId)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Ta osoba nie ma bana!'
                        })]
                    })
                    return
                }

                await guild.members.unban(memberId)
                await PenaltiesManager.removePenalty(memberId, PenaltyType.ban)

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `<@${memberId}> został odbanowany`
                    })]
                })
            }
        },

        {
            name: 'zmień nick',
            description: 'Zmienia pseudonim podanemu użytkownikowi',
            aliases: ['change nick', 'zmien nick'],
            requireArgs: true,
            usage: '<użytkownik> [nowy pseudonim]',
            precondition: RequireAdminOrMod,

            execute: async (message, args) => {
                const member = await Utils.getMember(message, args.shift())
                const oldNickname = member.nickname

                if (!member) return
                if (!message.guild.me.permissions.has(Permissions.FLAGS.CHANGE_NICKNAME) || !member.bannable) {
                    await message.channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Bot nie ma uprawnień do zmiany nicków'
                        })]
                    })
                    return
                }

                await member.setNickname(args.join(' '))

                await message.channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Pseudonim użytkownika <@${member.id}> został zmieniony z ${oldNickname} na ${member.nickname || 'Brak'}`
                    })]
                })
            }
        },

        {
            name: 'rekrutacja',
            description: 'Rozpoczyna, lub kończy rekrutacje!',
            aliases: ['recrutation'],
            precondition: RequireAdminOrMod,

            execute: async (message) => {
                if (fs.existsSync('recrutation')) {
                    fs.unlinkSync('recrutation')
                    return
                }
                fs.writeFileSync('recrutation', '')

                await message.channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Status rekrutacji został zmianiony na: ${fs.existsSync('recrutation') ? '`Włączona`' : '`Wyłączona`'}!`
                    })]
                })
            }
        },

        {
            name: 'resolve',
            description: 'rozwiązuje zgłoszenie!\nDecyzje:\n\t**zatwierdź** Aliasy: `approve`, `zatwierdz`, `ok`\n\t**odrzuć** Aliasy: `reject`, `odrzuc`, `nah`\nPrzy zatwierdzeniu wymagane jest podanie czasu trwania!',
            requireArgs: true,
            usage: '<id zgłoszenia> <zatwierdź / odrzuć> [czas trwania] [powód]',
            channelType: ChannelType.reports,

            execute: async (message, args) => {
                const { guild, channel } = message
                const reportId = args.shift()
                const report: ReportEntity = await DatabaseManager.getEntity(ReportEntity, { reportId: reportId, guild: guild.id })
                if (!report) return

                let reported: Message
                let reportMessage: Message

                const reportedChannel = guild.channels.cache.get(report.channelId)

                try {
                    reported = reportedChannel.isText() && await reportedChannel.messages.fetch(report.messageId)
                    reportMessage = await channel.messages.fetch(reportId)
                } catch (exception) {
                    await message.channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'coś poszło nie tak'
                        })]
                    })

                    this.logger.HandleMessage(`[Resolve] ${exception}`)
                    return
                }

                const decisionArg = args.shift()

                if (!decisionArg) return

                const decision = ['reject', 'odrzuć', 'odrzuc', 'nah'].includes(decisionArg) ? 0 : ['approve', 'zatwierdź', 'zatwierdz', 'ok'].includes(decisionArg) ? 1 : -1
                const member = await Utils.getMember(message, reported.author.id)


                if (!reported || !report || decision === -1) return

                if (decision) {
                    await this.commands.find(command => command.name === 'mute').execute(message, [member.id, ...args])
                }

                await message.delete()
                await reportMessage.edit({ embeds: [reportMessage.embeds.shift().setColor(decision ? Colors.Success : Colors.Error).setTitle(decision ? 'Zatwierdzony' : 'Odrzucony')] })

                await DatabaseManager.remove(report)
            }
        },

        {
            name: 'quote',
            description: 'Cytuje wiadomość i wysyła na podany kanał',
            requireArgs: true,
            usage: '<id wiadomości> <id kanału>',
            precondition: requireAdminOrModOrChannelPermission(Permissions.FLAGS.MANAGE_MESSAGES),

            execute: async (message, args) => {
                let quoted: Message

                try {
                    quoted = await message.channel.messages.fetch(args.shift())
                } catch (exception) {
                    await message.channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'nie znaleziono wiadomości'
                        })]
                    })
                    this.logger.HandleMessage(`[Quote] ${exception}`)
                    return
                }

                const channel = message.guild.channels.cache.get(args.shift())
                if (!channel) return

                if (channel.isText()) {
                    await channel.send({
                        content: `>>> ${quoted.content}`,
                        files: quoted.attachments.map(a => a)
                    })
                }

                await message.channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Wysłano wiadomość na kanał <#${channel.id}>`
                    })]
                })
            }
        },

        {
            name: 'r2msg',
            description: 'Dodaje reakcje pod podaną wiadomość',
            requireArgs: true,
            usage: '<id kanału> <id wiadomości> <reakcja>',
            precondition: RequireAdminOrMod,

            execute: async (message, args) => {
                const channel = message.guild.channels.cache.get(args.shift())

                if (!channel) return

                let messageForReaction: Message

                try {
                    messageForReaction = channel.isText() && await channel.messages.fetch(args.shift())
                } catch (exception) {
                    await message.channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'nie znaleziono wiadomości'
                        })]
                    })
                    this.logger.HandleMessage(`[r2msg] ${exception}`)
                    return
                }

                const reaction = args.shift()

                if (!reaction) return

                await messageForReaction.react(reaction)

                await message.channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `dodano reakcje ${reaction} do wiadomości`
                    })]
                })
            }
        },

        {
            name: 'semsg',
            description: 'Wysyła wiadomość embed na podany kanał',
            requireArgs: true,
            usage: '<id kanału> <kolor> <treść wiadomości>\nkolory: `error`, `info`, `success`, `warning`, `neutral`',
            precondition: RequireAdminOrMod,

            execute: async (message, args) => {
                const channel = message.guild.channels.cache.get(args.shift())

                if (!channel) return

                const color = Utils.getColor(args.shift().toLowerCase())

                if (!color) return

                if (channel.isText()) {
                    await channel.send({ embeds: [Moderations.getEmbed(color, args.join(' '))] })
                }

                await message.channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Wysłano wiadomość na kanał <#${channel.id}>`
                    })]
                })
            }
        },

        {
            name: 'smsg',
            description: 'Wysyła wiadomość na podany kanał',
            requireArgs: true,
            usage: '<id kanału> <wiadomość>',
            precondition: RequireAdminOrMod,

            execute: async (message, args) => {
                const channel = message.guild.channels.cache.get(args.shift())

                if (!channel) return

                const { attachments, messageContent } = Moderations.getAttachmentsAndMessageContent(args.join(' '))

                if (channel.isText()) {
                    await channel.send({
                        content: messageContent,
                        files: message.attachments.map(a => a).concat(attachments)
                    })
                }

                await message.channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Wysłano wiadomość na kanał <#${channel.id}>`
                    })]
                })
            }
        },

        {
            name: 'editmsg',
            description: 'Edytuje podaną wiadomość',
            requireArgs: true,
            usage: '<id kanału> <wiadomość> <nowa wiadomość>',
            precondition: RequireAdminOrMod,

            execute: async (message, args) => {
                const channel = message.guild.channels.cache.get(args.shift())

                if (!channel) return

                try {
                    if (channel.isText()) {
                        const prevMessage = await channel.messages.fetch(args.shift())

                        const { messageContent } = Moderations.getAttachmentsAndMessageContent(args.join(' '))

                        await prevMessage.edit(messageContent)

                        await message.channel.send({
                            embeds: [new MessageEmbed({
                                color: Colors.Success,
                                description: `Zedytowano wiadomość na kanale <#${channel.id}>`
                            })]
                        })
                    }
                } catch (exception) {
                    await message.channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'nie znaleziono wiadomości'
                        })]
                    })
                    this.logger.HandleMessage(`[editmsg] ${exception}`)
                }
            }
        },

        {
            name: 'pomoc',
            description: 'Wyświetla listę wszystkich poleceń lub informacje o danym poleceniu',
            aliases: ['help', 'h', ''],
            usage: '[polecenie]',
            precondition: RequireAdminOrMod,

            execute: async (message, args) => {
                await message.channel.send({ embeds: this.help.getHelp(args.join(' ').toLowerCase()) })
            }
        }
    ]

    public static getEmbed(color: ColorResolvable, messageContent: string): MessageEmbed {
        const regex = /(https:\/\/)\S*[(.png)(.jpg)(.gif)(.jpeg)(.mp4)(.mp3)]/gm
        const links: string[] = messageContent.match(regex)
        const content = messageContent.replace(regex, '')

        const embed = new MessageEmbed().setColor(color)

        if (links && links.length > 0) {
            embed.setImage(links[0])
            if (links.length > 1) embed.setThumbnail(links[1])
        }

        if (content.length > 0) embed.setDescription(content)

        return embed
    }

    public static getAttachmentsAndMessageContent(messageContent: string): { attachments: MessageAttachment[], messageContent: string } {
        const regex = /(https:\/\/)\S*[(.png)(.jpg)(.gif)(.jpeg)(.mp4)(.mp3)]/gm
        const links: string[] = messageContent.match(regex)
        const attachments: MessageAttachment[] = []

        if (links) {
            links.forEach(link => {
                attachments.push(new MessageAttachment(link, Math.random().toString(36).substring(2) + '.' + link.split('.').pop()))
            })
        }

        return { attachments: attachments, messageContent: messageContent.replace(regex, '') }
    }

    public static async notifyAboutPenalty(guild: Guild, user: User, penalty: PenaltyEntity, by: string): Promise<void> {
        const modLogs = await DatabaseManager.getEntity(ChannelEntity, { guild: guild.id, type: ChannelType.modLogs })
        if (!modLogs) return
        const modlogChannel = guild.channels.cache.get(modLogs.id)
        const { reason, startDate, duration, type } = penalty
        const embed = new MessageEmbed({
            color: this.getColorFromType(type),
            author: {
                name: user.username,
                iconURL: user.displayAvatarURL({
                    dynamic: true,
                    size: 128,
                    format: "png"
                })
            },
            description: `Powód: ${reason}`,
            fields: [
                { name: 'UserId:', value: `${user.id}`, inline: true },
                { name: 'Typ:', value: type, inline: true },
                { name: 'Kiedy:', value: Utils.dateToString(startDate, true, true, false), inline: true }
            ],
            footer: { text: `Przez: ${by}` }
        })

        if (type === 'mute') {
            const days = Math.floor(duration / 24)
            const hours = duration - (days * 24)
            embed.addField('Na ile:', `${days} dni ${hours} godzin`)
        }

        if (modlogChannel.isText()) {
            await modlogChannel.send({ embeds: [embed] })
        }
    }

    private static getColorFromType(type: string): Colors {
        if (type === 'ban') return Colors.Error
        if (type === 'kick') return Colors.Warning
        if (type === 'mute') return Colors.Info
        if (type === 'unmute' || type === 'unban') return Colors.Success
        return Colors.Neutral
    }
}