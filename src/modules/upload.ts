import { MessageEmbed, TextBasedChannel } from "discord.js"
import { Colors } from "../api/types/colors"
import { Command } from "../api/interfaces/command"
import { Module } from "../api/interfaces/module"
import { Config } from "../config"
import { Help } from "../extensions/help"
import { channelType } from "../preconditions/requireChannel"
import { Logger } from "../services/logger"

export class Upload implements Module {
    public name = 'Upload'
    public group = 'upload'
    public help: Help

    private readonly logger: Logger

    constructor(logger: Logger, ...modules: Module[]) {
        this.logger = logger
        this.help = new Help(this, ...modules)
    }

    public commands: Command[] = [
        {
            name: 'dood',
            description: 'Uploaduje z gdriva na dood',
            requireArgs: true,
            usage: '[GdriveLink]',
            channelType: channelType.upload,

            execute: async (message, args) => {
                const { channel } = message
                const config = new Config()
                const sourceUrl = args.join()

                const baseApiUrl: string = "https://doodapi.com/api"
                const regexGdrive = new RegExp('(https:\/\/drive\.google\.com\/file\/)\S*', 'gm')

                if (!config.upload.dood) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Brak klucza do API'
                        })]
                    })
                    return
                }

                if (!sourceUrl.match(regexGdrive)) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Nieprawidłowy link'
                        })]
                    })
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
                    this.logger.HandleMessage(`[Upload] Error: ${exception}`)
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: `Błąd api`
                        })]
                    })
                }
            }
        },

        {
            name: 'streamsb',
            description: 'Uploaduje z gdriva na steamsb',
            requireArgs: true,
            channelType: channelType.upload,
            usage: '<link do gdrive>',

            execute: async (message, args) => {
                const { channel } = message
                const config = new Config()
                const sourceUrl = args.shift()
                const baseApiUrl = "https://streamsb.com/api"

                if (!config.upload.dood) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Brak klucza do API'
                        })]
                    })
                    return
                }

                if (!sourceUrl.match(new RegExp('(https:\/\/drive\.google\.com\/file\/)\S*', 'm'))) {
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: 'Nieprawidłowy link'
                        })]
                    })
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
                    this.logger.HandleMessage(`[Upload] Error: ${exception}`)
                    await channel.send({
                        embeds: [new MessageEmbed({
                            color: Colors.Error,
                            description: `Błąd api`
                        })]
                    })
                }
            }
        },

        {
            name: 'pomoc',
            description: 'Wyświetla listę wszystkich poleceń lub informacje o danym poleceniu',
            aliases: ['help', 'h'],
            usage: '[polecenie]',
            channelType: channelType.upload,

            execute: async (message, args) => {
                await message.channel.send({ embeds: this.help.getHelp(args.join(' ').toLowerCase()) })
            }
        }
    ]

    private static async notifyAboutLink(channel: TextBasedChannel, hosting: string, url: string) {
        await channel.send({
            embeds: [new MessageEmbed({
                color: Colors.Success,
                fields: [
                    { name: hosting, value: url }
                ],
                footer: {
                    text: 'Jeśli nie działa to poczekaj! A jeśli dalej nie działa to zgłoś do ZYGl'
                }
            })]
        })
    }
}