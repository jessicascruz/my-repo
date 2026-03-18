import { IPaymentResponse } from '@/domain/aggregates/order'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'
import LinkIcon from '@mui/icons-material/Link'
import DownloadIcon from '@mui/icons-material/Download'
import { Box, IconButton, TableCell } from '@mui/material'
import mapStatusLabel from '@/domain/seedWork/utils/mapStatusLabel'
import { StatusDetailCell } from '../StatusDetailCell'

export const PixRow = ({
  data,
  handleCopy,
}: {
  data: IPaymentResponse
  handleCopy: (row: string) => void
}) => {
  const handleDownload = () => {
    if (!data.pix?.qrCode) return

    const link = document.createElement('a')
    link.href = `data:image/png;base64,${data.pix.qrCode}`
    link.download = `${data.id}-${data.createdAt}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <>
      <TableCell>{data.acquirer.ec || '-'}</TableCell>

      <TableCell>{data.acquirer.paymentId || '-'}</TableCell>

      <TableCell>{formatToBrlCurrency(data.amount) || '-'}</TableCell>

      <TableCell>{mapStatusLabel(data.status) || '-'}</TableCell>

      <TableCell>{isoToLocalePtBr(data.createdAt) || '-'}</TableCell>

      <TableCell>{isoToLocalePtBr(data.updatedAt) || '-'}</TableCell>

      <TableCell>{isoToLocalePtBr(data.pix?.expirationDate) || '-'}</TableCell>

      <TableCell>{data.acquirer.status || '-'}</TableCell>

      <StatusDetailCell statusDetail={data.acquirer.statusDetail} />

      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            data-testid="download-qrCode"
            aria-label="download-qrCode"
            onClick={handleDownload}
            sx={{ cursor: 'pointer', color: '#3D3D3D' }}
          >
            <DownloadIcon />
          </IconButton>
        </Box>
      </TableCell>

      <TableCell>
        <Box display="flex" alignItems="center">
          <IconButton
            data-testid="link-code"
            aria-label="link-code"
            onClick={() => handleCopy(data.pix?.code || '')}
            sx={{ cursor: 'pointer', color: '#3D3D3D' }}
          >
            <LinkIcon />
          </IconButton>
        </Box>
      </TableCell>

      <TableCell>{data.acquirer.nsu || '-'}</TableCell>

      <TableCell>{data.acquirer.transactionId || '-'}</TableCell>
    </>
  )
}
