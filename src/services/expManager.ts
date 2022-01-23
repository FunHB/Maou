import { Message, MessageEmbed } from 'discord.js'
import { Config } from '../config'
import { DatabaseManager } from '../database/databaseManager'
import { ChannelEntity, ChannelType } from '../database/entity/Channel';
import { RoleEntity, RoleType } from '../database/entity/Role';
import { UserManager } from './userManager';

export class ExpManager {
    private static levelMultiplier = 0.35

    private minCharInMsg: number
    private maxCharInMsg: number
    private expMultiplier: number

    constructor() {
        const config = new Config()
        this.minCharInMsg = config.exp.minCharInMsg
        this.maxCharInMsg = config.exp.maxCharInMsg
        this.expMultiplier = config.exp.expMultiplier
    }

    public async handleMessage(message: Message): Promise<void> {
        const { guild, channel, member } = message

        if (message.author.bot) return

        const config = new Config()
        const channelsWithExp: string[] = (await DatabaseManager.getEntities(ChannelEntity, { guild: guild.id, type: ChannelType.withExp })).map(channel => channel.id)

        if (!channelsWithExp.includes(channel.id)) return

        const user = await UserManager.getUserOrCreate(member.id)
        const expFromMessage = this.charCount(message.content, config.prefix) * this.expMultiplier

        user.exp += expFromMessage
        const toNextLvl = ExpManager.expToNextLevel(user.level + 1)
        

        if (user.exp >= toNextLvl) {
            ++user.level

            const roles: RoleEntity[] = await DatabaseManager.getEntities(RoleEntity, { guild: guild.id, type: RoleType.level })
            const newRoles = roles.filter(role => role.minLevel <= user.level);

            newRoles.forEach(newRole => {
                if (!member.roles.cache.has(newRole.id)) {
                    member.roles.add(newRole.id);
                }
            })

            channel.send({
                embeds: [new MessageEmbed({
                    color: member.displayHexColor,
                    title: 'Nowy poziom',
                    description: `<@${member.id}> awansował na poziom ${user.level}`,
                })]
            })
        }

        await DatabaseManager.save(user)
    }

    private charCount(messageContent: string, prefix: string): number {
        const charCount = messageContent.startsWith(prefix) ? 1 : messageContent.replace(/(https|http):\/\/[\S]+/g, '').replace(/:[\S]+:/g, '').replace(/\s+/g, '').length
        if (charCount <= this.minCharInMsg) return this.minCharInMsg
        if (charCount >= this.maxCharInMsg) return this.maxCharInMsg
        return charCount
    }

    public static expToNextLevel(level: number): number {
        return level <= 0 ? 0 : Math.floor(Math.pow(level / this.levelMultiplier, 2)) + 1
    }

    public static getLevelFromExp(exp: number): number {
        return Math.floor(this.levelMultiplier * Math.sqrt(exp))
    }
}