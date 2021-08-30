import { SupervisorMessage } from './SupervisorMessage'

export class SupervisorEntity {
    public messages: SupervisorMessage[]
    public lastMessage: Date
    public totalMessages: number

    constructor(contentOfFirstMessage?: string) {
        this.messages = new Array<SupervisorMessage>()
        this.lastMessage = new Date()
        this.totalMessages = 0

        if (contentOfFirstMessage) {
            this.totalMessages = 1
            this.messages.push(new SupervisorMessage(contentOfFirstMessage))
        }
    }

    public get(content: string): SupervisorMessage {
        let message = this.messages.find(message => message.content == content)
        if (message == null) {
            message = new SupervisorMessage(content, 0)
            this.messages.push(message)
        }
        return message
    }

    public add(message: SupervisorMessage): void {
        this.messages.push(message)
    }

    public isValid = (): boolean => { return (Date.now() - this.lastMessage.getTime()) / 1000 / 60 <= 2 }

    public increment = (): number => {
        if ((Date.now() - this.lastMessage.getTime()) / 1000 > 5) {
            this.totalMessages = 0
        }
        this.lastMessage = new Date()

        return ++this.totalMessages
    }
}