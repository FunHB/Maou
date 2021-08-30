import { MessageEmbed } from "discord.js";
import { getHelpForModule } from '../extensions/help'
import { Colors } from "../api/colors";
import { Module } from "../api/module";
import { Command } from "../api/command";
import { RequireAdmin } from "../preconditions/requireAdmin";
import { DatabaseManager } from "../database/databaseManager";
import { Config } from "../config";
import fs from 'fs'
import { ChannelEntity, ChannelType } from "../database/entity/Channel";
import { RoleEntity, RoleType } from "../database/entity/Role";

export class Debug implements Module {
    public group = 'dev'

    public commands: Command[] = [
        {
            name: 'update',
            description: 'Wykonuje restart z aktualizacją',
            precondition: RequireAdmin,

            execute: async function (message) {
                await message.channel.send(new MessageEmbed({
                    color: Colors.Info,
                    description: 'Pora na nowe funkcje. Ciekawe co tym razem zepsułem.'
                }))

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
                const { channel } = message

                const channelEntity = await DatabaseManager.getEntity(ChannelEntity, { id: channel.id, type: ChannelType.withExp })
                let status = true

                if (channelEntity) {
                    status = false;
                    await DatabaseManager.remove(channelEntity)
                } else {
                    await DatabaseManager.save(new ChannelEntity(channel.id, ChannelType.withExp))
                }

                channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `${status ? 'Włączono' : 'Wyłączono'} doświadczenie na kanale <#${channel.id}>`
                }))
            }
        },

        {
            name: 'supervisor',
            description: 'Włącza nadzór kanału',
            precondition: RequireAdmin,

            execute: async function (message) {
                const { channel } = message

                const channelEntity = await DatabaseManager.getEntity(ChannelEntity, { id: channel.id, type: ChannelType.supervisor })
                let status = true

                if (channelEntity) {
                    status = false;
                    await DatabaseManager.remove(channelEntity)
                } else {
                    await DatabaseManager.save(new ChannelEntity(channel.id, ChannelType.supervisor))
                }

                channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `${status ? 'Włączono' : 'Wyłączono'} nadzór na kanale <#${channel.id}>`
                }))
            }
        },

        {
            name: 'autopublic',
            description: 'Dodaje kanał do auto publikacji',
            precondition: RequireAdmin,

            execute: async function (message) {
                const { channel } = message

                if (channel.type !== 'news') {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: `<#${channel.id}> nie jest kanałem ogłoszeń!`
                    }))
                    return
                }

                const channelEntity = await DatabaseManager.getEntity(ChannelEntity, { id: channel.id, type: ChannelType.autoPublic })
                let status = true

                if (channelEntity) {
                    status = false
                    await DatabaseManager.remove(channelEntity)
                } else {
                    await DatabaseManager.save(new ChannelEntity(channel.id, ChannelType.autoPublic))
                }

                channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `${status ? `Dodano <#${channel.id}> do` : `Usunięto <#${channel.id}> z`} kanałów z auto publikacją.`
                }))
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
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Nie znaleziono roli o podanym id'
                    }))
                    return
                }

                const roleEntity = await DatabaseManager.getEntity(RoleEntity, { id: role.id, type: RoleType.addable })
                let status = true

                if (roleEntity) {
                    status = false
                    await DatabaseManager.remove(roleEntity)
                } else {
                    await DatabaseManager.save(new RoleEntity(role.id, RoleType.addable))
                }

                channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `${status ? `Dodano <@&${role.id}> do` : `Usunięto <@&${role.id}> z`} możliwych do samodzielnego nadania`
                }))
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
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Nie znaleziono roli o podanym ID!'
                    }))
                    return
                }

                const roleEntity = await DatabaseManager.getEntity(RoleEntity, { id: role.id, type: RoleType.level })

                if (roleEntity) {
                    await DatabaseManager.remove(roleEntity)
                    channel.send(new MessageEmbed({
                        color: Colors.Success,
                        description: `Usunięto <@&${role.id}> z możliwych do uzyskania za poziom`
                    }))
                    return
                }

                const minLevel = parseInt(args.shift())

                if (isNaN(minLevel)) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Minimalny poziom musi być liczbą!'
                    }))
                    return
                }

                await DatabaseManager.save(new RoleEntity(role.id, RoleType.level, minLevel))

                channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Dodano <@&${role.id}> do możliwych do uzyskania za poziom`
                }))
            }
        },

        {
            name: 'show config',
            description: 'Wyświetla aktualną configuracje',
            precondition: RequireAdmin,

            execute: async function (message) {
                const { channel } = message
                const config = new Config()

                const expChannels: string[] = (await DatabaseManager.getEntities(ChannelEntity, { type: ChannelType.withExp })).map(channel => channel.id)
                const supervisorChannels: string[] = (await DatabaseManager.getEntities(ChannelEntity, { type: ChannelType.supervisor })).map(channel => channel.id)
                const autopublicChannels: string[] = (await DatabaseManager.getEntities(ChannelEntity, { type: ChannelType.autoPublic })).map(channel => channel.id)
                const addableRoles: string[] = (await DatabaseManager.getEntities(RoleEntity, { type: RoleType.addable })).map(role => role.id)
                const levelRoles: string[] = (await DatabaseManager.getEntities(RoleEntity, { type: RoleType.level })).map(role => role.id)

                await channel.send(config.toEmbed().addFields([
                    { name: 'Channels with exp', value: expChannels.join('\n') || 'Brak.' },
                    { name: 'Channels with supervisor', value: supervisorChannels.join('\n') || 'Brak.' },
                    { name: 'Channels with autopublic', value: autopublicChannels.join('\n') || 'Brak.' },
                    { name: 'addable roles', value: addableRoles.join('\n') || 'Brak.' },
                    { name: 'level roles', value: levelRoles.join('\n') || 'Brak.' }
                ]))
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

                message.channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Zmieniono prefix na ${value}`
                }))
            }
        },

        {
            name: 'set role',
            description: 'Ustawia podaną rolę',
            requireArgs: true,
            usage: '<rola> <id roli>\nRole:\nModeratorów - `mod`\nWyciszonych - `mute`\nRekruterów - `recrutation`',
            precondition: RequireAdmin,

            execute: async function (message, args) {
                const { channel } = message
                const role = args.shift()
                const value = args.shift()
                const config = new Config()
                const regex = new RegExp('[0-9]{18}')

                const roles = [
                    'mod',
                    'mute',
                    'recrutation'
                ]

                if (!roles.includes(role)) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Podano błędną rolę'
                    }))
                    return
                }

                if (!regex.test(value)) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Podano błędne Id roli'
                    }))
                    return
                }

                config.roles[role] = value
                config.save()

                await channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Zmieniono role \`${role}\` na <@&${value}>`
                }))
            }
        },

        {
            name: 'set channel',
            description: 'Ustawia podany kanał',
            requireArgs: true,
            usage: '<kanał> <id kanału>\nKanały:\nPolecenia - `commands`\nzgłoszenia - `reports`\n"Nagrody" - `modLogs`\nObrazki - `arts`\nUsunięte wiadomości - `messageDeleteLogs`\nUpload - `upload`\nRekrutacja (kategoria) - `recrutation`',
            precondition: RequireAdmin,

            execute: async function (message, args) {
                const { channel } = message
                const channelType = args.shift()
                const value = args.shift()
                const config = new Config()
                const regex = new RegExp('[0-9]{18}')

                const channels = [
                    'commands',
                    'reports',
                    'modLogs',
                    'arts',
                    'messageDeleteLogs',
                    'upload',
                    'recrutation',
                ]

                if (!channels.includes(channelType)) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Podano błędny kanał'
                    }))
                    return
                }

                if (!regex.test(value)) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Podano błędne ID kanału'
                    }))
                    return
                }

                config.channels[channelType] = value
                config.save()

                await channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Ustawiono Kanał \`${channelType}\` na <#${value}>`
                }))
            }
        },

        {
            name: 'set message',
            description: 'Ustawia podaną wiadomość',
            requireArgs: true,
            usage: '<wiadomość> <treść wiadomości>\nWiadomości:\nPowitalna - `welcome`\nPożegnalna - `farewell`\nRekrutacja - `recrutation`',
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
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Podano błędną rolę'
                    }))
                    return
                }

                if (!regex.test(value)) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Podano błędne Id roli'
                    }))
                    return
                }

                config.roles[messageType] = value
                config.save()

                await channel.send(new MessageEmbed({
                    color: Colors.Success,
                    description: `Zmieniono role \`${messageType}\` na \`${value}\``
                }))
            }
        },

        {
            name: 'pomoc',
            description: 'Wyświetla listę wszystkich poleceń lub informacje o danym poleceniu',
            aliases: ['help', 'h', ''],
            usage: '[polecenie]',
            precondition: RequireAdmin,

            execute: async function (message, args) {
                await message.channel.send(getHelpForModule(new Debug(), args.join(' ').toLowerCase()))
            }
        }
    ]
}