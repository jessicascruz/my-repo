'use client'

import { Box, useTheme } from '@mui/material'
import React from 'react'
import { useParams } from 'next/navigation'
import Info from '@/presentation/components/forRoutes/components/info/Info'
import { useOrderDetails } from '@/presentation/hooks/useOrderDetails'
import { PaymentsComponent } from './components/PaymentComponent'
import PaymentRefundsTable from './components/PaymentRefundsTable'
import { BreadcrumbsComponent } from '@/presentation/components/common/breadcrumb'
import { useCanRefund } from '@/presentation/hooks/useCanRefund'

const RefundPage: React.FC = () => {
  const theme = useTheme()
  const { id, paymentId } = useParams()
  const { order } = useOrderDetails(id as string, true)
  const { canRefundPayment } = useCanRefund()

  const paymentData = order?.payments.find(payment => payment.id === paymentId)

  const refunds =
    order?.refunds?.filter(
      refund => refund.acquirer.paymentId === paymentData?.acquirer.paymentId
    ) ?? []

  const refundedAmount = refunds.reduce((acc, curr) => {
    return acc + curr.amount
  }, 0)

  const canRefund = canRefundPayment({
    acquirerId: paymentData?.acquirer.id,
    paymentApprovedAt: paymentData?.approvedAt,
    paymentStatus: paymentData?.status,
    amount: paymentData?.amount ?? 0,
    refundedAmount: refundedAmount,
  })

  return (
    order &&
    paymentData && (
      <Box
        data-testid="refund-page"
        sx={{ px: 1, background: theme.palette.background.default }}
      >
        <Info order={order} paymentId={paymentId as string} flow="refund" />
        <BreadcrumbsComponent />
        <PaymentsComponent
          order={order}
          paymentData={paymentData}
          paymentId={paymentId as string}
          totalAuthorizedRefunds={refundedAmount}
          canRefund={canRefund}
        />
        <PaymentRefundsTable data={refunds} />
      </Box>
    )
  )
}

export default RefundPage
