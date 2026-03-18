import {
  AcquirerEnum,
  IManualPayment,
  IPaymentResponse,
  IRefund,
} from '@/domain/aggregates/order'
import { useCallback, useMemo, useState } from 'react'

type TData = IPaymentResponse | IRefund | IManualPayment

export const useCollapsableList = (data: TData[]) => {
  const [getnetAccordionOpen, setGetnetAccordionOpen] = useState(
    data.some(value => value.acquirer?.id === AcquirerEnum.GETNET) &&
      !data.some(value => value.acquirer?.id === AcquirerEnum.MERCADO_PAGO) &&
      !data.some(value => value.acquirer?.id === AcquirerEnum.SANTANDER)
  )
  const [mercadoPagoAccordionOpen, setMercadoPagoAccordionOpen] = useState(
    data.some(value => value.acquirer?.id === AcquirerEnum.MERCADO_PAGO) &&
      !data.some(value => value.acquirer?.id === AcquirerEnum.GETNET) &&
      !data.some(value => value.acquirer?.id === AcquirerEnum.SANTANDER)
  )
  const [santanderAccordionOpen, setSantanderAccordionOpen] = useState(
    data.some(value => value.acquirer?.id === AcquirerEnum.SANTANDER) &&
      !data.some(value => value.acquirer?.id === AcquirerEnum.GETNET) &&
      !data.some(value => value.acquirer?.id === AcquirerEnum.MERCADO_PAGO)
  )

  const dataByAcquirerType = useMemo(
    () => [
      {
        title: 'Getnet',
        acquirer: AcquirerEnum.GETNET,
        imagePath: '/getnet.svg',
        data: data.filter(value => value.acquirer?.id === AcquirerEnum.GETNET),
      },
      {
        title: 'Mercado Pago',
        acquirer: AcquirerEnum.MERCADO_PAGO,
        imagePath: '/mercado-pago.svg',
        data: data.filter(
          value => value.acquirer?.id === AcquirerEnum.MERCADO_PAGO
        ),
      },
      {
        title: 'Santander',
        acquirer: AcquirerEnum.SANTANDER,
        imagePath: '/santander.svg',
        data: data.filter(
          value => value.acquirer?.id === AcquirerEnum.SANTANDER
        ),
      },
    ],
    [data]
  )

  const getAccordionState = useCallback(
    (acquirer: AcquirerEnum) => {
      return acquirer === AcquirerEnum.GETNET
        ? getnetAccordionOpen
        : acquirer === AcquirerEnum.MERCADO_PAGO
          ? mercadoPagoAccordionOpen
          : santanderAccordionOpen
    },
    [getnetAccordionOpen, mercadoPagoAccordionOpen, santanderAccordionOpen]
  )

  const handleToggleAccordion = useCallback(
    (acquirer: AcquirerEnum) => (expanded: boolean) => {
      if (acquirer === AcquirerEnum.GETNET) {
        setGetnetAccordionOpen(expanded)
      } else if (acquirer === AcquirerEnum.MERCADO_PAGO) {
        setMercadoPagoAccordionOpen(expanded)
      } else {
        setSantanderAccordionOpen(expanded)
      }
    },
    []
  )

  return {
    dataByAcquirerType,
    getAccordionState,
    handleToggleAccordion,
  }
}
