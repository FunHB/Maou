import { Message } from "discord.js";
import { DatabaseManager } from "../database/databaseManager";
import { ChannelEntity, ChannelType } from "../database/entity/Channel";

export class AutoPublic {
    public static async public(message: Message) {
        const { channel } = message

        if (!(message.channel.type == 'news')) return

        const channelsWithAutoPublic: string[] = (await DatabaseManager.getEntities(ChannelEntity, { type: ChannelType.autoPublic })).map(channel => channel.id)

        if (channelsWithAutoPublic.includes(channel.id)) {
            message.crosspost()
        }
    }
}