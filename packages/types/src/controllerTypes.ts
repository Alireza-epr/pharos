import { EResponseError, EResponseMessage } from "@packages/enum";

export interface IResponse {
  success?: boolean,
  error?: EResponseError,
  message?: EResponseMessage
}

