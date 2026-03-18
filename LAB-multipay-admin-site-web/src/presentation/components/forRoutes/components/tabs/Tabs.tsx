'use client'

import Client from '@/presentation/components/forRoutes/order/details/components/client/Client'
import OrderForm from '@/presentation/components/forRoutes/order/details/components/order/Order'
import ProductForm from '@/presentation/components/forRoutes/order/details/components/product/Product'
import ReferencesForm from '@/presentation/components/forRoutes/order/details/components/references/References'
import { Box, Container, Paper, Tab, Tabs, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import Payments from '../../order/details/components/payments/Payments'
import { IReceivableResponse } from '@/domain/aggregates/order'
import Refunds from '../../order/details/components/refunds/Refunds'
import Discounts from '../../order/details/components/discounts/Discounts'
import { Filter, FilterPaging } from '@/domain/aggregates/filter/filter'
import { useQuery } from '@tanstack/react-query'
import { filterOptions } from '@/domain/seedWork/libs/reactQuery/options'
import useLoaders from '@/presentation/hooks/useLoaders'
import ActionButton from '../../order/details/components/components/ActionButton'
import { ManualPaymentFormData } from '../../order/details/components/components/ManualPaymentModal/manualPaymentSchema'
import { toast } from 'react-toastify'
import ManualPayment from '../../order/details/components/manualPayment/ManualPayment'
import { manualPaymentsMock } from '../../../../../../test/mocked-order'
import { useMediaQuery } from '@mui/material'
import { useCreateManualPayment } from '@/presentation/hooks/useCreateManualPayment'
import { useGetManualPaymentByOrderId } from '@/presentation/hooks/useGetManualPaymentByOrderId'
import { useApprovalManualPayment } from '@/presentation/hooks/useApprovalManualPayment'

interface Props {
  order: IReceivableResponse
}

const ClientDetails = ({ order }: Props) => {
  const [value, setValue] = React.useState(0)

  const session = {
    user: {
      id: 'guest-id',
      name: 'Guest User',
      email: 'guest@example.com',
    },
  }
  const { mutateAsync: createManualPayment } = useCreateManualPayment()
  const { mutateAsync: approveManualPayment } = useApprovalManualPayment()

  const { data: manualPayments } = useGetManualPaymentByOrderId({
    orderId: order.id,
    reference: order.referenceId,
    subReference: order.subReferenceId
  })

  const { startLoading, stopLoading } = useLoaders()

  const { data: searchLinks, isLoading } = useQuery(
    filterOptions(
      new Filter({
        referenceId: order.referenceId,
        paging: new FilterPaging(1, 99999),
      })
    )
  )

  const isMobile = useMediaQuery('(max-width:700px)')

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const handleSubmitManualPayment = async (data: ManualPaymentFormData) => {
    try {
      await createManualPayment({
        orderId: order.id,
        amount: data.amount,
        reason: data.reason,
        files: data.files,
        requester: {
          id: session?.user?.id || '',
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        },
        reference: order.referenceId,
        subReference: order.subReferenceId,
      })
      toast.success('Pagamento manual feito com sucesso!')
    } catch (error) {
      toast.error('Ocorreu um erro ao criar pagamento manual, por favor tente novamente.')
    }
  }

  const handleApprovalManualPayment = async (manualPaymentId: string, isApproved: boolean) => {
    try {
      await approveManualPayment({
        manualPaymentId,
        orderId: order.id,
        isApproved,
        requesterId: session?.user?.id || '',
        requester: {
          id: session?.user?.id || '',
          name: session?.user?.name || '',
          email: session?.user?.email || '',
        }
      })

      const actionMessage = isApproved ? 'aprovado' : 'rejeitado'
      toast.success(`Pagamento manual ${actionMessage} com sucesso!`)
    } catch (error) {
      toast.error('Ocorreu um erro ao realizar a ação no pagamento manual, por favor tente novamente.')
    }
  }

  const paperStyles = {
    p: 2,
    borderRadius: 2,
    border: '1px solid #E0E0E0',
    flex: 1,
    width: '100%',
    boxShadow: 'none',
  }

  const tabsContainerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: 1,
    borderColor: 'divider',
    position: 'relative',
    flexShrink: 0,
  }

  const tabWrapperStyles = {
    mt: 3,
  }

  useEffect(() => {
    if (isLoading) {
      startLoading()
    } else {
      stopLoading()
    }
  }, [isLoading])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxShadow: 'none',
      }}
    >
      <Container
        disableGutters
        sx={{
          flex: 1,
          pb: 2,
          overflow: 'auto',
          maxWidth: '100% !important',
          width: '100%',
          paddingLeft: {
            xs: 0,
            sm: 2,
          },
          paddingRight: {
            xs: 0,
            sm: 2,
          },
        }}
      >
        <Paper sx={paperStyles}>
          {isMobile && (
            <Box sx={{ mb: 2 }}>
              <ActionButton
                onSubmitManualPayment={handleSubmitManualPayment}
                order={order}
              />
            </Box>
          )}

          {/* Tabs */}
          <Box sx={tabsContainerStyles}>
            <Tabs
              value={value}
              onChange={handleChange}
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                width: '100%',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              <Tab label={<Typography variant="body1">Ordem</Typography>} />
              <Tab label={<Typography variant="body1">Cliente</Typography>} />
              <Tab label={<Typography variant="body1">Produto</Typography>} />
              {(searchLinks?.data ?? []).filter(value => {
                return value.id != order.id
              }).length > 0 && (
                <Tab
                  label={<Typography variant="body1">Referência</Typography>}
                />
              )}
            </Tabs>

            {!isMobile && (
              <ActionButton
                order={order}
                onSubmitManualPayment={handleSubmitManualPayment}
              />
            )}
          </Box>

          {/* Renderização condicional */}
          <Box sx={tabWrapperStyles}>
            {value === 0 && <OrderForm order={order} />}
            {value === 1 && <Client data={order.businessPartner} />}
            {value === 2 && <ProductForm data={order.items} />}
            {value === 3 && (
              <ReferencesForm
                data={order}
                searchLinks={searchLinks ? searchLinks.data : []}
              />
            )}
          </Box>
        </Paper>
      </Container>

      <Payments
        system={order.systemId}
        company={order.company.id}
        data={order.payments}
        reference={`${order.referenceId}-${order.subReferenceId}`}
        refunds={order.refunds}
      />
      <ManualPayment 
        manualPaymentData={manualPayments || []} 
        onApprove={handleApprovalManualPayment}
      />
      <Refunds refundData={order.refunds} />
      <Discounts data={order.discounts} />
    </Box>
  )
}

export default ClientDetails
