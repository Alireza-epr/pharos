import { EClassId, EMessageBodyKey, EMessageStatus, EMethodId } from "../enum/ioEnum";
import { ERepositoryKey } from "@packages/enum";


export interface IMessage {
    header: {
        sessionId: string,
        refId: number
        classId: EClassId,
        methodId: EMethodId,
        status: EMessageStatus,
        repository: ERepositoryKey
    }
    // Body should match one of the Models ( Schema )
    body: TMessageBody
}



export type TMessageBody = { [K in EMessageBodyKey]?: any } & { [key: string]: any };

export type IReceiverEmitterArgs = [ IMessage["header"], IMessage["body"] ]