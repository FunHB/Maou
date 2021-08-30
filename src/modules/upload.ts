import { DMChannel, MessageEmbed, NewsChannel, TextChannel } from "discord.js"
import { Colors } from "../api/colors"
import { Command } from "../api/command"
import { Module } from "../api/module"
import { Config } from "../config"
import { getHelpForModule } from "../extensions/help"
import { channelType } from "../preconditions/requireChannel"

export class Upload implements Module {
    public group = 'upload'

    public commands: Command[] = [
        {
            name: 'dood',
            description: 'Uploaduje z gdriva na dood',
            aliases: ['up'],
            usage: '[GdriveLink]',
            channelType: channelType.upload,

            execute: async function (message, args) {
                const { channel } = message
                const config = new Config()
                const sourceUrl = args.join()

                const baseApiUrl: string = "https://doodapi.com/api"
                const regexGdrive = new RegExp('(https:\/\/drive\.google\.com\/file\/)\S*', 'gm')

                if (!config.upload.dood) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Brak klucza do API'
                    }))
                    return
                }
                
                if (!sourceUrl.match(regexGdrive)) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Nieprawidłowy link'
                    }))
                    return
                }

                try {
                    const reponse = await fetch(`${baseApiUrl}/upload/url?key=${config.upload.dood}&url=${sourceUrl}`)

                    // {
                    //     "msg": "OK",
                    //     "server_time": "2021-05-13 21:32:51",
                    //     "new_title": "",
                    //     "status": 200,
                    //     "total_slots": "60",
                    //     "result": {
                    //         "filecode": "tper3k01tf26"
                    //     },
                    //     "used_slots": "0"
                    // }

                    const body = await reponse.json()
                    const result = body.result

                    if (body.used_slots > 5) {
                        fetch(`${baseApiUrl}/urlupload/actions?key=${config.upload.dood}&clear_errors=1`)
                    }

                    await Upload.notifyAboutLink(channel, this.name, `https://dood.to/e/${result.filecode}`)
                } catch (exception) {
                    console.error(`[Upload] Error: ${exception}`)
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: `Błąd api`
                    }))
                }
            }
        },

        {
            name: 'streamsb',
            description: 'Uploaduje z gdriva na steamsb',
            requireArgs: true,
            channelType: channelType.upload,
            usage: '<link do gdrive>',

            execute: async function (message, args) {
                const { channel } = message
                const config = new Config()
                const sourceUrl = args.shift()
                const baseApiUrl = "https://streamsb.com/api"

                if (!config.upload.dood) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Brak klucza do API'
                    }))
                    return
                }

                if (!sourceUrl.match(new RegExp('(https:\/\/drive\.google\.com\/file\/)\S*', 'm'))) {
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: 'Nieprawidłowy link'
                    }))
                    return
                }

                try {
                    const reponse = await fetch(`${baseApiUrl}/upload/url?key=${config.upload.streamsb}&url=${sourceUrl}`)

                    // {
                    //     "msg": "OK",
                    //     "server_time": "2017-08-11 04:29:54",
                    //     "status": 200,
                    //     "result": {
                    //         "filecode": "jthi5jdsu8t9"
                    //     }
                    // }

                    const { filecode } = (await reponse.json()).result
                    await Upload.notifyAboutLink(channel, this.name, `https://sbembed3.com/${filecode}.html`)
                } catch (exception) {
                    console.error(`[Upload] Error: ${exception}`)
                    await channel.send(new MessageEmbed({
                        color: Colors.Error,
                        description: `Błąd api`
                    }))
                }
            }
        },

        {
            name: 'pomoc',
            description: 'Wyświetla listę wszystkich poleceń lub informacje o danym poleceniu',
            aliases: ['help', 'h'],
            usage: '[polecenie]',
            channelType: channelType.upload,

            execute: async function (message, args) {
                await message.channel.send(getHelpForModule(new Upload(), args.join(' ').toLowerCase()))
            }
        }
    ]

    private static async notifyAboutLink(channel: TextChannel | DMChannel | NewsChannel, hosting: string, url: string) {
        await channel.send(new MessageEmbed({
            color: Colors.Success,
            fields: [
                { name: hosting, value: url }
            ],
            footer: {
                text: 'Jeśli nie działa to poczekaj! A jeśli dalej nie działa to zgłoś do ZYGl'
            }
        }))
    }
}