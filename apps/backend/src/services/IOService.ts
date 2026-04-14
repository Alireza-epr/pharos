import { IMessage, IReceiverEmitterArgs} from "../helpers/types/ioTypes";
import { EMessageStatus} from "../helpers/enum/ioEnum";
import { ReceiverEmitter, Observer, Subject } from "../helpers/utils/servicesUtils";

export class IOService extends Subject<any> {

    private refId = 1
    private requestsQueue : IMessage[] = []
    private receiveMessageSubject = new Subject<IMessage>()

    private responseTimeout = 5000

    public receiverEmitter = new ReceiverEmitter()

    async sendMessage (a_Message: IMessage ): Promise<IMessage> {

        const thisMessageWithRefId = this.setRefId(a_Message)
        this.requestsQueue.push(thisMessageWithRefId)
        // send message by router then return the promise holds this message observer
        this.dispatch( a_Message )
        return new Promise<IMessage>( (resolve, reject) => {
            const thisMessageObserver = new Observer<IMessage>( (a_ReceivedMessage) => {
                if( a_ReceivedMessage.header.refId == thisMessageWithRefId.header.refId &&
                    a_ReceivedMessage.header.sessionId == thisMessageWithRefId.header.sessionId
                ){
                    this.receiveMessageSubject.unsubscribe(thisMessageObserver)
                    this.requestsQueue = this.requestsQueue.filter( m => m.header.refId !== a_Message.header.refId)
                    if( a_ReceivedMessage.header.status == EMessageStatus.failed ){
                        if(a_ReceivedMessage.body.error){
                            reject(`[IOService] Error refId ${a_ReceivedMessage.header.refId}: ${a_ReceivedMessage.body.error}`)
                        } else {
                            reject(`[IOService] Failed to get response refId ${a_ReceivedMessage.header.refId}, sessionId ${a_ReceivedMessage.header.sessionId}`)
                        }
                    }
                    resolve(a_ReceivedMessage)
                }
            })
            this.receiveMessageSubject.subscribe(thisMessageObserver)
            setTimeout(()=>{
                this.receiveMessageSubject.unsubscribe(thisMessageObserver)
                this.requestsQueue = this.requestsQueue.filter( m => m.header.refId !== a_Message.header.refId)
                reject(`[IOService] Failed to get response refId ${a_Message.header.refId}, sessionId ${a_Message.header.sessionId} after ${this.responseTimeout/1000}s`)
            }, this.responseTimeout)          
        })
    }

    async receiveMessage (a_Message: IMessage) {

        if(a_Message.header.refId && a_Message.header.refId !== 0){
            this.receiveMessageSubject.dispatch( a_Message )
        } else {
            // This is where messages without refId (or refId = 0)  must be handled. These are not sent by the API.
            // For instance: receiving a heartbeat message from a WebSocket (ClassId = wsHeartbeat)
            //const key = `${a_Message.header.sessionId}_${a_Message.header.classId}`
            const key = `${0}_${a_Message.header.classId}`
            const args: IReceiverEmitterArgs = [a_Message.header, a_Message.body]
            this.receiverEmitter.emit( key, args)
        }
        
    }

    setRefId (a_Message: IMessage) {
        a_Message.header.refId = this.refId
        this.refId++
        return a_Message
    }

}