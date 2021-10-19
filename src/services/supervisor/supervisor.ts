import { Message, MessageEmbed, Permissions } from "discord.js"
import { Colors } from "../../api/types/colors"
import { CommandHandler } from "../../commandHandler"
import { DatabaseManager } from "../../database/databaseManager"
import { ChannelEntity, ChannelType } from "../../database/entity/Channel"
import { PenaltyEntity, PenaltyType } from "../../database/entity/Penalty"
import { RoleEntity, RoleType } from "../../database/entity/Role"
import { Moderations } from "../../modules/moderations"
import { PenaltiesManager } from "../penaltiesManager"
import { SupervisorEntity } from "./supervisorEntity"
import { SupervisorMessage } from "./SupervisorMessage"

enum Action {
    none,
    ban,
    mute
}

export class Supervisor {
    private readonly MAX_TOTAL = 7
    private readonly MAX_SPECIFIED = 5

    private readonly COMMAND_MOD = 2

    private suspects: Map<string, SupervisorEntity>

    constructor() {
        this.suspects = new Map<string, SupervisorEntity>()

        setInterval(() => {
            this.autoValidate()
        },
            300000
        )
    }

    public async handleMessage(message: Message): Promise<void> {
        if (message.author.bot || message.webhookId) return
        await this.analize(message)
    }

    private async analize(message: Message): Promise<void> {
        const { guild, member, channel } = message

        const supervisorChannels: string[] = (await DatabaseManager.getEntities(ChannelEntity, { guild: guild.id, type: ChannelType.supervisor })).map(channel => channel.id)
        if (supervisorChannels.length < 1 || !supervisorChannels.includes(channel.id)) return

        const modRole = await DatabaseManager.getEntity(RoleEntity, { guild: message.guild.id, type: RoleType.mod })
        if (member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || (modRole && member.roles.cache.has(modRole.id))) return

        const messageContent = this.getMessageContent(message)

        if (!this.suspects.has(member.id)) {
            this.suspects.set(member.id, new SupervisorEntity(messageContent))
            return
        }

        let suspect = this.suspects.get(member.id)

        if (!suspect.isValid()) {
            suspect = new SupervisorEntity(messageContent)
            return
        }

        let thisMessage = suspect.get(messageContent)

        if (!thisMessage.isValid()) {
            thisMessage = new SupervisorMessage(messageContent)
        }

        const action = this.makeDecision(messageContent, suspect.increment(), thisMessage.increment())
        await this.makeAction(action, message)
    }

    private async makeAction(action: Action, message: Message): Promise<void> {
        const { guild, channel, member } = message
        let penalty: PenaltyEntity

        if (action === Action.mute) {
            penalty = new PenaltyEntity({
                user: member.id,
                guild: member.guild.id,
                reason: 'spam / flood',
                startDate: message.createdAt,
                duration: 24,
                type: PenaltyType.mute
            })

            await PenaltiesManager.addPenalty(member, penalty)
            await DatabaseManager.save(penalty)

            await Moderations.notifyAboutPenalty(guild, member.user, penalty, 'automat')

            await channel.send({
                embeds: [new MessageEmbed({
                    color: Colors.Success,
                    description: `<@${member.id}> został wyciszony`
                })]
            })
            return
        }

        if (action === Action.ban) {
            penalty = new PenaltyEntity({
                user: member.id,
                guild: member.guild.id,
                reason: 'spam / flood',
                startDate: message.createdAt,
                duration: -1,
                type: PenaltyType.ban
            })

            await member.ban({ reason: penalty.reason })
            await DatabaseManager.save(penalty)

            await Moderations.notifyAboutPenalty(guild, member.user, penalty, 'automat')

            await channel.send({
                embeds: [new MessageEmbed({
                    color: Colors.Success,
                    description: `<@${member.id}> został zbanowany`
                })]
            })
            return
        }
    }

    private makeDecision(content: string, total: number, specified: number): Action {
        let mSpecified = this.MAX_SPECIFIED
        let mTotal = this.MAX_TOTAL

        if (new CommandHandler().isCommand(content)) {
            mTotal += this.COMMAND_MOD
            mSpecified += this.COMMAND_MOD
        }

        if (total == mTotal || specified == mSpecified) {
            return Action.mute
        }

        return Action.none
    }

    private getMessageContent(message: Message): string {
        let content = message.content

        if (!content) {
            content = message.attachments.first().name || 'embed'
        }

        return content
    }

    private autoValidate(): void {
        try {
            const toClean: string[] = []
            this.suspects.forEach((suspect, userID) => {
                if (!suspect.isValid) {
                    toClean.push(userID)
                }
            })

            toClean.forEach(uId => {
                this.suspects.set(uId, new SupervisorEntity())
            })
        } catch (exception) {
            console.error(`[Supervisor] autovalidate error: ${exception}`)
        }
    }
}