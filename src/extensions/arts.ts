import fetch from 'node-fetch'

export class Arts {
    private static url = 'https://api.waifu.im/random/?selected_tags=waifu&is_nsfw=no'

    public static async getRandomImage(): Promise<string> {
        const response = await fetch(this.url)
        const { images } = await response.json()
        return (images.shift()).url
    }
}
