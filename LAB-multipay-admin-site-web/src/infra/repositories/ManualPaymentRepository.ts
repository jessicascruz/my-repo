import { IManualPayment, IRequester } from '@/domain/aggregates/order'
import IHttpClient from '@/domain/seedWork/http/IHttpClient'
import { AxiosHttpClient } from '../internal/AxiosHttpClient'
import { ErrorHandler } from '@/domain/seedWork/errors/errorHandler/Error'
import { errorsConstructor } from '@/domain/seedWork/errors/errorsConstructor'
import { IErrorHandler } from '@/domain/seedWork/errors/errorHandler/IErrorHandler'
import { toast } from 'react-toastify'


export interface ICreateManualPaymentParams {
    orderId: string
    amount: number
    reason: string
    files: File[]
    requester: IRequester
    reference: string
    subReference: string
}

export interface IGetManualPaymentParams {
    orderId: string
    reference: string
    subReference: string
}

export interface IApprovalManualPaymentParams {
    manualPaymentId: string
    orderId: string
    isApproved: boolean
    requesterId: string
    rejectionReason?: string
    requester?: IRequester
}

export class ManualPaymentRepository {
    private readonly httpClient: IHttpClient
    private readonly errorHandler: IErrorHandler

    constructor(
        httpClient: IHttpClient = new AxiosHttpClient(),
        errorHandler: IErrorHandler = new ErrorHandler()
    ) {
        this.httpClient = httpClient
        this.errorHandler = errorHandler
    }


    createManualPayment = async (
        params: ICreateManualPaymentParams
    ): Promise<void> => {
        const { files, orderId, amount, reason, requester, reference, subReference } = params
        const formData = new FormData()

        const payload = {
            orderId,
            amount,
            reason,
            requester: {
                id: requester.id,
                name: requester.name,
                email: requester.email
            },
            reference,
            subReference
        }

        const payloadString = JSON.stringify(payload);
        formData.append('manualPaymentRequestPayload', payloadString);

        files.forEach((file) => {
            formData.append('files', file);
        });

        try {
            await this.httpClient.post('/v1/manual-payment', formData)
            toast.success(`Pagamento manual criado com sucesso.`)
        } catch (error: unknown) {
            this.errorHandler.createError(
                errorsConstructor(error, 'createManualPaymentError')
            )
            toast.error(`Ocorreu um erro ao criar o pagamento manual, por favor tente novamente.`)
            throw error
        }
    }

    getManualPaymentByOrderId = async (
        params: IGetManualPaymentParams
    ): Promise<IManualPayment[]> => {
        const { orderId, reference, subReference } = params

        const url = `/v1/manual-payment/${orderId}?reference=${reference}&subReference=${subReference}`

        try {
            const data = await this.httpClient.patch<IManualPayment[]>(url, {})
            return data
        } catch (error: unknown) {
            this.errorHandler.createError(
                errorsConstructor(error, 'getManualPaymentByOrderIdError')
            )
            throw error
        }
    }

    approvalManualPayment = async (
        params: IApprovalManualPaymentParams
    ): Promise<void> => {
        const { manualPaymentId, isApproved, requesterId, rejectionReason } = params

        const approvalRequestPayload = {
            manualPaymentId,
            isApproved,
            requesterId,
            rejectionReason
        }

        try {
            await this.httpClient.post(
                `/v1/manual-payment/approval/${manualPaymentId}`, approvalRequestPayload)
            toast.success(`Pagamento manual ${isApproved ? 'aprovado' : 'rejeitado'} com sucesso.`)
        } catch (error: unknown) {
            this.errorHandler.createError(
                errorsConstructor(error, 'approvalManualPaymentError')
            )
            toast.error(`Ocorreu um erro ao realizar a ação no pagamento manual, por favor tente novamente.`)
            throw error
        }
    }
}
