import { renderHook } from '@testing-library/react'
import { useOrders } from '@/presentation/hooks/useOrders'
import { useFilterContext } from '@/presentation/context/filter-context'
import useLoaders from '@/presentation/hooks/useLoaders'
import { useQuery } from '@tanstack/react-query'

// Mock the dependencies
jest.mock('@/presentation/context/filter-context')
jest.mock('@/presentation/hooks/useLoaders')
jest.mock('@tanstack/react-query')

describe('useOrders', () => {
    const mockFilterData = { someFilter: 'value' }
    const mockStartLoading = jest.fn()
    const mockStopLoading = jest.fn()
    const mockSearchLinks = {
        data: [{ id: 1, name: 'Order 1' }],
        paging: { page: 1, totalPages: 5 }
    }

    beforeEach(() => {
        jest.clearAllMocks()

            // Mock useFilterContext
            ; (useFilterContext as jest.Mock).mockReturnValue({
                filterData: mockFilterData
            })

            // Mock useLoaders
            ; (useLoaders as jest.Mock).mockReturnValue({
                startLoading: mockStartLoading,
                stopLoading: mockStopLoading
            })

            // Mock useQuery
            ; (useQuery as jest.Mock).mockReturnValue({
                data: mockSearchLinks,
                isLoading: false,
                error: null
            })
    })

    it('should return orders and paging data when query is successful', () => {
        const { result } = renderHook(() => useOrders())

        expect(result.current.orders).toEqual(mockSearchLinks.data)
        expect(result.current.paging).toEqual(mockSearchLinks.paging)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should return default values when query data is undefined', () => {
        ; (useQuery as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null
        })

        const { result } = renderHook(() => useOrders())

        expect(result.current.orders).toEqual([])
        expect(result.current.paging).toBeDefined()
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should handle loading state correctly', () => {
        ; (useQuery as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true,
            error: null
        })

        const { result } = renderHook(() => useOrders())

        expect(result.current.isLoading).toBe(true)
        expect(mockStartLoading).toHaveBeenCalled()
    })

    it('should handle error state', () => {
        const mockError = new Error('Test error')
            ; (useQuery as jest.Mock).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: mockError
            })

        const { result } = renderHook(() => useOrders())

        expect(result.current.error).toBe(mockError)
        expect(mockStopLoading).toHaveBeenCalled()
    })

    it('should update loading state when query loading state changes', () => {
        const { rerender } = renderHook(() => useOrders())

        // Initial state
        expect(mockStartLoading).not.toHaveBeenCalled()
        expect(mockStopLoading).toHaveBeenCalled()

            // Change to loading state
            ; (useQuery as jest.Mock).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null
            })

        rerender()

        expect(mockStartLoading).toHaveBeenCalled()
        expect(mockStopLoading).toHaveBeenCalledTimes(1)

            // Change back to non-loading state
            ; (useQuery as jest.Mock).mockReturnValue({
                data: mockSearchLinks,
                isLoading: false,
                error: null
            })

        rerender()

        expect(mockStartLoading).toHaveBeenCalledTimes(1)
        expect(mockStopLoading).toHaveBeenCalledTimes(2)
    })
})
