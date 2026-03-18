import {
  Alert,
  Typography,
  TableCell,
  TableRow,
  Box,
  Snackbar,
} from '@mui/material'
import React, { useCallback, useMemo, useState } from 'react'
import {
  AcquirerEnum,
  IPaymentResponse,
  IRefund,
  MethodEnum,
  PaymentStatusEnum,
} from '@/domain/aggregates/order'
import { CreditCardRow } from './CreditCardRow'
import { TicketRow } from './TicketRow'
import { PixRow } from './PixRow'
import { RefundButton } from './RefundButton'
import { CancelPayment } from './CancelPayment'
import { CollapsableListContainer } from '../components/CollapsableListContainer'
import { CollapsableListAccordion } from '../components/CollapsableListAccordion'
import { CollapsableListTable } from '../components/CollapsableListTable'
import { useCollapsableList } from '@/presentation/hooks/useCollapsableList'
import { useRoles } from '@/presentation/hooks/useRoles'
import { ConfirmPayment } from './ConfirmPayment'
import { useCanRefund } from '@/presentation/hooks/useCanRefund'

const headers = {
  CREDIT_CARD: [
    'Ações',
    'EC',
    'Código de Autorização',
    'ID Pagamento',
    'Valor',
    'Status',
    'Criado em',
    'Atualizado em',
    'Status Adquirente',
    'Status Adquirente Detalhes',
    'NSU',
    'ID Transação',
  ],
  TICKET: [
    'Ações',
    'EC',
    'ID Pagamento',
    'Valor',
    'Status',
    'Criado em',
    'Atualizado em',
    'Expira em',
    'Status Adquirente',
    'Status Adquirente Detalhes',
    'URL',
    'Código de Barras',
    'NSU',
    'ID Transação',
  ],
  PIX: [
    'Ações',
    'EC',
    'ID Pagamento',
    'Valor',
    'Status',
    'Criado em',
    'Atualizado em',
    'Expira em',
    'Status Adquirente',
    'Status Adquirente Detalhes',
    'QR Code',
    'Código Pix',
    'NSU',
    'ID Transação',
  ],
}

interface Props {
  company: number
  data: IPaymentResponse[]
  reference: string
  system: number
  refunds: IRefund[]
}

const Payments = ({ company, data, reference, system, refunds }: Props) => {
  const hasData = data.length > 0
  const { hasRoles } = useRoles()
  const { canRefundPayment } = useCanRefund()
  const { dataByAcquirerType, getAccordionState, handleToggleAccordion } =
    useCollapsableList(data)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      setSnackbarMessage('Link copiado!')
      setSnackbarOpen(true)
    })
  }

  const renderTable = useCallback(
    (method: MethodEnum, data: IPaymentResponse[]) => {
      const checkIfHasSomePendingPayment = (data: IPaymentResponse) => {
        const authorizedAt = data.authorizedAt
        const status = data.acquirer.status
        if (!authorizedAt) return false

        const authorizedDate = new Date(authorizedAt + 'Z').getTime() // número (timestamp)
        const now = new Date().getTime() // número (timestamp)

        const diffInMs = now - authorizedDate
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24) + 1

        return (
          diffInDays >= 0 &&
          diffInDays <= 7 &&
          status === PaymentStatusEnum.AUTHORIZED &&
          hasRoles(['multipay:payment-card-capture', 'multipay:admin'])
        )
      }

      return (
        <CollapsableListTable headers={headers[method]}>
          {data.map(value => {
            const showConfirmButton = checkIfHasSomePendingPayment(value)

            const isGetNet = value.acquirer.id === AcquirerEnum.GETNET
            const isSantander = value.acquirer.id === AcquirerEnum.SANTANDER
            const showRefundButton = canRefundPayment({
              acquirerId: value.acquirer.id,
              paymentApprovedAt: value.approvedAt,
              paymentStatus: value.status,
              refundedAmount: refunds
                .filter(
                  refund =>
                    refund.acquirer.paymentId === value.acquirer.paymentId
                )
                .reduce((total, refund) => {
                  return total + refund.amount
                }, 0),
              amount: value.amount,
            })

            const allowedCancelStatus =
              value.status === PaymentStatusEnum.PENDING
            const allowedCancelRoles = hasRoles([
              'multipay:payment-cancel',
              'multipay:admin',
            ])
            const showCancelButton = isGetNet
              ? false
              : allowedCancelStatus && allowedCancelRoles

            return (
              <TableRow key={value.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    {showConfirmButton && !isSantander && (
                      <ConfirmPayment
                        system={system}
                        company={company}
                        payment={value}
                        reference={reference}
                      />
                    )}
                    {showRefundButton && !isSantander && (
                      <RefundButton paymentId={value.id} />
                    )}
                    {showCancelButton && !isSantander && (
                      <CancelPayment
                        system={system}
                        company={company}
                        payment={value}
                        reference={reference}
                      />
                    )}
                  </Box>
                </TableCell>
                {method === MethodEnum.CREDIT_CARD && (
                  <CreditCardRow data={value} />
                )}
                {method === MethodEnum.TICKET && (
                  <TicketRow handleCopy={handleCopy} data={value} />
                )}
                {method === MethodEnum.PIX && (
                  <PixRow handleCopy={handleCopy} data={value} />
                )}
              </TableRow>
            )
          })}
        </CollapsableListTable>
      )
    },
    [hasRoles, canRefundPayment]
  )

  const mappedAccordionData = useMemo(
    () =>
      dataByAcquirerType.map(({ title, data, acquirer, imagePath }) => {
        const groupedData = (data as IPaymentResponse[]).reduce(
          (acc, item) => {
            if (!acc[item.method]) {
              acc[item.method] = []
            }
            acc[item.method].push(item)
            return acc
          },
          {} as Record<MethodEnum, IPaymentResponse[]>
        )
        return (
          <CollapsableListAccordion
            key={title}
            title={title}
            dataLength={data?.length}
            expanded={getAccordionState(acquirer)}
            imagePath={imagePath}
            onChange={handleToggleAccordion(acquirer)}
          >
            {Object.entries(groupedData).map(([method, items]) => (
              <div key={method}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    color: '#333',
                  }}
                >
                  {method === MethodEnum.CREDIT_CARD && 'Cartão de Crédito'}
                  {method === MethodEnum.TICKET && 'Boleto'}
                  {method === MethodEnum.PIX && 'PIX'}
                </Typography>
                {renderTable(method as MethodEnum, items)}
              </div>
            ))}
          </CollapsableListAccordion>
        )
      }),
    [dataByAcquirerType, getAccordionState, handleToggleAccordion, renderTable]
  )

  return (
    hasData && (
      <>
        <CollapsableListContainer title="Pagamentos">
          {mappedAccordionData}
        </CollapsableListContainer>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            severity="success"
            sx={{
              background: '#FFFFFF',
              border: '1px solid #E7E7E7',
              borderBottom: '5px solid #14C850',
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </>
    )
  )
}

export default Payments
