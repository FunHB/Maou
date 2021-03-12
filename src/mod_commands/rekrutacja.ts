import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'

export class ModRekrutacjaCommand implements Command {
    public name = 'rekrutacja'
    public description = 'polecenie do rekrutacji'
    public args = true
    public roles: string[] = [Config.modRole]
    public usage = '[start / end]'
    public channelType: channelType = channelType.normal
    public guildonly = true
    public static status = false

    public async execute(message: Message, args: string[]): Promise<void> {
        const { channel } = message
        const newStatus = this.getStatus(args.shift())

        if (!newStatus) return

        const status = newStatus === 1

        if (ModRekrutacjaCommand.status === status) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: `Rekrutacja została już ${this.getMessage(status, 'error')}!`
            }))
            return
        }

        ModRekrutacjaCommand.setStatus(status)

        await channel.send(new MessageEmbed({
            color: Colors.Success,
            description: `Rekrutacja ${this.getMessage(status, 'success')}!`
        }))
    }

    private getStatus(status: string): number {
        switch (status) {
            case 'start':
                return 1

            case 'end':
            case 'koniec':
                return 2

            default:
                return 0
        }
    }

    private getMessage(status: boolean, type: string): string {
        switch (type) {
            case 'error':
                return status ? 'włączona' : 'wyłączona'

            case 'success':
                return status ? 'wystartowała' : 'została zakończona'

            default:
                return ''
        }
    }

    private static setStatus(newStatus: boolean): void {
        this.status = newStatus
    }
}