import { IRefund } from '@/domain/aggregates/order'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'
import { TableCell, TableRow } from '@mui/material'
import { RequesterModal } from '../../components/RequesterModal'

export const RefundRow = ({ data }: { data: IRefund }) => {
  return (
    <TableRow>
      <TableCell>{data.acquirer.ec}</TableCell>
      <TableCell>{data.acquirer.paymentId}</TableCell>

      <TableCell>{data.acquirer.refundId}</TableCell>

      <TableCell>{formatToBrlCurrency(data.amount)}</TableCell>

      <TableCell>{isoToLocalePtBr(data.createdAt)}</TableCell>

      <TableCell>{isoToLocalePtBr(data.updatedAt)}</TableCell>

      <TableCell sx={{ px: 0 }}>
        <RequesterModal requester={data.requester} />
      </TableCell>

      <TableCell>{data.acquirer.status}</TableCell>

    </TableRow>
  )
}
