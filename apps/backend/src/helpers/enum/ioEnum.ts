export enum EMethodId {
    create= 1,
    read= 2,
    update= 3,
    delete= 4,
    command= 5
}

// Every member of EClassId must have a Schema used in IMessage Body
export enum EClassId {
    // Generall
    Session= 100,
}

export enum EMessageStatus {
    pending = "pending",
    success = "success",
    failed = "failed"
}

export enum EMessageBodyKey {
    filter = "filter",
    update = "update",
    error = "error",
}