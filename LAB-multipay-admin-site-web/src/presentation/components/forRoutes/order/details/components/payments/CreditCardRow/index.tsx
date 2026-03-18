import { IPaymentResponse } from '@/domain/aggregates/order'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import { TableCell } from '@mui/material'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'
import mapStatusLabel from '@/domain/seedWork/utils/mapStatusLabel'
import { StatusDetailCell } from '../StatusDetailCell'

export const CreditCardRow = ({ data }: { data: IPaymentResponse }) => {
  return (
    <>
      <TableCell>{data.acquirer.ec || '-'}</TableCell>
      <TableCell>{data.acquirer.authorizationCode || '-'}</TableCell>
      <TableCell>{data.acquirer.paymentId || '-'}</TableCell>

      <TableCell>{formatToBrlCurrency(data.amount) || '-'}</TableCell>

      <TableCell>{mapStatusLabel(data.status) || '-'}</TableCell>

      <TableCell>{isoToLocalePtBr(data.createdAt) || '-'}</TableCell>

      <TableCell>{isoToLocalePtBr(data.updatedAt) || '-'}</TableCell>

      <TableCell>{data.acquirer.status || '-'}</TableCell>

      <StatusDetailCell statusDetail={data.acquirer.statusDetail} />

      <TableCell>{data.acquirer.nsu || '-'}</TableCell>

      <TableCell>{data.acquirer.transactionId || '-'}</TableCell>
    </>
  )
}
