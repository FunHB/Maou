import { IConfig, IExp } from './api/IConfig'
import fs from 'fs'
import { MessageEmbed } from 'discord.js'
import { Colors } from './api/colors'

export class Config {
    public readonly token: string
    public readonly upload: Record<string, string>
    public prefix: string
    public channels: Record<string, string>
    public roles: Record<string, string>
    public messages: Record<string, string>
    public exp: IExp
    public readonly creator: string
    public readonly version: string

    constructor() {
        const config: IConfig = JSON.parse(fs.readFileSync('./config.json').toString())
        const packageJson: { author: string, version: string } = JSON.parse(fs.readFileSync('./package.json').toString())
        this.token = config.token
        this.upload = config.upload
        this.prefix = config.prefix
        this.channels = config.channels
        this.roles = config.roles
        this.messages = config.messages
        this.exp = config.exp
        this.creator = packageJson.author
        this.version = packageJson.version
    }

    public toString(): string {
        return Object.entries(new Config()).filter(([key]) => key !== 'token').map(([key, value]) => `${key}: ${typeof value === 'object' ? `{\n${Object.entries(value).map(([key, value]) => `\t${key}: ${value}`).join('\n')}\n}` : value}`).join('\n')
    }

    public toEmbed(): MessageEmbed {
        const showInConfig = [
            'prefix',
            'channels',
            'roles',
            'messages',
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
            prefix: this.prefix,
            channels: this.channels,
            roles: this.roles,
            upload: this.upload,
            exp: this.exp,
            messages: this.messages,
            creator: this.creator,
            version: this.version
        }

        fs.writeFileSync('./config.json', JSON.stringify(config))
    }
}