import IError from './IError'

export interface IErrorHandler {
  createError(error: IError): IError
}
