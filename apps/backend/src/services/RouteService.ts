import { ERepositoryKey } from '@packages/enum';
import { IMessage, TMessageBody } from '../helpers/types/ioTypes';
import { Observer, Subject } from '../helpers/utils/servicesUtils';
import { IOService } from './IOService';
import { TRepositoryValue } from '@packages/types';
import { log } from '../helpers/utils/backendUtils';
import { EMessageStatus } from '../helpers/enum/ioEnum';
import { ELogType } from '../helpers/types/generalTypes';

export default class RouteService extends Subject<IMessage> {
  private _repositories = new Map<ERepositoryKey, TRepositoryValue>();

  constructor(a_IOService: IOService) {
    super();
    const receivingObserver = new Observer<IMessage>((a_Message) => {
      a_IOService.receiveMessage(a_Message);
    });
    this.subscribe(receivingObserver);
    //this._dbType = a_DBType
  }

  public async handleSendingMessage(a_Message: IMessage) {
    // Select repository from Message
    log(
      `[RouteService] Send the message: ${JSON.stringify(a_Message)}`,
      ELogType.info,
    );
    let repository;
    switch (a_Message.header.repository) {
      case ERepositoryKey.gfw:
        break;
      default:
        this.pushErrorToBody(
          a_Message,
          `[RouteService] Repository not defined: ${a_Message.header.repository}`,
        );
        break;
    }
  }

  public handleReceivingMessage(a_Message: IMessage) {
    const receivedMessage: IMessage = {
      header: a_Message.header,
      body: a_Message.body,
    };
    log(
      `[RouteService] Message is received: ${JSON.stringify(receivedMessage)}`,
      ELogType.info,
    );
    this.dispatch(receivedMessage);
  }

  public pushReplyToBody(a_Message: IMessage, a_Resp: TMessageBody) {
    const respMessage: IMessage = {
      header: {
        ...a_Message.header,
        status: EMessageStatus.success,
      },
      body: a_Resp,
    };
    // Set this timeout to handle internal messages
    setTimeout(() => {
      this.handleReceivingMessage(respMessage);
    }, 100);
  }

  public pushErrorToBody(a_Message: IMessage, a_Error: any) {
    // Manipulate the body to include the error
    const errorMessage: IMessage = {
      header: {
        ...a_Message.header,
        status: EMessageStatus.failed,
      },
      body: {
        error: String(a_Error),
        ...a_Message.body,
      },
    };
    // Set this timeout to handle internal errors
    setTimeout(() => {
      this.handleReceivingMessage(errorMessage);
    }, 100);
  }

  public addRepository(a_Key: ERepositoryKey, a_Value: TRepositoryValue) {
    this._repositories.set(a_Key, a_Value);
  }

  public hasRepository(a_Key: ERepositoryKey) {
    return this._repositories.has(a_Key);
  }
}
