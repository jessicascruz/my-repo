import React from 'react'
import { Box, Grid2, Typography, useMediaQuery, useTheme } from '@mui/material'
import { IReceivableResponse } from '@/domain/aggregates/order'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'
import CopyableTypography from '../../../refund/components/CopyableTypography'
import { systemsOptions } from '@/domain/aggregates/options'
import formatExpirationTime from '@/domain/seedWork/utils/expirationTime'

interface InputFieldProps {
  label: string
  value: string | number
  copyable?: boolean
  isLink?: boolean
}

const LabeledInfo = ({ label, value, copyable, isLink }: InputFieldProps) => {
  return (
    <Grid2 size={{ xs: 12, sm: 6, md: 4 }}>
      <Typography fontWeight={600} sx={{ marginBottom: 1 }}>
        {label}
      </Typography>
      <CopyableTypography
        copyable={copyable}
        text={String(value || '-')}
        link={isLink}
      />
    </Grid2>
  )
}

interface Props {
  order: IReceivableResponse
}

const OrderForm = ({ order }: Props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // const steps = [
  //   'Criado',
  //   'Visualizado',
  //   'Pendente',
  //   'Autorizado',
  //   'Confirmado',
  //   'Recuperação',
  //   'Cancelado',
  //   'Negado',
  //   'Finalizado',
  // ]

  // const activeStep = steps.findIndex(
  //   value => value === StatusTypeLabels[order.status as StatusType]
  // )

  const system = systemsOptions.find(system => system.value === order.systemId)

  return (
    <Box
      sx={{
        maxHeight: isMobile ? '400px' : 'none',
        overflowY: isMobile ? 'auto' : 'visible',
        padding: isMobile ? '10px' : '0',
      }}
    >
      <Grid2
        container
        spacing={2}
        sx={{
          marginTop: 3,
          marginBottom: 2,
          paddingBottom: 3,
          borderBottom: '1px solid #E0E0E0',
        }}
      >
        {/* Temporary value until api eventually returns the expected value */}
        <LabeledInfo label="Tipo" value="Recebimento" />
        <Grid2 size={12}>
          <Grid2 container spacing={2}>
            <LabeledInfo label={'ID'} value={order.id} copyable />
            <LabeledInfo
              label={'Referência'}
              value={order.referenceId}
              copyable
            />
            <LabeledInfo
              label={'Sub Referência'}
              value={order.subReferenceId}
              copyable
            />
          </Grid2>
        </Grid2>
      </Grid2>

      <Grid2 container spacing={2}>
        <LabeledInfo
          label={'ID Solicitante'}
          value={order?.requester?.id ?? ''}
          copyable
        />
        <LabeledInfo
          label={'Nome Solicitante'}
          value={order?.requester?.name ?? ''}
        />
        <LabeledInfo
          label={'E-mail Solicitante'}
          value={order?.requester?.email ?? ''}
          copyable
        />

        <LabeledInfo label={'ID do sistema'} value={order.systemId} copyable />
        <LabeledInfo
          label={'Empresa'}
          value={`${order.company.description} (${order.company.code})`}
        />
        <LabeledInfo
          label={'Sistema de origem'}
          value={`${system?.label} (${order.systemId})`}
        />
        <LabeledInfo label={'Condição'} value={order.conditionId} />
        <LabeledInfo
          label={'Valor'}
          value={formatToBrlCurrency(order.amount)}
        />
        <LabeledInfo
          label={'Desconto'}
          value={formatToBrlCurrency(order.discount)}
        />
        <LabeledInfo
          label={'Data de expiração'}
          value={formatExpirationTime(
            Number(order.expirationTime),
            new Date(order.createdAt)
          )}
        />

        <LabeledInfo
          label={'Data de Criação'}
          value={isoToLocalePtBr(order.createdAt)}
        />
        <LabeledInfo
          label={'Data de Atualização'}
          value={isoToLocalePtBr(order.updatedAt)}
        />
        <LabeledInfo isLink label={'Link'} value={order.paymentLink} copyable />

        <LabeledInfo
          isLink
          label={'Link Administrativo'}
          value={order.adminLink}
          copyable
        />
      </Grid2>
    </Box>
  )
}

export default OrderForm
