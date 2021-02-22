import { Client } from 'discord.js'
import { Config } from './config'
import Bot from './bot'

const config = new Config()
const client = new Client()

new Bot().start(client, config)