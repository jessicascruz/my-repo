import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import DetailsPage from '@/presentation/components/forRoutes/order/details/page'
import Info from '@/presentation/components/forRoutes/components/info/Info'
import Details from '@/presentation/components/forRoutes/components/tabs/Tabs'
import { useOrderDetails } from '@/presentation/hooks/useOrderDetails'
import { useParams, usePathname } from 'next/navigation'
import { mockOrder } from '@/../test/mocked-order'

// Mock the hooks and components
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams())
}))

jest.mock('@/presentation/hooks/useOrderDetails')
jest.mock('@/presentation/components/forRoutes/components/info/Info')
jest.mock('@/presentation/components/forRoutes/components/tabs/Tabs')

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseOrderDetails = useOrderDetails as jest.MockedFunction<
  typeof useOrderDetails
>

describe('DetailsPage Component', () => {
  beforeEach(() => {
    // Mock child components to render simple placeholders
    jest.mocked(Info).mockImplementation(() => <div>Info Component</div>)
    jest.mocked(Details).mockImplementation(() => <div>Details Component</div>)
    // Mock usePathname to return a valid path
    mockUsePathname.mockReturnValue('/order/123/details')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state when order is not available', () => {
    mockUseParams.mockReturnValue({ id: 'order123' })
    mockUseOrderDetails.mockReturnValue({
      order: undefined,
      isLoading: false,
      error: null,
    })

    render(<DetailsPage />)

    expect(screen.queryByText('Info Component')).not.toBeInTheDocument()
    expect(screen.queryByText('Details Component')).not.toBeInTheDocument()
  })

  it('renders correctly when order is available', async () => {
    const orderId = 'order123'
    mockUseParams.mockReturnValue({ id: orderId })
    mockUseOrderDetails.mockReturnValue({
      order: mockOrder,
      isLoading: false,
      error: null,
    })

    render(<DetailsPage />)

    await waitFor(() => {
      expect(screen.getByText('Info Component')).toBeInTheDocument()
      expect(screen.getByText('Details Component')).toBeInTheDocument()
    })
  })

  it('passes correct order ID to useOrderDetails hook', () => {
    const testId = 'test-order-123'
    mockUseParams.mockReturnValue({ id: testId })
    mockUseOrderDetails.mockReturnValue({
      order: mockOrder,
      isLoading: false,
      error: null,
    })

    render(<DetailsPage />)

    expect(mockUseOrderDetails).toHaveBeenCalledWith(testId)
  })
})
