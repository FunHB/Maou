import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';
import { Config } from '../config';
import { Utils } from '../modules/utils';

export class ReportCommand implements Command {
    public name = 'report'
    public description = 'Dzięki niej możesz zgłosić wiadomośc użytkownika.'
    public aliases: string[] = ['raport', 'zgłoś', 'zgloś', 'zgłos', 'zglos']
    public args = true
    public usage = '<id wiadomości> [powód zgłoszenia]'
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 1

    public async execute(message: Message, args: string[]): Promise<void> {
        const { channel, author, guild } = message
        const reportChannel = message.guild.channels.cache.get(Config.reportsChannel);
        const reported = args.shift()
        const reason = args.join(' ')
        await channel.messages.fetch()
        const reportedMessage = channel.messages.cache.get(reported)
        const errorCode = this.errorCode(reported, reason, reportedMessage)

        if (errorCode) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: this.getMessageFromErrorCode(errorCode)
            }))
            return
        }

        if (message.deletable) {
            await message.delete()
        }

        await channel.send(new MessageEmbed({
            color: Colors.Success,
            description: 'Wiadomość została zgłoszona!'
        }))

        if (reportChannel.isText()) {
            await reportChannel.send(new MessageEmbed({
                color: Colors.Info,
                description: 'Report',
                fields: [
                    { name: 'Zgłoszone przez:', value: `Użytkownik: <@!${author.id}> ID: ${author.id}` },
                    { name: 'Zgłoszono na kanale:', value: `<#${channel.id}>` },
                    { name: 'Id zgłoszonej wiadmości:', value: reported },
                    { name: 'Link do zgłoszonej wiadomości:', value: `https://discord.com/channels/${guild.id}/${channel.id}/${reported}` },
                    { name: 'Czas:', value: Utils.dateToString(message.createdAt) },
                    { name: 'Powód:', value: reason }
                ]
            }));
        }
    }

    private errorCode(reported: string, reason: string, message: Message): number {
        if (!reported.match(/[0-9]{18}/)) return 1
        if (!reason) return 2
        if (!message) return 3
        return 0
    }

    private getMessageFromErrorCode(errorCode: number): string {
        const messages = [
            'Id wiadomości się nie zgadza!',
            'Musisz podać powód zgłoszenia!',
            'upłynął limit czasu na zgłoszenie bądź wiadomosć nie znajduje się na tym kanale'
        ]
        return messages[errorCode-1]
    }
}