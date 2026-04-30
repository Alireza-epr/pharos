import { ELogType } from '../helpers/types/generalTypes';
import { log } from '../helpers/utils/backendUtils';
import {
  IMessage,
  IReceiverEmitterArgs,
  TMessageBody,
} from '../helpers/types/ioTypes';
import { EClassId, EMessageStatus, EMethodId } from '../helpers/enum/ioEnum';
import { Observer } from '../helpers/utils/servicesUtils';
import { IOService } from './IOService';
import RouteService from './RouteService';
import { ERepositoryKey } from '@packages/enum';

export class GenericComService {
  private ioService: IOService;

  constructor(a_RouteService: RouteService, a_IOService: IOService) {
    this.ioService = a_IOService;

    const sendingObserver = new Observer<IMessage>(async (a_Message) => {
      await a_RouteService.handleSendingMessage(a_Message);
    });
    this.ioService.subscribe(sendingObserver);

    // Define the listener for each classId to handle messages received for that classId
    const classIds = Object.values(EClassId).filter(
      (v) => typeof v === 'number',
    );
    for (const classId of classIds) {
      //const key = `${a_SessionId}_${classId}`
      const key = `${0}_${classId}`;
      this.ioService.receiverEmitter.on(
        key,
        (...args: IReceiverEmitterArgs) => {
          log(
            `[GenericComService] Message for ClassId: ${classId}`,
            ELogType.info,
          );
          log(
            `[GenericComService] Message Header: ${JSON.stringify(args[0])}`,
            ELogType.info,
          );
          log(
            `[GenericComService] Message Body: ${JSON.stringify(args[1])}`,
            ELogType.info,
          );
        },
      );
    }
  }

  async execute<T>(
    a_SessionId: string,
    a_ClassId: EClassId,
    a_MethodId: EMethodId,
    a_Repository: ERepositoryKey,
    a_Data: TMessageBody,
  ): Promise<T> {
    const message: IMessage = {
      header: {
        refId: 0,
        sessionId: a_SessionId,
        classId: a_ClassId,
        methodId: a_MethodId,
        repository: a_Repository,
        status: EMessageStatus.pending,
      },
      body: a_Data,
    };

    const resp = await this.ioService.sendMessage(message);

    if (resp) {
      return resp.body as T;
    }

    throw new Error(
      '[GenericComService] Failed to send the message: ' +
        JSON.stringify(message),
    );
  }
}
