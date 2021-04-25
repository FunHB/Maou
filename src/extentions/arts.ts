import fetch from 'node-fetch'

export class Arts {
    private static url = 'https://waifu.pics/api/sfw/'

    private static types = [
        'waifu',
        'neko',
        'bully',
        'cuddle',
        'cry',
        'hug',
        'awoo',
        'kiss',
        'pat',
        'smug',
        'bonk',
        'yeet',
        'blush',
        'smile',
        'wave',
        'highfive',
        'handhold',
        'norn',
        'bite',
        'glomp',
        'kill',
        'slap',
        'happy',
        'poke',
        'dance'
    ]

    public static async getRandomImage(): Promise<string> {
        const type = this.types[Math.floor(Math.random() * this.types.length)]
        const reponse = await fetch(`${this.url}${type}`)
        const body = await reponse.json()
        return body.url
    }
}