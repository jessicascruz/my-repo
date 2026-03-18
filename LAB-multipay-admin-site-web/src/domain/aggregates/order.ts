export enum MethodEnum {
  CREDIT_CARD = 'CREDIT_CARD',
  TICKET = 'TICKET',
  PIX = 'PIX',
}

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
  DENIED = 'DENIED',
  CHARGED_BACK = 'CHARGED_BACK',
  REJECTED = 'REJECTED',
  ERROR = 'ERROR',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum TranslateStatusEnum {
  PENDING = 'Pendente',
  AUTHORIZED = 'Autorizado',
  CONFIRMED = 'Confirmado',
  CANCELED = 'Cancelado',
  DENIED = 'Negado',
  CHARGED_BACK = 'Estornado',
  REJECTED = 'Rejeitado',
  ERROR = 'Erro',
  REFUNDED = 'Reembolsado',
  PARTIALLY_REFUNDED = 'Reembolsado Parcialmente',
}

export enum AcquirerEnum {
  GETNET = 1,
  MERCADO_PAGO,
  SANTANDER,
}

export enum CompanyEnum {
  MULTI = 1,
  GIGA = 2,
  GIGAWATTS = 3,
}

export enum ManualPaymentStatusEnum {
  PENDING_APPROVAL = 'PENDENTE',
  APPROVED = 'APROVADO',
  REJECTED = 'REJEITADO',
}

export const companyDict: Record<string, CompanyEnum> = {
  MULTI: CompanyEnum.MULTI,
  GIGA: CompanyEnum.GIGA,
  GIGAWATS: CompanyEnum.GIGAWATTS,
}

export interface IAddressResponse {
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
}

export interface IBusinessPartnerResponse {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  documentType: string
  documentNumber: string
  phoneNumber: string
  billingPhoneNumber?: string
  billingEmail?: string
  address: IAddressResponse
}

export interface IItemResponse {
  id: string
  name: string
  image: string
  quantity: number
  unitPrice: number
}

export interface IPaymentResponse {
  id: string
  method: MethodEnum
  amount: number
  status: PaymentStatusEnum
  createdAt: string // ISO string for DateTime
  updatedAt: string
  authorizedAt: string
  approvedAt: string
  pix?: IPix
  ticket?: ITicket
  acquirer: IAcquirer
  internalPaymentId: string
  companyId: number
}

export interface IPix {
  qrCode: string
  code: string
  expirationDate: string
}

export interface ITicket {
  url: string
  expirationDate: string
  barCode: string
}

export interface IAcquirer {
  id: number
  ec: string
  description: string
  paymentId: string
  status: string
  statusDetail: string
  nsu: string
  transactionId: string
  internalPaymentId: string
  authorizationCode: string
}

export interface IRefundAcquirer extends Pick<
  IAcquirer,
  'id' | 'description' | 'paymentId' | 'status' | 'statusDetail' | 'ec'
> {
  refundId: string
}

export interface IRequester {
  id: string
  name: string
  email: string
}

export interface IRefund {
  id: string
  amount: number
  createdAt: string
  updatedAt: string
  requester: IRequester
  acquirer: IRefundAcquirer
}

export interface IManualPayment {
  id: string
  amount: number
  orderId: string
  reason: string
  approvedAt: string
  attachments: string[]
  receipts: IReceipt[]
  createdAt: string
  updatedAt: string
  status: ManualPaymentStatus
  approvals: IApproval[]
  requester: IRequester
  acquirer: IAcquirer
}

export interface ManualPaymentStatus {
  id: number
  description: string
}

export interface IApproval {
  id: string
  manualPaymentId: string
  isApproved: boolean
  rejectionReason?: string
  requesterId: string
  requester: IRequester
  createdAt: string
}

export interface IReceipt {
  id: string
  manualPaymentId: string
  documentName: string
}

export interface IDiscount {
  id: string
  systemId: number
  requestAmount: number
  requestDiscount: number
  oldAmount: number
  oldDiscount: number
  createdAt: string
  requester: IRequester
}

export interface IReceivableResponse {
  id: string
  referenceId: string
  subReferenceId: string
  conditionId: string
  systemId: number
  adminLink: string
  businessPartner: IBusinessPartnerResponse
  status: string
  company: {
    id: number
    description: string
    code: string
  }
  amount: number
  discount: number
  expirationTime: number
  callbackUrl: string
  paymentLink: string
  updatedAt: string
  createdAt: string
  paymentMethods: string[]
  items: IItemResponse[]
  payments: IPaymentResponse[]
  discounts: IDiscount[]
  refunds: IRefund[]
  manualPayments?: IManualPayment[]
  requester: IRequester
}
