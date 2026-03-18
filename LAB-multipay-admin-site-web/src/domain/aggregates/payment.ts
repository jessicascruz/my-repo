export interface ICancelPaymentRequest {
  orderId: string
  internalPaymentId: string
  acquirerId: number
  companyId: number
  systemId: number
  reference: string
}

export interface ICancelPaymentParams {
  paymentId: string
  body: ICancelPaymentRequest
}

export interface IConfirmPaymentRequest {
  acquirerId: number
  companyId: number
  systemId: number
  amount: number
  orderId: string
  reference: string
}

export interface IConfirmPaymentParams {
  paymentId: string
  body: IConfirmPaymentRequest
}
