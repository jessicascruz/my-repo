import React from 'react'
import { render, screen } from '@testing-library/react'
import OrderForm from '@/presentation/components/forRoutes/order/details/components/order/Order'
import { useTheme, useMediaQuery } from '@mui/material'
import { mockOrder } from '@/../test/mocked-order'

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useTheme: jest.fn(),
  useMediaQuery: jest.fn(),
}))

jest.mock('@/domain/seedWork/utils/currencyFormat', () => ({
  formatToBrlCurrency: jest.fn(value => `R$ ${value}`),
}))

jest.mock('@/domain/seedWork/utils/expirationTime', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((value: number) => String(value)),
}))

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>
const mockUseMediaQuery = useMediaQuery as jest.MockedFunction<
  typeof useMediaQuery
>

describe('OrderForm Component', () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      breakpoints: {
        down: () => false,
      },
    } as any)
    mockUseMediaQuery.mockReturnValue(false)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders all order fields correctly', () => {
    render(<OrderForm order={mockOrder} />)

    expect(screen.getByText(mockOrder.referenceId)).toBeInTheDocument()
    expect(screen.getByText(mockOrder.subReferenceId)).toBeInTheDocument()

    const systemIdStr = String(mockOrder.systemId)
    const systemIdElems = screen.getAllByText(systemIdStr)
    expect(systemIdElems.length).toBeGreaterThan(0)
    systemIdElems.forEach(elem => expect(elem).toBeInTheDocument())


    expect(screen.getByText(mockOrder.conditionId)).toBeInTheDocument()

    expect(screen.getByText(`R$ ${mockOrder.amount}`)).toBeInTheDocument()
    expect(screen.getByText(`R$ ${mockOrder.discount}`)).toBeInTheDocument()

    expect(
      screen.getByText(String(mockOrder.expirationTime))
    ).toBeInTheDocument()

    expect(screen.getByText(mockOrder.paymentLink)).toBeInTheDocument()
    expect(screen.getByText(mockOrder.adminLink)).toBeInTheDocument()

    expect(screen.getByText(mockOrder.requester.id)).toBeInTheDocument()
    expect(screen.getByText(mockOrder.requester.name)).toBeInTheDocument()
    expect(screen.getByText(mockOrder.requester.email)).toBeInTheDocument()

    expect(screen.getAllByText(/01\/01\/2023/).length).toBeGreaterThanOrEqual(1)
  })
})
