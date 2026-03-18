import IError from './IError'
import { IErrorHandler } from './IErrorHandler'

export class ErrorHandler implements IErrorHandler {
  createError({ message, detailedMessage, errorCode }: IError): IError {
    return {
      detailedMessage,
      errorCode,
      message,
    }
  }
}
