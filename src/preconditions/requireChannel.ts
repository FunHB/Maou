import { Message, MessageEmbed, Permissions } from "discord.js";
import { Colors } from "../api/colors";
import { Config } from "../config";

export enum channelType {
    normal,
    commands,
    arts,
    reports,
    upload
}

export const RequireChannel = async (message: Message, channel: channelType): Promise<boolean> => {
    if (message.member.hasPermission(Permissions.FLAGS.ADMINISTRATOR) || channel === channelType.normal || !channel || getChannelByChannelType(channel) === message.channel.id) return true

    await message.channel.send(new MessageEmbed({
        color: Colors.Error,
        description: `Polecenia można używać jedynie na kanale <#${getChannelByChannelType(channel)}>`
    }))
    return false
}

const getChannelByChannelType = (type: channelType): string => {
    const config = new Config()
    if (type === channelType.commands) return config.channels.commands
    if (type === channelType.arts) return config.channels.arts
    if (type === channelType.reports) return config.channels.reports
    if (type === channelType.upload) return config.channels.upload
    return ''
}