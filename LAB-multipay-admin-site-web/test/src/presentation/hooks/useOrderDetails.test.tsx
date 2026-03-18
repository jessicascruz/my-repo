import { renderHook, waitFor } from '@testing-library/react'
import { useOrderDetails } from '@/presentation/hooks/useOrderDetails'
import { mockOrder } from '../../../mocked-order'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useLoaders from '@/presentation/hooks/useLoaders'
import React from 'react'

// Mock the useLoaders hook
jest.mock('@/presentation/hooks/useLoaders')
const mockUseLoaders = useLoaders as jest.MockedFunction<typeof useLoaders>

// Mock the OrderRepository
jest.mock('@/infra/repositories/OrderRepository', () => ({
    OrderRepository: jest.fn().mockImplementation(() => ({
        getOrderDetails: jest.fn().mockResolvedValue({ data: [mockOrder] }),
    })),
}))

describe('useOrderDetails', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    beforeEach(() => {
        mockUseLoaders.mockReturnValue({
            isLoading: false,
            startLoading: jest.fn(),
            stopLoading: jest.fn(),
        })
        queryClient.clear()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return loading state initially', () => {
        const { result } = renderHook(() => useOrderDetails('test-id'), { wrapper })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.order).toBeUndefined()
        expect(result.current.error).toBeNull()
    })

    it('should return order data when query is successful', async () => {
        const { result } = renderHook(() => useOrderDetails('test-id'), { wrapper })

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.order).toEqual(mockOrder)
        expect(result.current.error).toBeNull()
    })

    it('should handle loading state changes', async () => {
        const mockStartLoading = jest.fn()
        const mockStopLoading = jest.fn()
        mockUseLoaders.mockReturnValue({
            isLoading: false,
            startLoading: mockStartLoading,
            stopLoading: mockStopLoading,
        })

        const { result } = renderHook(() => useOrderDetails('test-id'), { wrapper })

        // Initial loading state
        expect(mockStartLoading).toHaveBeenCalled()

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        // Loading completed
        expect(mockStopLoading).toHaveBeenCalled()
    })

    it('should handle error state', async () => {
        // Mock repository to throw an error
        const mockError = new Error('Test error')
        const OrderRepository = require('@/infra/repositories/OrderRepository').OrderRepository
        OrderRepository.mockImplementation(() => ({
            getOrderDetails: jest.fn().mockRejectedValueOnce(mockError)
        }))

        const { result } = renderHook(() => useOrderDetails('test-id'), { wrapper })

        await waitFor(() => {
            expect(result.current.error).toBeTruthy()
        }, { timeout: 3000 })

        expect(result.current.isLoading).toBe(false)
        expect(result.current.order).toBeUndefined()
    })
}) 