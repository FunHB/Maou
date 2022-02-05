import { Message } from "discord.js";
import { DatabaseManager } from "../database/databaseManager";
import { ChannelEntity, ChannelType } from "../database/entity/Channel";

export class AutoPublic {
    public async public(message: Message) {
        const { guild, channel } = message

        if (!(channel.type == 'GUILD_NEWS' || channel.type == 'GUILD_NEWS_THREAD')) return

        const channelsWithAutoPublic: string[] = (await DatabaseManager.getEntities(ChannelEntity, { guild: guild.id, type: ChannelType.autoPublic })).map(channel => channel.id)

        if (channelsWithAutoPublic.includes(channel.id)) {
            message.crosspost()
        }
    }
}