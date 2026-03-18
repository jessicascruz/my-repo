import { IDiscount } from '@/domain/aggregates/order'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'
import { TableCell, TableRow } from '@mui/material'
import { RequesterModal } from '../../components/RequesterModal'

export const DiscountRow = ({ data }: { data: IDiscount }) => {
  return (
    <TableRow>
      <TableCell>{data.systemId}</TableCell>

      <TableCell>{isoToLocalePtBr(data.createdAt)}</TableCell>

      <TableCell sx={{ px: 0 }}>
        <RequesterModal requester={data.requester} />
      </TableCell>

      <TableCell>{formatToBrlCurrency(data.oldAmount)}</TableCell>

      <TableCell>{formatToBrlCurrency(data.requestAmount)}</TableCell>

      <TableCell>{formatToBrlCurrency(data.oldDiscount)}</TableCell>

      <TableCell>{formatToBrlCurrency(data.requestDiscount)}</TableCell>
    </TableRow>
  )
}
