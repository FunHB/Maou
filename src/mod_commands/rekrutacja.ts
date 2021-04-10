import { Message, MessageEmbed } from 'discord.js'
import fs from 'fs'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'

export class ModRekrutacjaCommand implements Command {
    public name = 'rekrutacja'
    public description = 'rozpoczyna, lub kończy rekrutacje!'
    public args = true
    public roles: string[] = [Config.modRole]
    public usage = '[start / koniec]'
    public channelType: channelType = channelType.botCommands
    public guildonly = true

    public async execute(message: Message, args: string[]): Promise<void> {
        const { channel } = message
        const newStatus = this.getStatus(args.shift().toLowerCase())
        const currentStatus = ModRekrutacjaCommand.getBoolStatus()

        if (!newStatus) return

        if (newStatus == 3) {
            await channel.send(new MessageEmbed({
                color: Colors.Info,
                description: `Status rekrutacji: ${this.getMessage(currentStatus, 'error')}`
            }))
            return
        }

        const status = newStatus == 1

        if (currentStatus === status) {
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

            case 'status':
                return 3

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
        if (newStatus) {
            fs.writeFileSync('./data/rekrutacja', '')
            return
        }
        fs.unlinkSync('./data/rekrutacja')
    }

    public static getBoolStatus(): boolean {
        return fs.existsSync('./data/rekrutacja')
    }
}