import IError from './errorHandler/IError'
import { ErrorMessages, messagePicker } from './errorMessages/messagesPicker'

export const errorsConstructor = (
  error: Error | any,
  key: ErrorMessages
): IError => {
  return {
    message: messagePicker[key].message,
    detailedMessage: error?.response?.data || error.message || 'unknown error',
    errorCode: messagePicker[key].errorCode,
  }
}
