import { Request, Response, NextFunction } from 'express';
import { formatTimestamp } from '../helpers/utils/backendUtils';

export const attachStartTime = async (
  a_Req: Request,
  a_Res: Response,
  a_Next: NextFunction,
): Promise<void> => {
  a_Req.start_time = formatTimestamp();
  a_Next();
};