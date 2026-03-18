import { Filter } from '@/domain/aggregates/filter/filter'
import { IReceivableResponse, IRequester } from '@/domain/aggregates/order'
import IHttpClient from '@/domain/seedWork/http/IHttpClient'
import ISearch from '@/domain/seedWork/paging/ISearch'
import { AxiosHttpClient } from '../internal/AxiosHttpClient'
import { IErrorHandler } from '@/domain/seedWork/errors/errorHandler/IErrorHandler'
import { ErrorHandler } from '@/domain/seedWork/errors/errorHandler/Error'
import { errorsConstructor } from '@/domain/seedWork/errors/errorsConstructor'

export interface IRefundOrderPaymentParams {
  paymentId: string
  orderId: string
  internalPaymentId: string
  acquirerId: number
  companyId: number
  systemId: number
  amount: number
  reference: string
}

export interface ICancelOrderParams {
  orderId: string
  referenceId: string
  subReferenceId: string
  requester: IRequester
}


export class OrderRepository {
  private readonly httpClient: IHttpClient
  private readonly errorHandler: IErrorHandler

  constructor(
    httpClient: IHttpClient = new AxiosHttpClient(),
    errorHandler: IErrorHandler = new ErrorHandler()
  ) {
    this.httpClient = httpClient
    this.errorHandler = errorHandler
  }

  getOrdersByFilter = async (
    filter: Filter
  ): Promise<ISearch<IReceivableResponse>> => {
    if (Object.keys(filter).length > 0) {
      try {
        const data = await this.httpClient.get<ISearch<IReceivableResponse>>(
          `/v1/order/receivable/single?${filter?.toQueryString()}`
        )

        return data
      } catch (error: unknown) {
        console.error(
          this.errorHandler.createError({
            ...errorsConstructor(error, 'getOrdersByFilterError'),
            detailedMessage:
              errorsConstructor(error, 'getOrdersByFilterError')
                .detailedMessage +
              `\n\nFailed to fetch orders for filter ${JSON.stringify(filter)}:`,
          })
        )
        return {
          data: [],
          paging: { currentPage: 1, pages: 1, perPage: 10, total: 1 },
        }
      }
    } else {
      return {
        data: [],
        paging: { currentPage: 1, pages: 1, perPage: 10, total: 1 },
      }
    }
  }

  getOrderDetails = async (
    orderId: string,
    retrieveRefunds: boolean = false
  ): Promise<ISearch<IReceivableResponse>> => {
    const searchParams = new URLSearchParams()
    searchParams.set('orderId', orderId)
    searchParams.set('retrieveRefunds', '1')
    searchParams.set('retrieveDiscounts', '1')
    searchParams.set('retrievePayments', '1')
    try {
      const data = await this.httpClient.get<ISearch<IReceivableResponse>>(
        `/v1/order/receivable/single?${searchParams.toString()}`
      )

      return data
    } catch (error: unknown) {
      this.errorHandler.createError(
        errorsConstructor(error, 'getOrderDetailsError')
      )
      throw error
    }
  }

  refundOrderPayment = async (
    payload: IRefundOrderPaymentParams
  ): Promise<void> => {
    const { paymentId, ...rest } = payload
    try {
      await this.httpClient.post(`/v1/payment/${paymentId}/refund`, rest)
    } catch (error: unknown) {
      this.errorHandler.createError(
        errorsConstructor(error, 'refundOrderPaymentError')
      )
      throw error
    }
  }

  cancelOrder = async (params: ICancelOrderParams): Promise<void> => {
    const { orderId, referenceId, subReferenceId, requester } = params

    const body = {  
      event: 'MULTIPAY-CANCELED',
      subEvent: 'MULTIPAY-CANCELED',
      reference: `${referenceId}-${subReferenceId}`,
      requester: {
        id: requester.id,
        name: requester.name,
        email: requester.email
      }
    }

    try {
      await this.httpClient.patch(`/v1/order/status/${orderId}`, body)
    } catch (error: unknown) {
      this.errorHandler.createError(
        errorsConstructor(error, 'cancelOrderError')
      )
      throw error
    }
  }
}
