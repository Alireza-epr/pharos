import { EResponseError, EResponseMessage } from "@packages/enum";
import { IEventSchema, IRunMetadata } from "./eventTypes";
import { IStats } from "./generalTypes";

export interface IResponse {
  success?: boolean;
  error?: EResponseError;
  message?: EResponseMessage;
  limit?: number | null,
  offset?: number | null,
  nextOffset?: number | null,
  page_size?: number | null,
  page?: number | null,
  stats?: IStats,
  metadata?: IRunMetadata,
  entries?: Partial<IEventSchema>[]
}
