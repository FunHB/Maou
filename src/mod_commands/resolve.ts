import { Message } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'
import { Utils } from '../modules/utils'
import { MuteCommand } from './mute'

export class ResolveCommand implements Command {
    public name = 'resolve'
    public description = 'rozwiązuje zgłoszenie!\nDecyzje:\n\t**zatwierdź** Aliasy: `approve`, `zatwierdz`, `ok`\n\t**odrzuć** Aliasy: `reject`, `odrzuc`, `nah`\nPrzy zatwierdzeniu wymagane jest podanie czasu trwania!'
    public aliases: string[] = ['rozwiąż', 'rozwiąz', 'rozwiaż', 'rozwiaz']
    public args = true
    public roles: string[] = [Config.modRole]
    public usage = '<id zgłoszenia> <zatwierdź / odrzuć> [czas trwania] [powód]'
    public channelType: channelType = channelType.reports
    public guildonly = true
    public cooldown = 0

    public async execute(message: Message, args: string[]): Promise<void> {
        const { channel } = message
        const reportID = args.shift()
        const report = Utils.getReport().get(reportID)
        if (!report) return
        const { reported } = report
        const reportMessage = await channel.messages.fetch(reportID)
        const decision = this.getDecision(args.shift().toLowerCase())
        const member = await Utils.getMember(message, reported.author.id)


        if (!reported || !report || decision === 2) return

        if (decision) {
            await new MuteCommand().execute(message, [member.id, ...args])
            if (Utils.errorCode(message, member) && Utils.errorCode(message, member) != 6) return
        }
        
        await message.delete()
        await reportMessage.edit(reportMessage.embeds.shift().setColor(this.getColorByDecision(decision)).setTitle(this.getTitleByDecision(decision)))

        Utils.deleteReport(reportMessage.id)
    }

    private getDecision(decision: string): number {
        switch (decision) {
            case 'reject':
            case 'odrzuć':
            case 'odrzuc':
            case 'nah':
                return 0

            case 'approve':
            case 'zatwierdź':
            case 'zatwierdz':
            case 'ok':
                return 1

            default:
                return 2
        }
    }

    private getColorByDecision(decision: number): Colors {
        return decision ? Colors.Success : Colors.Error
    }

    private getTitleByDecision(decision: number): string {
        return decision ? 'Zatwierdzony' : 'Odrzucony'
    }
}