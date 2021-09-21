import { Client, Intents } from 'discord.js'
import Bot from './bot'

const intents = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_PRESENCES
]

const client = new Client({ intents: intents })
const bot = new Bot(client);

(async () => {
    await bot.start()
})()