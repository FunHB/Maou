import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';
import { Config } from '../config';
const config = new Config()

export class ReportCommand implements Command {
    public name = 'report'
    public description = 'Dzięki niej możesz zgłosić wiadomośc użytkownika.'
    public aliases: string[] = ['raport', 'zgłoś', 'zgloś', 'zgłos', 'zglos']
    public args = true
    public roles: string[]
    public usage = '<id wiadomości> [powód zgłoszenia]'
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 1

    public async execute(message: Message, args: string[]): Promise<void> {
        const reportChannel = message.guild.channels.cache.get(config.reportsChannel);
        const reported = args.shift()
        const reason = args.join(' ')

        if (isNaN(parseInt(reported))) {
            await message.channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'To nawet nie jest liczba! Musisz podać ID wiadomości, którą chcesz zgłosić.'
            }))
            return
        }

        if (reported.length != 18) {
            await message.channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Coś krótka ta wiadomość.. jak dla mnie ID to to nie jest :('
            }))
            return
        }

        if (!args[1]) {
            await message.channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Musisz podać powód zgłoszenia!'
            }))
            return
        }

        if (message.deletable) {
            await message.delete();
        }

        await message.channel.send(new MessageEmbed({
            color: Colors.Success,
            description: 'Wiadomość została zgłoszona!'
        }))


        if (reportChannel.isText()) {
            await reportChannel.send(new MessageEmbed({
                color: Colors.Info,
                description: 'Report',
                fields: [
                    { name: 'Zgłoszone przez:', value: `Użytkownik: <@!${message.author.id}> ID: ${message.author.id}` },
                    { name: 'Zgłoszono na kanale:', value: `<#${message.channel.id}>` },
                    { name: 'Id zgłoszonej wiadmości:', value: reported },
                    { name: 'Link do zgłoszonej wiadomości:', value: `https://discord.com/channels/${message.guild.id}/${message.channel}/${reported}` },
                    { name: 'Czas:', value: message.createdAt },
                    { name: 'Powód:', value: reason }
                ]
            }));
        }

    }
}