import { EventEmitter } from "node:stream"
import { IReceiverEmitterArgs } from "../types/ioTypes"

export class ReceiverEmitter {
    
    private emitter = new EventEmitter()

    public on( a_Key: string, a_Listener: (...args: IReceiverEmitterArgs) => void ){
        this.emitter.on( a_Key, a_Listener )
    }

    public emit( a_Key: string, a_Args: IReceiverEmitterArgs  ) {
        this.emitter.emit( a_Key, a_Args )
    }


}

export class Observer<T> {
    onMessage: (a_Message: T) => any
    constructor (onmessage: (a_Message:T) => any ){
        this.onMessage = onmessage
    }
}

export class Subject<T> {

    // Set of observers for regular messages
    private subscriptionList = new Set<Observer<T>>()

    // Set of observers for error messages
    private subscriptionErrorList = new Set<Observer<T>>()

    // Add an observer for regular messages
    public subscribe (a_Observer: Observer<T>) {
        this.subscriptionList.add(a_Observer)
    }

    // Remove an observer from regular messages
    public unsubscribe (a_Observer: Observer<T>) {
        this.subscriptionList.delete(a_Observer)
    }

    // Notify all regular observers with a message
    public dispatch (a_Message: any) {
        this.subscriptionList.forEach( (observer) => {
            observer.onMessage(a_Message)
        })
    }

    // Add an observer for error messages
    public subscribeError (a_Observer: Observer<T>) {
        this.subscriptionErrorList.add(a_Observer)
    }

    // Remove an observer from error messages
    public unsubscribeError (a_Observer: Observer<T>) {
        this.subscriptionErrorList.delete(a_Observer)
    }

    // Notify all error observers with a message
    public dispatchError (a_Message: any) {
        this.subscriptionErrorList.forEach( (observer) => {
            observer.onMessage(a_Message)
        })
    }
}

export const getEnvVariable = (a_Key: string): string | undefined => {
    return process.env[a_Key.toUpperCase()] 
}

export const isDevelopment = () => {
    return getEnvVariable("NODE_ENV") === "development"
}