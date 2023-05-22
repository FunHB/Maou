import { MessageEmbed } from "discord.js"
import { Colors } from "../api/types/colors"
import { Command } from "../api/interfaces/command"
import { Module } from "../api/interfaces/module"
import { Help } from "../extensions/help"
import { Utils } from "../extensions/utils"
import { ExpManager } from "../services/expManager"
import { UserManager } from "../services/userManager"
import { TopType } from "../api/types/topType"

export class Profile implements Module {
    public name = 'Profil'
    public group = ''
    public help: Help

    constructor(...modules: Module[]) {
        this.help = new Help(this, ...modules)
    }

    public commands: Command[] = [
        {
            name: 'iledopoziomu',
            description: 'Pokazuje brakujące punkty doświadczenia do awansu na kolejny poziom',
            aliases: ['idp', 'howmuchtolevelup', 'hmtlu', 'xp'],
            usage: '[użytkownik]',

            execute: async (message, args) => {
                const { channel } = message

                const member = await Utils.getMember(message, args.shift(), true)
                const user = await UserManager.getUserOrCreate(member.id)
                const diff = ExpManager.expToNextLevel(user.level + 1) - user.exp

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
            usage: '[użytkownik]',

            execute: async (message, args) => {
                const { channel } = message

                const member = await Utils.getMember(message, args.shift(), true)
                const user = await UserManager.getUserOrCreate(member.id)

                const PrevExp = Math.floor(user.exp - ExpManager.expToNextLevel(user.level))
                const NextExp = ExpManager.expToNextLevel(user.level + 1) - ExpManager.expToNextLevel(user.level)

                channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Info,
                        description: `<@${member.id}> ma poziom **${user.level}**`,
                        footer: {
                            text: `${PrevExp} / ${NextExp}`
                        }
                    })]
                })
            }
        },

        {
            name: 'top',
            description: 'Pokazuje najlepszych użytkowników',
            aliases: ['topka'],
            usage: '[typ topki]\ntypy: `poziom`, `posty`, `postym`, `polecenia`',

            execute: async (message, args) => {
                const { channel } = message
                let type = args.shift() as TopType

                if (!type) type = 'level'

                const users = await UserManager.getTopUsers(type)
                if (!users) return

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: Colors.Success,
                        title: `Top ${UserManager.getTopName(type)}`,
                        description: (await Promise.all(users.map(async user => {
                            const member = await Utils.getMember(message, user.id)
                            if (!member) return ''
                            return UserManager.getTopInfo(users.indexOf(user) + 1, user, type)
                        }))).filter(user => !!user).join('\n')
                    })]
                })
            }
        },

        {
            name: 'profil',
            description: 'Pokazuje profil użytkownika',
            aliases: ['profile'],
            usage: '[użytkownik]',

            execute: async (message, args) => {
                const { channel } = message
                const target = args.shift()
                const member = await Utils.getMember(message, target, true)
                const user = await UserManager.getUserOrCreate(member.id)

                await channel.send({
                    embeds: [new MessageEmbed({
                        color: member.displayHexColor,
                        title: member.user.username,
                        thumbnail: {
                            url: member.displayAvatarURL() || member.user.defaultAvatarURL,
                        },
                        fields: [
                            { name: 'Poziom', value: `${user.level}`, inline: true },
                            { name: 'Exp', value: user.exp.toFixed(2), inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: 'Wiadomości', value: `${user.totalMessages}`, inline: true },
                            { name: 'Poleceń', value: `${user.totalCommands}`, inline: true },
                            { name: '\u200b', value: '\u200b', inline: true },
                            { name: 'Wiadomości w miesiącu', value: `${user.messagesInMonth}` },
                            { name: 'Doświadczenie do następnego poziomu', value: (ExpManager.expToNextLevel(user.level + 1) - user.exp).toFixed(2) },
                        ]
                    })]
                })
            }
        }
    ]
}