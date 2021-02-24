import { Client, Intents } from 'discord.js'
import Bot from './bot'

const intents = new Intents([
    Intents.NON_PRIVILEGED,
    "GUILD_MEMBERS",
]);

const client = new Client({ ws: { intents } });

new Bot().start(client)