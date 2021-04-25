import fs from 'fs'

export class Recrutation {
    public static getRecrutationStatus(): boolean {
        return fs.existsSync('./data/rekrutacja')
    }

    public static changeRecrutationStatus(): void {
        if (this.getRecrutationStatus()) {
            fs.unlinkSync('./data/rekrutacja')
            return
        }
        fs.writeFileSync('./data/rekrutacja', '')
    }
}