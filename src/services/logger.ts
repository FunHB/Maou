import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs'
import { join } from 'path';

export class Logger {
    private date: Date
    private stream: WriteStream;

    private readonly directory: string = './logs'
    private get path(): string { return join(this.directory, `${('00' + this.date.getDate()).slice(-2)}.${('00' + (this.date.getMonth() + 1)).slice(-2)}.${this.date.getFullYear()}.txt`) }

    constructor() {
        if (!existsSync(this.directory)) {
            mkdirSync(this.directory)
        }

        this.date = new Date()

        setInterval(async () => {
            try {
                this.autoValidate()
            } catch (exception) {
                const errorMessage = `[Logger] ${exception}`

                this.HandleMessage(errorMessage)
                console.error(errorMessage)
            }
        },
            30000
        )
    }

    private createStream() {
        if (!this.stream) {
            this.stream = createWriteStream(this.path, { flags: 'a+' })
        }        
    }

    private autoValidate(): void {
        const currentDate = new Date()

        if (currentDate.getDate() !== this.date.getDate() || currentDate.getMonth() !== this.date.getMonth() || currentDate.getFullYear() !== this.date.getFullYear()) {
            this.date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
        }
    }

    public HandleMessage(message: string): void {
        this.createStream()
        this.stream.write(`\n${message}`)
    }
}