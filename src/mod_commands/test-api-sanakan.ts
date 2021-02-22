import { Message, MessageAttachment } from 'discord.js'
import axios from 'axios'
import fs from 'fs'
import { channelType, Command } from '../api'
import { Config } from '../config'
const config = new Config()

export class TestApiSanakanCommand implements Command {
    public name = 't'
    public description = 'Testowe polecenie bota!'
    public args = true
    public roles: string[] = [config.modRole]
    public usage = '<tag> <id-osoby>'
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 0

    public async execute(message: Message, args: string[]): Promise<void> {
        if (!args.length) return

        const tagUser = args.shift();
        const waifuUserID = args.shift();

        const waifuProfile = await axios.get(`https://api.sanakan.pl/api/waifu/user/${waifuUserID}/profile`).then(({ data }) => data)

        const waifu = await axios.get(`https://api.sanakan.pl/api/waifu/user/${waifuUserID}/cards/0/${this.cardsCount(waifuProfile)}`).then(({ data }) => data)
        const idArray: string[] = []

        waifu.forEach((card: { id: string, tags: string[] }) => {
            let tag = card.tags.filter(tag => tag === tagUser)
            if (tag.length) idArray.push(card.id)
        });

        fs.writeFileSync('./data/wids.txt', idArray.join(' '))
        const buffer = fs.readFileSync('./data/wids.txt');

        await message.channel.send(`Liczba kart w tagu: ${idArray.length}`, new MessageAttachment(buffer, 'wids.txt'));
    }

    private cardsCount( cards: { sssCount: number, ssCount: number, sCount: number, aCount: number, bCount: number, cCount: number, dCount: number, eCount: number }): number {
        return cards.sssCount + cards.ssCount + cards.sCount + cards.aCount + cards.bCount + cards.cCount + cards.dCount + cards.eCount
    }
}
