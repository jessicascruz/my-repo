import { signoutHandshakeError } from './signoutHandshakeError'
import {
  refreshAccessTokenCatchError,
  refreshAccessTokenNotOkError,
} from './refreshTokenError'
import {
  errorOnGet,
  errorOnDelete,
  errorOnPatch,
  errorOnPost,
  errorOnPut,
} from './axiosHttpClientError'
import {
  getOrdersByFilterError,
  getOrderDetailsError,
  refundOrderPaymentError,
  cancelOrderError
} from './orderRepositoryErrors'
import {
  cancelPaymentError,
  confirmPaymentError,
} from './paymentRepositoryErrors'
import {
  approvalManualPaymentError,
  createManualPaymentError,
  getManualPaymentByOrderIdError
} from './manualPaymentRepositoryErrors'

export type ErrorMessages =
  | 'signoutHandshakeError'
  | 'refreshAccessTokenNotOkError'
  | 'refreshAccessTokenCatchError'
  | 'errorOnGet'
  | 'errorOnDelete'
  | 'errorOnPost'
  | 'errorOnPatch'
  | 'errorOnPut'
  | 'getOrdersByFilterError'
  | 'getOrderDetailsError'
  | 'refundOrderPaymentError'
  | 'cancelPaymentError'
  | 'confirmPaymentError'
  | 'cancelOrderError'
  | 'createManualPaymentError'
  | 'approvalManualPaymentError'
  | 'getManualPaymentByOrderIdError'
  
const messagePicker: Record<
  ErrorMessages,
  { message: string; errorCode: string }
> = {
  signoutHandshakeError,
  refreshAccessTokenNotOkError,
  refreshAccessTokenCatchError,
  errorOnGet,
  errorOnDelete,
  errorOnPost,
  errorOnPatch,
  errorOnPut,
  getOrdersByFilterError,
  getOrderDetailsError,
  refundOrderPaymentError,
  cancelPaymentError,
  confirmPaymentError,
  cancelOrderError,
  createManualPaymentError,
  approvalManualPaymentError,
  getManualPaymentByOrderIdError
}

export { messagePicker }
