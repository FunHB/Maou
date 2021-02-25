import { Message } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'
import { Utils } from '../modules/utils'
import { MuteCommand } from './mute'

export class ResolveCommand implements Command {
    public name = 'resolve'
    public description = 'rozwiązuje zgłoszenie'
    public aliases: string[] = ['rozwiąż', 'rozwiąz', 'rozwiaż', 'rozwiaz']
    public args = true
    public roles: string[] = [Config.modRole]
    public usage = '<zgłoszenie> <decyzja> [czas trwania] [powód]'
    public channelType: channelType = channelType.reports
    public guildonly = true
    public cooldown = 0

    public async execute(message: Message, args: string[]): Promise<void> {
        const reports = Utils.getReports().get(args.shift())
        if (!reports) return
        const { reported, report } = reports
        const decision = this.getDecision(args.shift())
        const member = await Utils.getMember(message, reported.author.id)


        if (!reported || !report || decision === 2) return

        if (decision) {
            await new MuteCommand().execute(message, [member.id, ...args])
            if (Utils.errorCode(message, member)) return
        }
        
        await message.delete()
        await report.edit(report.embeds.shift().setColor(this.getColorByDecision(decision)).setTitle(this.getTitleByDecision(decision)))

        Utils.deleteReport(report.id)
    }

    private getDecision(decision: string): number {
        switch (decision) {
            case 'reject':
            case 'odrzuć':
            case 'odrzuc':
                return 0

            case 'approve':
            case 'zatwierdź':
            case 'zatwierdz':
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