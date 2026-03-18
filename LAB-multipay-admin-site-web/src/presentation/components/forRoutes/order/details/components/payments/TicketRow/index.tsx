import { IPaymentResponse } from '@/domain/aggregates/order'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'
import mapStatusLabel from '@/domain/seedWork/utils/mapStatusLabel'
import LinkIcon from '@mui/icons-material/Link'
import { Box, IconButton, TableCell } from '@mui/material'
import { StatusDetailCell } from '../StatusDetailCell'

export const TicketRow = ({
  data,
  handleCopy,
}: {
  data: IPaymentResponse
  handleCopy: (row: string) => void
}) => {
  return (
    <>
      <TableCell>{data.acquirer.ec || '-'}</TableCell>

      <TableCell>{data.acquirer.paymentId || '-'}</TableCell>

      <TableCell>{formatToBrlCurrency(data.amount) || '-'}</TableCell>

      <TableCell>{mapStatusLabel(data.status) || '-'}</TableCell>

      <TableCell>{isoToLocalePtBr(data.createdAt) || '-'}</TableCell>

      <TableCell>{isoToLocalePtBr(data.updatedAt) || '-'}</TableCell>

      <TableCell>
        {isoToLocalePtBr(data.ticket?.expirationDate) || '-'}
      </TableCell>

      <TableCell>{data.acquirer.status || '-'}</TableCell>

      <StatusDetailCell statusDetail={data.acquirer.statusDetail} />

      <TableCell>
        <Box display="flex" alignItems="center">
          <IconButton
            aria-label="link-url"
            onClick={() => handleCopy(data.ticket?.url || '')}
            sx={{ cursor: 'pointer', color: '#3D3D3D' }}
          >
            <LinkIcon />
          </IconButton>
        </Box>
      </TableCell>

      <TableCell>
        {data.ticket?.barCode ? (
          <Box display="flex" alignItems="center">
            <IconButton
              aria-label="link-code-bar"
              onClick={() => handleCopy(data.ticket?.barCode || '')}
              sx={{ cursor: 'pointer', color: '#3D3D3D' }}
            >
              <LinkIcon />
            </IconButton>
          </Box>
        ) : (
          '-'
        )}
      </TableCell>

      <TableCell>{data.acquirer.nsu || '-'}</TableCell>

      <TableCell>{data.acquirer.transactionId || '-'}</TableCell>
    </>
  )
}
