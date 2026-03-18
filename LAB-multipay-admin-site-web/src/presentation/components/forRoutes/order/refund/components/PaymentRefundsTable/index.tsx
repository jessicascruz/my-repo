import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Typography,
  Box,
  Divider,
} from '@mui/material'
import { IRefund } from '@/domain/aggregates/order'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'
import { RequesterModal } from '@/presentation/components/forRoutes/order/details/components/components/RequesterModal'
import { AcquirerModal } from '@/presentation/components/forRoutes/order/details/components/components/AcquirerModal'
import { Typography as AntdTypography } from 'antd'
interface Props {
  data?: IRefund[]
}

const headers = [
  'EC',
  'ID do Estorno',
  'Valor',
  'Criado em',
  'Atualizado em',
  'Status',
  'Solicitante',
  'Adquirente',
]

const { Text } = AntdTypography

const PaymentRefundsTable = ({ data }: Props) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
      }}
      p={6}
      m={2}
      borderRadius={2}
      border={1}
      borderColor={theme.palette.divider}
      boxShadow={1}
    >
      <Typography variant="h6">Estornos (Direto)</Typography>
      <Divider sx={{ mb: 2 }} />
      <TableContainer component="div">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {headers.map(item => (
                <TableCell key={item}>{item}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          {data && data.length > 0 ? (
            <TableBody>
              {data.map(refund => (
                <TableRow key={refund.id}>
                  <TableCell>
                    <Text>{refund.acquirer.ec}</Text>
                  </TableCell>
                  <TableCell>
                    <Text copyable>{refund.acquirer.refundId}</Text>
                  </TableCell>

                  <TableCell>
                    <Text>{formatToBrlCurrency(refund.amount)}</Text>
                  </TableCell>

                  <TableCell>
                    <Text>{isoToLocalePtBr(refund.createdAt)}</Text>
                  </TableCell>

                  <TableCell>
                    <Text>{isoToLocalePtBr(refund.updatedAt)}</Text>
                  </TableCell>

                  <TableCell>
                    <Text>{refund.acquirer.status}</Text>
                  </TableCell>

                  <TableCell>
                    <RequesterModal requester={refund.requester} />
                  </TableCell>

                  <TableCell>
                    <AcquirerModal acquirer={refund.acquirer} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={10} sx={{ textAlign: 'center' }}>
                  Nenhum estorno encontrado
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Box>
  )
}

export default PaymentRefundsTable
