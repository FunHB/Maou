import fs from 'fs'

export class Recrutation {
    public static getRecrutationStatus(): boolean {
        return fs.existsSync('rekrutacja')
    }

    public static changeRecrutationStatus(): void {
        if (this.getRecrutationStatus()) {
            fs.unlinkSync('rekrutacja')
            return
        }
        fs.writeFileSync('rekrutacja', '')
    }
}