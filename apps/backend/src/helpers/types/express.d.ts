export {};

declare global {
  namespace Express {
    interface Request {
      gitCommitSHA?: string
    }
  }
}
