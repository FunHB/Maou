import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs'
import { join } from 'path';
import { Utils } from '../extensions/utils';

export class Logger {
    private date: Date
    private stream: WriteStream;

    private readonly directory: string = './logs'
    private get path(): string { return join(this.directory, `${Utils.dateToString(this.date, true, false)}`) }

    constructor() {
        if (!existsSync(this.directory)) {
            mkdirSync(this.directory)
        }

        this.date = new Date()

        setInterval(async () => {
            try {
                this.autoValidate()
            } catch (exception) {
                this.HandleMessage(`[Logger] ${exception}`)
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

    public HandleMessage(message: string, error = true): void {
        if (error) console.error(message)
        else console.info(message)

        this.createStream()
        const date = new Date()
        this.stream.write(`(${Utils.dateToString(date, false, true, true)}) ${message}\n`)
    }
}