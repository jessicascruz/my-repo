import { renderHook, act } from '@testing-library/react'
import { AcquirerEnum, IRefund } from '@/domain/aggregates/order'
import { useCollapsableList } from '@/presentation/hooks/useCollapsableList'

describe('useCollapsableList', () => {
  const getnetItem = {
    acquirer: { id: AcquirerEnum.GETNET },
  } as IRefund

  const mercadoPagoItem = {
    acquirer: { id: AcquirerEnum.MERCADO_PAGO },
  } as IRefund

  it('initializes Getnet accordion open when only Getnet data is present', () => {
    const { result } = renderHook(() => useCollapsableList([getnetItem]))

    expect(result.current.getAccordionState(AcquirerEnum.GETNET)).toBe(true)
    expect(result.current.getAccordionState(AcquirerEnum.MERCADO_PAGO)).toBe(
      false
    )
  })

  it('initializes Mercado Pago accordion open when only Mercado Pago data is present', () => {
    const { result } = renderHook(() => useCollapsableList([mercadoPagoItem]))

    expect(result.current.getAccordionState(AcquirerEnum.GETNET)).toBe(false)
    expect(result.current.getAccordionState(AcquirerEnum.MERCADO_PAGO)).toBe(
      true
    )
  })

  it('initializes both accordions closed when both acquirers are present', () => {
    const { result } = renderHook(() =>
      useCollapsableList([getnetItem, mercadoPagoItem])
    )

    expect(result.current.getAccordionState(AcquirerEnum.GETNET)).toBe(false)
    expect(result.current.getAccordionState(AcquirerEnum.MERCADO_PAGO)).toBe(
      false
    )
  })

  it('toggles Getnet accordion state', () => {
    const { result } = renderHook(() => useCollapsableList([getnetItem]))

    act(() => {
      result.current.handleToggleAccordion(AcquirerEnum.GETNET)(false)
    })

    expect(result.current.getAccordionState(AcquirerEnum.GETNET)).toBe(false)

    act(() => {
      result.current.handleToggleAccordion(AcquirerEnum.GETNET)(true)
    })

    expect(result.current.getAccordionState(AcquirerEnum.GETNET)).toBe(true)
  })

  it('toggles Mercado Pago accordion state', () => {
    const { result } = renderHook(() => useCollapsableList([mercadoPagoItem]))

    act(() => {
      result.current.handleToggleAccordion(AcquirerEnum.MERCADO_PAGO)(false)
    })

    expect(result.current.getAccordionState(AcquirerEnum.MERCADO_PAGO)).toBe(
      false
    )

    act(() => {
      result.current.handleToggleAccordion(AcquirerEnum.MERCADO_PAGO)(true)
    })

    expect(result.current.getAccordionState(AcquirerEnum.MERCADO_PAGO)).toBe(
      true
    )
  })

  it('returns correctly grouped data by acquirer', () => {
    const { result } = renderHook(() =>
      useCollapsableList([getnetItem, mercadoPagoItem])
    )

    const dataByAcquirer = result.current.dataByAcquirerType

    const getnetGroup = dataByAcquirer.find(
      group => group.acquirer === AcquirerEnum.GETNET
    )
    const mercadoPagoGroup = dataByAcquirer.find(
      group => group.acquirer === AcquirerEnum.MERCADO_PAGO
    )

    expect(getnetGroup?.data).toEqual([getnetItem])
    expect(mercadoPagoGroup?.data).toEqual([mercadoPagoItem])
  })
})
