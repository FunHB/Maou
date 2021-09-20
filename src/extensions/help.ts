import { MessageEmbed } from "discord.js"
import { Colors } from "../api/colors"
import { Module } from "../api/module"
import { Config } from "../config"

export function getHelpForModule(module: Module, commandName: string) {
    const { group, commands } = module
    const config = new Config()
    const prefix = group.length > 1 ? `${config.prefix}${group} ` : config.prefix
    const data = []

    if (!commandName) {
        data.push({ name: 'Lista poleceń bota:\n', value: commands.map(command => command.name).join(", ") })
        const footer = `\nAby wyświetlić informacje na temat danego polecenia wpisz: ${prefix}pomoc [nazwa polecenia]`

        return new MessageEmbed({
            color: Colors.Info,
            fields: data,
            footer: { text: footer },
        })
    }

    const name = commandName
    const command = commands.find(cmd => cmd.name === name || (cmd.aliases && cmd.aliases.includes(name)))

    if (!command) {
        return new MessageEmbed({
            color: Colors.Error,
            description: 'Nie znaleziono polecenia.',
        })
    }

    const title = `**Nazwa polecenia:** ${command.name}`

    if (command.aliases) data.push({ name: "**Aliasy:**", value: `${command.aliases.join(', ')}` })
    if (command.description) data.push({ name: "**Opis:**", value: `${command.description}` })
    if (command.usage) data.push({ name: "**Użycie:**", value: `${prefix}${command.name} ${command.usage}` })

    return new MessageEmbed({
        color: Colors.Info,
        title: title,
        fields: data,
    })
}