import { JwtPayload } from "jsonwebtoken"
import { EJWTErrorMessage, EJWTErrorName, ERequestUserRole } from "../enum/tokenEnum"

export type TDecoded = string | JwtPayload

export interface IJWTError {
    name: EJWTErrorName,
    message: EJWTErrorMessage,
    expiredAt?: number
    data?: Date
}
export interface IUser {
    username: string,
    role: ERequestUserRole,
    accessToken: string,
    refreshToken: string
}

