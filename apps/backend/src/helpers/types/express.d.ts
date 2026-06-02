import { IEventSchema } from "@packages/types";

export {};

declare global {
  namespace Express {
    interface Request {
      events?: IEventSchema[]
      start_time?: string,
      gitCommitSHA?: string
    }
  }
}
