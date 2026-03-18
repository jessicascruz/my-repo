'use client'

import React from 'react'
import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { IReceivableResponse } from '@/domain/aggregates/order'
import StatusBadge from '../../home/components/status/Status'
import { StatusType } from '@/domain/aggregates/status'
import { useSearchParams, useRouter } from 'next/navigation'
import { Typography as AntTypography } from 'antd'

interface Props {
  order: IReceivableResponse
  paymentId?: string
  flow?: 'order' | 'refund'
}

const { Text } = AntTypography

const Info = ({ order, paymentId, flow = 'order' }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const iconButtonStyles = {
    background: '#0050D7',
    borderRadius: '50%',
    width: 40,
    height: 40,
    '&:hover': { background: '#003C9D' },
  }

  const selectBackUrl = () => { // If there is a new flow, we need add a new case here
    const backUrls = {
      order: `/home?${searchParams}`,
      refund: `/order/${order?.id}/details?${searchParams}`
    }
    return backUrls[flow]
  }

  const backUrl = selectBackUrl()

  return (
    <AppBar
      position="static"
      sx={{
        width: '100%',
        background: '#F6F6F6',
        boxShadow: 'none',
        py: 2,
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          px: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <IconButton
                edge="start"
                sx={iconButtonStyles}
                aria-label="Voltar"
                onClick={() => router.replace(backUrl)}
              >
                <ArrowBackIcon sx={{ color: '#fff', fontSize: 24 }} />
              </IconButton>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ color: '#1F1F1F', fontWeight: 600 }}>
                  {order.businessPartner.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#1F1F1F' }}>
                  Id da ordem: <Text copyable={{ text: order.id, tooltips: ['Copiar', 'Copiado!'] }}>{order.id}</Text>
                </Typography>
                {flow === 'refund' && paymentId && (
                  <Typography variant="body2" sx={{ color: '#1F1F1F' }}>
                    Id do pagamento: <Text copyable={{ text: paymentId, tooltips: ['Copiar', 'Copiado!'] }}>{paymentId}</Text>
                  </Typography>
                )}
              </Box>
            </Box>
            <StatusBadge status={order.status as StatusType} />
          </div>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Info
