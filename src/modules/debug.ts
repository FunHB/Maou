import { MessageEmbed } from "discord.js";
import { Help } from '../extensions/help'
import { Colors } from "../api/colors";
import { Module } from "../api/module";
import { Command } from "../api/command";
import { RequireAdmin } from "../preconditions/requireAdmin";
import { DatabaseManager } from "../database/databaseManager";
import { Config } from "../config";
import fs from 'fs'
import { ChannelEntity, ChannelType } from "../database/entity/Channel";
import { RoleEntity, RoleType } from "../database/entity/Role";
import { Utils } from "../extensions/utils";

export class Debug implements Module {
    public name = 'Administacyjne'
    public group = 'dev'
    public help: Help

    constructor(...modules: Module[]) {
        this.help = new Help(this, ...modules)
    }

    public commands: Command[] = [
        {
            name: 'update',
            description: 'Wykonuje restart z aktualizacją',
            precondition: RequireAdmin,

            execute: async function (message) {
                await message.channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Info,
                        description: 'Pora na nowe funkcje. Ciekawe co tym razem nie działa.'
                    })]
                })

                message.client.destroy()
                fs.writeFileSync('./updateNow', '')
                process.exit(200)
            }
        },

        {
            name: 'expch',
            description: 'Włącza otrzymywanie doświadczenia na kanale',
            precondition: RequireAdmin,

            execute: async function (message) {
                const { guild, channel } = message

                const channelEntity = await DatabaseManager.getEntity(ChannelEntity, { id: channel.id, guild: guild.id, type: ChannelType.withExp })
                let status = true

                if (channelEntity) {
                    status = false;
                    await DatabaseManager.remove(channelEntity)
                } else {
                    await DatabaseManager.save(new ChannelEntity(channel.id, guild.id, ChannelType.withExp))
                }

                channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `${status ? 'Włączono' : 'Wyłączono'} doświadczenie na kanale <#${channel.id}>`
                    })]
                })
            }
        },

        {
            name: 'supervisor',
            description: 'Włącza nadzór kanału',
            precondition: RequireAdmin,

            execute: async function (message) {
                const { guild, channel } = message

                const channelEntity = await DatabaseManager.getEntity(ChannelEntity, { id: channel.id, guild: guild.id, type: ChannelType.supervisor })
                let status = true

                if (channelEntity) {
                    status = false;
                    await DatabaseManager.remove(channelEntity)
                } else {
                    await DatabaseManager.save(new ChannelEntity(channel.id, guild.id, ChannelType.supervisor))
                }

                channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `${status ? 'Włączono' : 'Wyłączono'} nadzór na kanale <#${channel.id}>`
                    })]
                })
            }
        },

        {
            name: 'autopublic',
            description: 'Dodaje kanał do auto publikacji',
            precondition: RequireAdmin,

            execute: async function (message) {
                const { guild, channel } = message

                if (channel.type !== 'GUILD_NEWS' && channel.type !== 'GUILD_NEWS_THREAD') {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: `<#${channel.id}> nie jest kanałem ogłoszeń!`
                        })]
                    })
                    return
                }

                const channelEntity = await DatabaseManager.getEntity(ChannelEntity, { id: channel.id, guild: guild.id, type: ChannelType.autoPublic })
                let status = true

                if (channelEntity) {
                    status = false
                    await DatabaseManager.remove(channelEntity)
                } else {
                    await DatabaseManager.save(new ChannelEntity(channel.id, guild.id, ChannelType.autoPublic))
                }

                channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `${status ? `Dodano <#${channel.id}> do` : `Usunięto <#${channel.id}> z`} kanałów z auto publikacją.`
                    })]
                })
            }
        },

        {
            name: 'commands',
            description: 'Włącza polecenia na kanale',
            precondition: RequireAdmin,

            execute: async function (message) {
                const { guild, channel } = message

                const channelEntity = await DatabaseManager.getEntity(ChannelEntity, { id: channel.id, guild: guild.id, type: ChannelType.commands })
                let status = true

                if (channelEntity) {
                    status = false;
                    await DatabaseManager.remove(channelEntity)
                } else {
                    await DatabaseManager.save(new ChannelEntity(channel.id, guild.id, ChannelType.commands))
                }

                channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `${status ? 'Włączono' : 'Wyłączono'} polecenia na kanale <#${channel.id}>`
                    })]
                })
            }
        },

        {
            name: 'addable role',
            description: 'Ustawia role jako możliwą do samodzielnego nadania',
            requireArgs: true,
            usage: '<id roli>',
            precondition: RequireAdmin,

            execute: async function (message, args) {
                const { guild, channel } = message

                const roleID = args.shift()
                const role = guild.roles.cache.get(roleID)

                if (!role) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Nie znaleziono roli o podanym id'
                        })]
                    })
                    return
                }

                const roleEntity = await DatabaseManager.getEntity(RoleEntity, { id: role.id, guild: guild.id, type: RoleType.addable })
                let status = true

                if (roleEntity) {
                    status = false
                    await DatabaseManager.remove(roleEntity)
                } else {
                    await DatabaseManager.save(new RoleEntity(role.id, guild.id, RoleType.addable))
                }

                channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `${status ? `Dodano <@&${role.id}> do` : `Usunięto <@&${role.id}> z`} możliwych do samodzielnego nadania`
                    })]
                })
            }
        },

        {
            name: 'level role',
            description: 'Dodaje role do możliwych do osiągnięcia za poziom',
            requireArgs: true,
            usage: '<id roli> <minimalny poziom do zdobycia>',
            precondition: RequireAdmin,

            execute: async function (message, args) {
                const { guild, channel } = message

                const roleID = args.shift()
                const role = guild.roles.cache.get(roleID)

                if (!role) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Nie znaleziono roli o podanym ID!'
                        })]
                    })
                    return
                }

                const roleEntity = await DatabaseManager.getEntity(RoleEntity, { id: role.id, guild: guild.id, type: RoleType.level })

                if (roleEntity) {
                    await DatabaseManager.remove(roleEntity)
                    channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Success,
                            description: `Usunięto <@&${role.id}> z możliwych do uzyskania za poziom`
                        })]
                    })
                    return
                }

                const minLevel = parseInt(args.shift())

                if (isNaN(minLevel)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Minimalny poziom musi być liczbą!'
                        })]
                    })
                    return
                }

                await DatabaseManager.save(new RoleEntity(role.id, guild.id, RoleType.level, minLevel))

                channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Dodano <@&${role.id}> do możliwych do uzyskania za poziom`
                    })]
                })
            }
        },

        {
            name: 'show config',
            description: 'Wyświetla aktualną configuracje',
            precondition: RequireAdmin,

            execute: async function (message) {
                const { guild, channel } = message
                const config = new Config()

                const expChannels: string[] = (await DatabaseManager.getEntities(ChannelEntity, { guild: guild.id, type: ChannelType.withExp })).map(channel => `<#${channel.id}>`)
                const supervisorChannels: string[] = (await DatabaseManager.getEntities(ChannelEntity, { guild: guild.id, type: ChannelType.supervisor })).map(channel => `<#${channel.id}>`)
                const autopublicChannels: string[] = (await DatabaseManager.getEntities(ChannelEntity, { guild: guild.id, type: ChannelType.autoPublic })).map(channel => `<#${channel.id}>`)
                const commandsChannel: string[] = (await DatabaseManager.getEntities(ChannelEntity, { guild: guild.id, type: ChannelType.commands })).map(channel => `<#${channel.id}>`)
                const addableRoles: string[] = (await DatabaseManager.getEntities(RoleEntity, { guild: guild.id, type: RoleType.addable })).map(role => `<@&${role.id}>`)
                const levelRoles: string[] = (await DatabaseManager.getEntities(RoleEntity, { guild: guild.id, type: RoleType.level })).map(role => `<@&${role.id}> - ${role.minLevel}`)

                const reportsChannel = await DatabaseManager.getEntity(ChannelEntity, { guild: guild.id, type: ChannelType.reports })
                const modLogsChannel = await DatabaseManager.getEntity(ChannelEntity, { guild: guild.id, type: ChannelType.modLogs })
                const artsChannel = await DatabaseManager.getEntity(ChannelEntity, { guild: guild.id, type: ChannelType.arts })
                const messageDeleteLogsChannel = await DatabaseManager.getEntity(ChannelEntity, { guild: guild.id, type: ChannelType.messageDeleteLogs })
                const recrutationChannel = await DatabaseManager.getEntity(ChannelEntity, { guild: guild.id, type: ChannelType.recrutation })
                const uploadChannel = await DatabaseManager.getEntity(ChannelEntity, { guild: guild.id, type: ChannelType.upload })

                const modRole = await DatabaseManager.getEntity(RoleEntity, { guild: guild.id, type: RoleType.mod })
                const muteRole = await DatabaseManager.getEntity(RoleEntity, { guild: guild.id, type: RoleType.mute })
                const recrutationRole = await DatabaseManager.getEntity(RoleEntity, { guild: guild.id, type: RoleType.recrutation })

                await channel.send({
                    embeds: [config.toEmbed().addFields([
                        { name: 'Channels with exp', value: expChannels.join('\n') || 'Brak.' },
                        { name: 'Channels with supervisor', value: supervisorChannels.join('\n') || 'Brak.' },
                        { name: 'Channels with autopublic', value: autopublicChannels.join('\n') || 'Brak.' },
                        { name: 'Channels with commands', value: commandsChannel.join('\n') || 'Brak.' },
                        { name: 'addable roles', value: addableRoles.join('\n') || 'Brak.' },
                        { name: 'level roles', value: levelRoles.join('\n') || 'Brak.' },
                        { name: 'other channels', value: `reports - ${reportsChannel ? `<#${reportsChannel.id}>` : 'Brak.'}\nmodLogs = ${modLogsChannel ? `<#${modLogsChannel.id}>` : 'Brak.'}\narts - ${artsChannel ? `<#${artsChannel.id}>` : 'Brak.'}\nmessageDeleteLogs - ${messageDeleteLogsChannel ? `<#${messageDeleteLogsChannel.id}>` : 'Brak.'}\nrecrutation - ${recrutationChannel ? `<#${recrutationChannel.id}>` : 'Brak.'}\nupload - ${uploadChannel ? `<#${uploadChannel.id}>` : 'Brak.'}` },
                        { name: 'other roles', value: `mod - ${modRole ? `<@&${modRole.id}>` : 'Brak.'}\nmute = ${muteRole ? `<@&${muteRole.id}>` : 'Brak.'}\nrecrutation - ${recrutationRole ? `<@&${recrutationRole.id}>` : 'Brak.'}` }
                    ])]
                })
            }
        },

        {
            name: 'set prefix',
            description: 'Ustawia nowy prefix',
            requireArgs: true,
            usage: '<nowy prefix>',
            precondition: RequireAdmin,

            execute: async function (message, args) {
                const value = args.join(' ')
                const config = new Config()

                config.prefix = value
                config.save()

                message.channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Zmieniono prefix na ${value}`
                    })]
                })
            }
        },

        {
            name: 'set role',
            description: 'Ustawia podaną rolę',
            requireArgs: true,
            usage: '<rola> <id roli>\nRole:\nModeratorów - `mod`\nWyciszonych - `mute`\nRekruterów - `recrutation`',
            precondition: RequireAdmin,

            execute: async function (message, args) {
                const { guild, channel } = message
                const role: RoleType = (<any>RoleType)[args.shift().toLowerCase()]
                const value = args.shift()
                const regex = new RegExp('[0-9]{18}')

                const roles: RoleType[] = [
                    RoleType.mod,
                    RoleType.mute,
                    RoleType.recrutation
                ]

                if (!roles.includes(role)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Podano błędną rolę'
                        })]
                    })
                    return
                }

                if (!regex.test(value)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Podano błędne Id roli'
                        })]
                    })
                    return
                }

                const roleEntity = await DatabaseManager.getEntity(RoleEntity, { guild: guild.id, type: role })

                if (roleEntity) {
                    roleEntity.id = value
                    await DatabaseManager.save(roleEntity)
                } else {
                    await DatabaseManager.save(new RoleEntity(value, guild.id, role))
                }

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Zmieniono role \`${role}\` na <@&${value}>`
                    })]
                })
            }
        },

        {
            name: 'set channel',
            description: 'Ustawia podany kanał',
            requireArgs: true,
            usage: '<kanał> <id kanału>\nKanały:\nzgłoszenia - `reports`\n"Nagrody" - `modLogs`\nObrazki - `arts`\nUsunięte wiadomości - `messageDeleteLogs`\nUpload - `upload`\nRekrutacja (kategoria) - `recrutation`',
            precondition: RequireAdmin,

            execute: async function (message, args) {
                const { guild, channel } = message
                const channelType: ChannelType = Utils.getChannelType(args.shift())
                const value = args.shift()
                const regex = new RegExp('[0-9]{18}')

                const channels: ChannelType[] = [
                    ChannelType.reports,
                    ChannelType.modLogs,
                    ChannelType.arts,
                    ChannelType.messageDeleteLogs,
                    ChannelType.recrutation,
                    ChannelType.upload
                ]

                if (!channels.includes(channelType)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Podano błędny kanał'
                        })]
                    })
                    return
                }

                if (!regex.test(value)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Podano błędne ID kanału'
                        })]
                    })
                    return
                }

                const channelEntity = await DatabaseManager.getEntity(ChannelEntity, { guild: guild.id, type: channelType })

                if (channelEntity) {
                    channelEntity.id = value
                    await DatabaseManager.save(channelEntity)
                } else {
                    await DatabaseManager.save(new ChannelEntity(value, guild.id, channelType))
                }

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Ustawiono Kanał \`${channelType}\` na <#${value}>`
                    })]
                })
            }
        },

        {
            name: 'set message',
            description: 'Ustawia podaną wiadomość',
            requireArgs: true,
            usage: '<wiadomość> <treść wiadomości>\nWiadomości:\nPowitalna - `welcome`\nPożegnalna - `farewell`\nRekrutacja - `recrutation`\nAby ustawić wzmiankę użyj `{user}`',
            precondition: RequireAdmin,

            execute: async function (message, args) {
                const { channel } = message
                const messageType = args.shift()
                const value = args.join()
                const config = new Config()
                const regex = new RegExp('[0-9]{18}')

                const messages = [
                    'welcome',
                    'farewell',
                    'recrutation'
                ]

                if (!messages.includes(messageType)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Podano błędną rolę'
                        })]
                    })
                    return
                }

                if (!regex.test(value)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Podano błędne Id roli'
                        })]
                    })
                    return
                }

                config.messages[messageType] = value
                config.save()

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        description: `Zmieniono role \`${messageType}\` na \`${value}\``
                    })]
                })
            }
        },

        {
            name: 'pomoc',
            description: 'Wyświetla listę wszystkich poleceń lub informacje o danym poleceniu',
            aliases: ['help', 'h', ''],
            usage: '[polecenie]',
            precondition: RequireAdmin,

            execute: async (message, args) => {
                await message.channel.send({ embeds: this.help.getHelp(args.join(' ').toLowerCase()) })
            }
        }
    ]
}