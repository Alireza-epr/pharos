export enum EJWTErrorName {
    TokenExpiredError = "TokenExpiredError",
    JsonWebTokenError = "JsonWebTokenError",
    NotBeforeError = "NotBeforeError"
}

export enum EJWTErrorMessage {
    Expired = "jwt expired",
    InvalidToken = "invalid token - the header or payload could not be parsed",
    Malformed = "jwt malformed - the token does not have three components (delimited by a .)",
    SignatureIsRequired = "jwt signature is required",
    InvalidSignature = "invalid signature",
    AudienceInvalid = "jwt audience invalid. expected: [OPTIONS AUDIENCE]",
    IssuerInvalid = "jwt issuer invalid. expected: [OPTIONS ISSUER]",
    IdInvalid = "jwt id invalid. expected: [OPTIONS JWT ID]",
    SubjectInvalid = "jwt subject invalid. expected: [OPTIONS SUBJECT]"
}

export enum ERequestUserRole {
    notAvailable = "n/a",
    noRight = "noRight",
    readOnly = "readOnly",
    writeOnly = "writeOnly",
    readAndwrite = "readAndwrite",
    admin = "admin"
}