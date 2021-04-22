import { GuildMember, MessageEmbed, Permissions } from 'discord.js'
import { channelType } from '../api/channelType'
import { Utils } from '../services/utils'
import { Command } from '../api/command'
import { Colors } from '../api/colors'
import { Module } from '../api/module'
import { Config } from '../config'
import { getHelpForModule } from '../services/help'
import { MutedManager } from '../services/mutedManager'
import { IMuted } from '../api/IMuted'

export class Moderations implements Module {
    public group = 'mod'

    public commands: Command[] = [
        {
            name: 'ban',
            description: 'Banuje użytkownika na serwerze!',
            requireArgs: true,
            usage: '<użytkownik> [powód]',

            execute: async function (message, args) {
                const member = await Utils.getMember(message, args.shift())
                const reasonArg = args.join(' ') || 'Brak.'
                const modlogChannel = message.guild.channels.cache.get(Config.modLogsChannel)
                const errorCode = Utils.errorCode(message, member, true)
                const type = this.name

                if (errorCode) {
                    await message.channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: Utils.getMessageFromErrorCode(errorCode, type)
                    }))
                    return
                }

                await member.ban({ reason: reasonArg })
                await message.channel.send(Utils.getMessageFromType(member, type))

                if (modlogChannel.isText()) {
                    await modlogChannel.send(Utils.getEmbedFromType(message, member.user, reasonArg, type))
                }
            }
        },

        {
            name: 'zmień nick',
            description: 'Zmienia pseudonim podanemu użytkownikowi',
            aliases: ['change nick', 'zmien nick'],
            requireArgs: true,
            usage: '<użytkownik> [nowy pseudonim]',

            execute: async function (message, args) {
                const member = await Utils.getMember(message, args.shift())
                const oldNickname = member.nickname

                if (!member) return

                if (!message.guild.me.hasPermission(Permissions.FLAGS.CHANGE_NICKNAME) || !member.bannable) {
                    await message.channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Bot nie ma uprawnień do zmiany nicków'
                    }))
                    return
                }

                await member.setNickname(args.join(' '))

                await message.channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Pseudonim użytkownika <@${member.id}> został zmieniony z ${oldNickname} na ${member.nickname || 'Brak'}`
                }))
            }
        },

        {
            name: 'kick',
            description: 'Wyrzuca użytkownika z serwera!',
            requireArgs: true,
            usage: '<użytkownik> [powód]',

            execute: async function (message, args) {
                const member = await Utils.getMember(message, args.shift())
                const reasonArg = args.join(' ') || 'Brak.'
                const modlogChannel = message.guild.channels.cache.get(Config.modLogsChannel)
                const errorCode = Utils.errorCode(message, member, true)
                const type = this.name

                if (errorCode) {
                    await message.channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: Utils.getMessageFromErrorCode(errorCode, type)
                    }))
                    return
                }

                await member.kick(reasonArg)
                await message.channel.send(Utils.getMessageFromType(member, type))

                if (modlogChannel.isText()) {
                    await modlogChannel.send(Utils.getEmbedFromType(message, member.user, reasonArg, type))
                }
            }
        },

        {
            name: 'mute',
            description: 'Wycisza użytkownika na serwerze!',
            requireArgs: true,
            usage: '<użytkownik> <czas trwania> [powód]',

            execute: async function (message, args) {
                const { channel, guild } = message

                const member = await Utils.getMember(message, args.shift())
                const duration = parseInt(args.shift())
                const days = Math.floor(duration / 24)
                const hours = duration - (days * 24)
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
                    await modlogChannel.send(Utils.getEmbedFromType(message, member.user, reasonArg, type).addField('Na ile:', `${days} dni ${hours} godzin`))
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
        },

        {
            name: 'quote',
            description: 'Cytuje wiadomość i wysyła na podany kanał',
            requireArgs: true,
            usage: '<id wiadomości> <id kanału>',

            execute: async function (message, args) {
                const quoted = await message.channel.messages.fetch(args.shift())
                if (!quoted) return

                const channel = message.guild.channels.cache.get(args.shift())
                if (!channel) return

                if (channel.isText()) {
                    await channel.send(`>>> ${quoted.content}`, {
                        files: quoted.attachments.array()
                    })
                }

                await message.channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Wysłano wiadomość na kanał <#${channel.id}>`
                }))
            }
        },

        {
            name: 'r2msg',
            description: 'Dodaje reakcje pod podaną wiadomość',
            requireArgs: true,
            usage: '<id kanału> <id wiadomości> <reakcja>',

            execute: async function (message, args) {
                const channel = message.guild.channels.cache.get(args.shift())

                if (!channel) return

                const messageForReaction = channel.isText() ? await channel.messages.fetch(args.shift()) : null

                if (!messageForReaction) return

                const reaction = args.shift()

                if (!reaction) return

                await messageForReaction.react(reaction)

                await message.channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `dodano reakcje ${reaction} do wiadomości`
                }))
            }
        },

        {
            name: 'rekrutacja',
            description: 'Rozpoczyna, lub kończy rekrutacje!',

            execute: async function (message) {
                Utils.changeRecrutationStatus()

                await message.channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Status rekrutacji został zmianiony na: ${Utils.getRecrutationStatus() ? '`Włączona`' : '`Wyłączona`'}!`
                }))
            }
        },

        {
            name: 'resolve',
            description: 'rozwiązuje zgłoszenie!\nDecyzje:\n\t**zatwierdź** Aliasy: `approve`, `zatwierdz`, `ok`\n\t**odrzuć** Aliasy: `reject`, `odrzuc`, `nah`\nPrzy zatwierdzeniu wymagane jest podanie czasu trwania!',
            requireArgs: true,
            usage: '<id zgłoszenia> <zatwierdź / odrzuć> [czas trwania] [powód]',
            channelType: channelType.reports,

            execute: async function (message, args) {
                const { channel } = message
                const reportID = args.shift()
                const report = Utils.getReport().get(reportID)
                if (!report) return
                const { reported } = report
                const reportMessage = await channel.messages.fetch(reportID)
                const decision = Utils.getResolveDecision(args.shift().toLowerCase())
                const member = await Utils.getMember(message, reported.author.id)


                if (!reported || !report || decision === 2) return

                if (decision) {
                    await new Moderations().commands.find(command => command.name === 'mute').execute(message, [member.id, ...args])
                    if (Utils.errorCode(message, member) && Utils.errorCode(message, member) != 6) return
                }

                await message.delete()
                await reportMessage.edit(reportMessage.embeds.shift().setColor(decision ? Colors.Success : Colors.Error).setTitle(decision ? 'Zatwierdzony' : 'Odrzucony'))

                Utils.deleteReport(reportMessage.id)
            }
        },

        {
            name: 'semsg',
            description: 'Wysyła wiadomość embed na podany kanał',
            requireArgs: true,
            usage: '<id kanału> <kolor> <treść wiadomości>\nkolory: `error`, `info`, `success`, `warning`, `neutral`',

            execute: async function (message, args) {
                const channel = message.guild.channels.cache.get(args.shift())

                if (!channel) return

                const color = Utils.getColor(args.shift().toLowerCase())

                if (!color) return

                if (channel.isText()) {
                    await channel.send(Utils.getEmbed(color, args.join(' ')))
                }

                await message.channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Wysłano wiadomość na kanał <#${channel.id}>`
                }))
            }
        },

        {
            name: 'smsg',
            description: 'Wysyła wiadomość na podany kanał',
            requireArgs: true,
            usage: '<id kanału> <wiadomość>',

            execute: async function (message, args) {
                const channel = message.guild.channels.cache.get(args.shift())

                if (!channel) return

                const { attachments, messageContent } = Utils.getAttachmentsAndMessageContent(args.join(' '))

                if (channel.isText()) {
                    await channel.send(messageContent, {
                        files: message.attachments.array().concat(attachments)
                    })
                }

                await message.channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Wysłano wiadomość na kanał <#${channel.id}>`
                }))
            }
        },

        {
            name: 'show muted',
            description: 'Pokazuje wszystkich wyciszonych!',

            execute: async function (message) {
                const { guild } = message

                MutedManager.setMuted(guild.id)

                const mutedUsers = MutedManager.getMuted(guild.id)

                await message.channel.send(new MessageEmbed({
                    color: Colors.Info,
                    title: 'Wyciszeni:',
                    description: mutedUsers.map(user => `<@!${user.id}> [do: ${Utils.dateToString(new Date(new Date(user.start).getTime() + user.duration), false)}] - ${user.reason}`).join('\n')
                }))
            }
        },

        {
            name: 'unmute',
            description: 'Zdejmuje role wyciszonego!',
            requireArgs: true,
            usage: '<użytkownik>',

            execute: async function (message, args) {
                const { guild } = message
                const member = await Utils.getMember(message, args.join(' '))
                const role = guild.roles.cache.get(Config.muteRole)
                const type = this.name

                if (!member) return

                if (!member.roles.cache.has(Config.muteRole)) {
                    await message.channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Ta osoba nie jest wyciszona!'
                    }))
                    return
                }

                await member.roles.remove(role)
                await message.channel.send(Utils.getMessageFromType(member, type))

                MutedManager.setMuted(guild.id)
                MutedManager.removeMuted(guild.id, member.id)
            }
        },

        {
            name: 'rosyjska ruletka',
            description: 'muahahahahaha',
            requireArgs: true,
            usage: '<"nagroda"> <użytkownicy (max. 20)>\nNagrody: `ban`, `mute`, `kick`, `nic`',

            execute: async function (message, args) {
                const { channel } = message

                const type = args.shift().toLowerCase()
                const members: GuildMember[] = []

                for (let i = 0; i < args.length; ++i) {
                    members.push(await Utils.getMember(message, args[i]))
                }

                if (members.length > 20 || members.length < 2) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: `Podano błędną ilość użytkowników!`
                    }))
                    return
                }

                const winner = members[Math.floor(Math.random() * members.length)]

                await channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Zwycięscą został ${winner.nickname ? winner.nickname : winner.user.username}`
                }))

                if (['ban', 'mute', 'kick'].includes(type)) {
                    new Moderations().commands.find(command => command.name === type).execute(message, [winner.id, `${type === 'mute' ? 24 : ''}`, 'Źli moderatorzy znowu się bawią kosztem użytkowników'])
                }
            }
        },

        {
            name: 'pomoc',
            description: 'Wyświetla listę wszystkich poleceń lub informacje o danym poleceniu',
            aliases: ['help', 'h'],
            usage: '[polecenie]',

            execute: async function (message, args) {
                await message.channel.send(getHelpForModule(new Moderations(), args.join(' ').toLowerCase()))
            }
        }
    ]
}