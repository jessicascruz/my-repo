import {
  IPaymentResponse,
  IReceivableResponse,
  PaymentStatusEnum,
} from '@/domain/aggregates/order'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import mapStatusLabel from '@/domain/seedWork/utils/mapStatusLabel'
import {
  Box,
  Button,
  Divider,
  Grid2,
  Typography,
  useTheme,
} from '@mui/material'
import { useCallback, useState } from 'react'
import ModalContainer from '@/presentation/components/forRoutes/home/components/modal/ModalContainer'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'
import { maskCpfCnpj } from '@/domain/seedWork/utils/maskCpfCnpj'
import CopyableTypography from '../CopyableTypography'
import { MonetaryInput } from '../MonetaryInput'
import { removeCharacters } from '@/domain/seedWork/utils/removeCharacters'
import { toast } from 'react-toastify'
import { useRefundPayment } from '@/presentation/hooks/useRefundPayment'
import moment from 'moment'
import { useRouter, useSearchParams } from 'next/navigation'

interface PaymentsContainerProps {
  order: IReceivableResponse
  paymentData?: IPaymentResponse
  paymentId: string
  totalAuthorizedRefunds: number
  canRefund?: boolean
}

export const PaymentsComponent = ({
  order,
  paymentData,
  paymentId,
  totalAuthorizedRefunds,
  canRefund,
}: PaymentsContainerProps) => {
  const { mutateAsync: refundPayment } = useRefundPayment()
  const router = useRouter()
  const searchParams = useSearchParams()
  const theme = useTheme()
  const [refundAmount, setRefundAmount] = useState('R$ 0,00')
  const [open, setOpen] = useState(false)
  const size = { xs: 12, md: 6, lg: 4, xl: 4 }

  const maxRefundValue = (paymentData?.amount ?? 0) - totalAuthorizedRefunds
  const disableForm = maxRefundValue <= 0 || !canRefund

  const validateAmount = useCallback(() => {
    if (isToday) return true
    if (
      paymentData?.amount &&
      Number(removeCharacters(refundAmount)) / 100 > paymentData?.amount
    ) {
      toast.error(
        `O valor limite para estorno é de ${formatToBrlCurrency(paymentData?.amount ?? 0)}`
      )
      return false
    }
    if (Number(removeCharacters(refundAmount)) / 100 === 0) {
      toast.error(`O valor a ser estornado deve ser maior que R$ 0,00`)
      return false
    }
    return true
  }, [refundAmount, paymentData])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  const handleOpen = useCallback(() => {
    if (!validateAmount()) return
    setOpen(true)
  }, [setOpen, validateAmount])

  const handleRefundAmountChange = useCallback(
    (value: string) => {
      setRefundAmount(value)
    },
    [setRefundAmount]
  )

  const isToday =
    moment(paymentData?.authorizedAt)
      .startOf('day')
      .isSame(moment().startOf('day')) && paymentData?.acquirer.id === 1

  const handleConfirm = useCallback(async () => {
    await refundPayment({
      reference: `${order.referenceId}-${order.subReferenceId}`,
      paymentId: paymentData?.acquirer.paymentId ?? '',
      orderId: order.id,
      internalPaymentId: paymentData?.acquirer.internalPaymentId ?? '',
      acquirerId: paymentData?.acquirer?.id ?? 0,
      companyId: order.company.id,
      amount: isToday
        ? (paymentData?.amount ?? 0)
        : Number(removeCharacters(refundAmount)) / 100,
      systemId: order.systemId,
    })

    handleClose()
  }, [
    handleClose,
    refundAmount,
    paymentId,
    paymentData,
    isToday,
    router,
    searchParams,
  ])

  const styles = {
    box: {
      backgroundColor: theme.palette.background.paper,
      p: 6,
      m: 2,
      borderRadius: 2,
      border: 1,
      borderColor: theme.palette.divider,
      boxShadow: 1,
    },
  }

  return (
    <>
      <Box sx={styles.box}>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12 }}>
            <Typography variant="h6">Ordem</Typography>
            <Divider />
          </Grid2>
          <Grid2 size={size}>
            <Typography variant="body1">Id da ordem</Typography>
            <CopyableTypography copyable text={order?.id} />
          </Grid2>

          <Grid2 size={size}>
            <Typography variant="body1">Referencia</Typography>
            <CopyableTypography copyable text={order?.referenceId} />
          </Grid2>

          <Grid2 size={size}>
            <Typography variant="body1">Sub Referencia</Typography>
            <CopyableTypography copyable text={order?.subReferenceId} />
          </Grid2>

          <Grid2 size={size}>
            <Typography variant="body1">Nome do cliente</Typography>
            <CopyableTypography text={order?.businessPartner?.name} />
          </Grid2>

          <Grid2 size={size}>
            <Typography variant="body1">CPF/CNPJ do cliente</Typography>
            <CopyableTypography
              text={maskCpfCnpj(order?.businessPartner?.documentNumber)}
            />
          </Grid2>

          <Grid2 size={{ xs: 12 }}>
            <Typography variant="h6">Pagamento</Typography>
            <Divider />
          </Grid2>

          <Grid2 size={size}>
            <Typography variant="body1">Status</Typography>
            <CopyableTypography
              text={mapStatusLabel(
                paymentData?.status ?? PaymentStatusEnum.PENDING
              )}
            />
          </Grid2>

          <Grid2 size={size}>
            <Typography variant="body1">Valor</Typography>
            <CopyableTypography
              text={String(formatToBrlCurrency(paymentData?.amount ?? 0))}
            />
          </Grid2>

          <Grid2 size={size}>
            <Typography variant="body1">ID Pagamento do Adquirente</Typography>
            <CopyableTypography
              copyable
              text={paymentData?.acquirer?.paymentId ?? ''}
            />
          </Grid2>

          <Grid2 size={size}>
            <Typography variant="body1">Data de criação</Typography>
            <CopyableTypography
              text={isoToLocalePtBr(paymentData?.createdAt)}
            />
          </Grid2>

          {paymentData?.authorizedAt && (
            <Grid2 size={size}>
              <Typography variant="body1">Data de autorização</Typography>
              <CopyableTypography
                text={isoToLocalePtBr(paymentData?.authorizedAt)}
              />
            </Grid2>
          )}

          {paymentData?.approvedAt && (
            <Grid2 size={size}>
              <Typography variant="body1">Data de aprovação</Typography>
              <CopyableTypography
                text={isoToLocalePtBr(paymentData?.approvedAt)}
              />
            </Grid2>
          )}

          <Grid2 size={size}>
            <Typography variant="body1">
              Status do pagamento Adquirente
            </Typography>
            <CopyableTypography text={paymentData?.acquirer?.status} />
          </Grid2>

          <Grid2 size={size}>
            <Typography variant="body1">
              Detalhes do Status do Pagamento Adquirente
            </Typography>
            <CopyableTypography text={paymentData?.acquirer?.statusDetail} />
          </Grid2>
        </Grid2>
        <ModalContainer
          open={open}
          handleClose={handleClose}
          title={'Estornar pagamento'}
          maxWidth="20%"
          minWidth={300}
        >
          <Box display="flex" flexDirection="column" style={{ width: '100%' }}>
            {isToday ? (
              <Typography variant="body1">
                Compra realizada na data de hoje, só é possível estornar o valor
                total. <br />
                <strong>Deseja continuar?</strong>
              </Typography>
            ) : (
              <Typography variant="body1">
                Você tem certeza que deseja estornar o valor de{' '}
                <strong>{refundAmount}</strong> do pagamento?
              </Typography>
            )}
            <Box
              display="flex"
              gap={2}
              justifyContent="center"
              style={{ width: '100%' }}
              mt={2}
            >
              <Button variant="outlined" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={handleConfirm}>
                Confirmar
              </Button>
            </Box>
          </Box>
        </ModalContainer>
      </Box>
      <Box sx={styles.box}>
        <Grid2 size={{ xs: 12 }}>
          <Typography variant="h6">Estorno Direto</Typography>
          <Divider />
        </Grid2>
        <Grid2 size={{ xs: 12 }} mt={2} display="flex" gap={2}>
          {!isToday && (
            <MonetaryInput
              label="Valor a ser estornado"
              value={refundAmount}
              onChange={handleRefundAmountChange}
              maxValue={maxRefundValue}
              disabled={disableForm}
            />
          )}
          <Button
            variant="contained"
            onClick={handleOpen}
            style={{ maxHeight: 53 }}
            disabled={disableForm}
          >
            Estornar
          </Button>
        </Grid2>
      </Box>
    </>
  )
}
