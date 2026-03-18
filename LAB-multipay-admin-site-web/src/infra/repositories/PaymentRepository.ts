import IHttpClient from '@/domain/seedWork/http/IHttpClient'
import { AxiosHttpClient } from '../internal/AxiosHttpClient'
import {
  ICancelPaymentParams,
  IConfirmPaymentParams,
} from '@/domain/aggregates/payment'
import { IErrorHandler } from '@/domain/seedWork/errors/errorHandler/IErrorHandler'
import { ErrorHandler } from '@/domain/seedWork/errors/errorHandler/Error'
import { errorsConstructor } from '@/domain/seedWork/errors/errorsConstructor'

export class PaymentRepository {
  private readonly httpClient: IHttpClient
  private readonly errorHandler: IErrorHandler

  constructor(
    httpClient: IHttpClient = new AxiosHttpClient(),
    errorHandler: IErrorHandler = new ErrorHandler()
  ) {
    this.httpClient = httpClient
    this.errorHandler = errorHandler
  }

  cancelPayment = async ({ paymentId, body }: ICancelPaymentParams) => {
    try {
      const data = await this.httpClient.post<void>(
        `/v1/payment/${paymentId}/cancel`,
        body
      )

      return data
    } catch (error: unknown) {
      this.errorHandler.createError(
        {
          ...errorsConstructor(error, 'cancelPaymentError'),
          detailedMessage:
            errorsConstructor(error, 'cancelPaymentError').detailedMessage +
            `\n\nCancelling payment paymentId: ${paymentId}:`,
        }
      )
      throw error
    }
  }

  confirmPayment = async ({
    paymentId,
    body,
  }: IConfirmPaymentParams): Promise<void> => {
    try {
      const response = await this.httpClient.post<void>(
        `/v1/payment/card/${paymentId}/capture`,
        body
      )
      return response
    } catch (error: unknown) {
      this.errorHandler.createError(
        {
          ...errorsConstructor(error, 'confirmPaymentError'),
          detailedMessage:
            errorsConstructor(error, 'confirmPaymentError').detailedMessage +
            `\n\nConfirming payment paymentId: ${paymentId}:`,
        }
      )
      throw error
    }
  }
}
