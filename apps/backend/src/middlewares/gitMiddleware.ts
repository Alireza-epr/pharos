import { Request, Response, NextFunction } from 'express';
import { getGitCommitSHA } from '../helpers/utils/backendUtils';

export const attachGitCommitSHA = async (
  a_Req: Request,
  a_Res: Response,
  a_Next: NextFunction,
): Promise<void> => {
  a_Req.gitCommitSHA = await getGitCommitSHA();
  a_Next();
};
