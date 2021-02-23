import { Client } from 'discord.js'
import Bot from './bot'

const client = new Client()

new Bot().start(client)