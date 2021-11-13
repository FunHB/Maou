import fetch from 'node-fetch'

export class Arts {
    private static url = 'https://api.waifu.im/sfw/waifu'

    public static async getRandomImage(): Promise<string> {
        const response = await fetch(this.url)
        const body = await response.json()
        return body.tags[0].images[0].url
    }
}