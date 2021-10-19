import { IConfig, IExp } from './api/interfaces/IConfig'
import fs from 'fs'
import { MessageEmbed } from 'discord.js'
import { Colors } from './api/types/colors'

export class Config {
    public readonly token: string
    public readonly databaseString: string
    public readonly upload: Record<string, string>
    public prefix: string
    public exp: IExp
    public readonly creator: string
    public readonly version: string

    public measureDate: Date

    constructor() {
        const config: IConfig = JSON.parse(fs.readFileSync('./config.json').toString())
        const packageJson: { author: string, version: string } = JSON.parse(fs.readFileSync('./package.json').toString())
        this.token = config.token
        this.databaseString = config.databaseString
        this.upload = config.upload
        this.prefix = config.prefix
        this.exp = config.exp
        this.creator = packageJson.author
        this.version = packageJson.version
        this.measureDate = config.measureDate ? new Date(config.measureDate) : null
    }

    public toString(): string {
        return Object.entries(new Config()).filter(([key]) => key !== 'token').map(([key, value]) => `${key}: ${typeof value === 'object' ? `{\n${Object.entries(value).map(([key, value]) => `\t${key}: ${value}`).join('\n')}\n}` : value}`).join('\n')
    }

    public toEmbed(): MessageEmbed {
        const showInConfig = [
            'prefix',
            'exp'
        ]
        const config = Object.entries(new Config()).filter(([key]) => showInConfig.includes(key))
        const embed = new MessageEmbed().setColor(Colors.Info)

        config.forEach(([key, value]) => {
            if (typeof value === 'object') {
                value = Object.entries(value).map(([key, value]) => `${key}: ${value}`).join('\n')
            }
            embed.addField(key, value)
        })

        return embed
    }

    public save(): void {
        const config = {
            token: this.token,
            databaseString: this.databaseString,
            prefix: this.prefix,
            upload: this.upload,
            exp: this.exp,
            measureDate: this.measureDate
        }

        fs.writeFileSync('./config.json', JSON.stringify(config))
    }
}