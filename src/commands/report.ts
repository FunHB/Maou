import { Channel, Guild, Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';
import { Config } from '../config';
import { Utils } from '../modules/utils';
const config = new Config()

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
        const reportChannel = message.guild.channels.cache.get(config.reportsChannel);
        const reported = args.shift()
        const reason = args.join(' ')

        if (isNaN(parseInt(reported))) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'To nawet nie jest liczba! Musisz podać ID wiadomości, którą chcesz zgłosić.'
            }))
            return
        }

        if (reported.length != 18) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Coś krótka ta wiadomość.. jak dla mnie ID to to nie jest :('
            }))
            return
        }

        if (!args[0]) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Musisz podać powód zgłoszenia!'
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

        // link to repair - report from other channel
        if (reportChannel.isText()) {
            await reportChannel.send(new MessageEmbed({
                color: Colors.Info,
                description: 'Report',
                fields: [
                    { name: 'Zgłoszone przez:', value: `Użytkownik: <@!${author.id}> ID: ${author.id}` },
                    { name: 'Zgłoszono na kanale:', value: `<#${channel.id}>` },
                    { name: 'Id zgłoszonej wiadmości:', value: reported },
                    { name: 'Link do zgłoszonej wiadomości:', value: `https://discord.com/channels/${guild.id}/${this.getChannel(guild, reported)}/${reported}` },
                    { name: 'Czas:', value: Utils.dateToString(message.createdAt) },
                    { name: 'Powód:', value: reason }
                ]
            }));
        }
    }

    private getChannel(guild: Guild, channelID: string): Channel {
        return guild.channels.cache.get(channelID)
    }
}