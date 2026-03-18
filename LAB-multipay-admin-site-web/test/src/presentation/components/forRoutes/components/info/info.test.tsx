import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Info from '@/presentation/components/forRoutes/components/info/Info'
import { useRouter, useSearchParams } from 'next/navigation'
import { mockOrder } from '../../../../../../mocked-order'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// Mock do router do Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>
const mockReplace = jest.fn()

// Criando tema padrão do MUI para testes
const theme = createTheme()

// Helper para renderizar o componente com o tema do MUI
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)

describe('Info Component', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      refresh: jest.fn(),
    })
    // Mock ReadonlyURLSearchParams
    const mockSearchParams = new URLSearchParams()
    Object.defineProperty(mockSearchParams, 'append', { value: () => { } })
    Object.defineProperty(mockSearchParams, 'delete', { value: () => { } })
    Object.defineProperty(mockSearchParams, 'set', { value: () => { } })
    mockUseSearchParams.mockReturnValue(mockSearchParams as any)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly with order information', () => {
    renderWithTheme(<Info order={mockOrder} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Id da ordem:'))).toBeInTheDocument()
    expect(screen.getByLabelText('Voltar')).toBeInTheDocument()
  })

  it('calls router.replace when back button is clicked', () => {
    renderWithTheme(<Info order={mockOrder} />)

    fireEvent.click(screen.getByLabelText('Voltar'))

    expect(mockReplace).toHaveBeenCalledWith('/home?')
  })

  it('applies correct styles to the back button', () => {
    renderWithTheme(<Info order={mockOrder} />)

    const backButton = screen.getByLabelText('Voltar')
    const styles = getComputedStyle(backButton)

    expect(['rgb(0, 80, 215)', 'rgb(0, 60, 157)']).toContain(
      styles.backgroundColor
    )
    expect(styles.borderRadius).toBe('50%')
    expect(styles.width).toBe('40px')
    expect(styles.height).toBe('40px')

    const icon = backButton.querySelector('svg')
    const iconStyles = getComputedStyle(icon!)
    expect(iconStyles.color).toBe('rgb(255, 255, 255)')
    expect(iconStyles.fontSize).toBe('24px')
  })

  it('renders correctly in refund flow', () => {
    const paymentId = 'test-payment-id'
    renderWithTheme(<Info order={mockOrder} paymentId={paymentId} flow="refund" />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Id da ordem:'))).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('Id do pagamento:'))).toBeInTheDocument()
    expect(screen.getByText(paymentId)).toBeInTheDocument()
  })

  it('calls router.replace with correct URL in refund flow', () => {
    const paymentId = 'test-payment-id'
    renderWithTheme(<Info order={mockOrder} paymentId={paymentId} flow="refund" />)

    fireEvent.click(screen.getByLabelText('Voltar'))

    expect(mockReplace).toHaveBeenCalledWith(`/order/${mockOrder.id}/details?`)
  })

  it('renders status badge with correct status', () => {
    renderWithTheme(<Info order={mockOrder} />)

    const statusBadge = screen.getByText('Pendente')
    expect(statusBadge).toBeInTheDocument()
  })

  it('renders copyable text for order ID', () => {
    renderWithTheme(<Info order={mockOrder} />)

    const copyableText = screen.getByText(mockOrder.id)
    expect(copyableText).toBeInTheDocument()
    expect(screen.getByLabelText('Copiar')).toBeInTheDocument()
  })
})
