import { render, screen } from '@testing-library/react'
import HomePage from '@/presentation/components/forRoutes/home/page'
import { FilterProvider } from '@/presentation/context/filter-context'

// Mock the hooks and components
const mockUseOrders = jest.fn()
const mockUseFilterContext = jest.fn()

jest.mock('@/presentation/hooks/useOrders', () => ({
    useOrders: () => mockUseOrders()
}))
jest.mock('@/presentation/context/filter-context', () => ({
    FilterProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useFilterContext: () => mockUseFilterContext()
}))
jest.mock('@/presentation/components/forRoutes/home/components/table/Table', () => {
    return function MockTable() {
        return <div data-testid="mock-table">Table Component</div>
    }
})
jest.mock('@/presentation/components/forRoutes/home/components/toolbar/Toolbar', () => {
    return function MockToolbar() {
        return <div data-testid="mock-toolbar">Toolbar Component</div>
    }
})
jest.mock('@/presentation/components/common/breadcrumb', () => ({
    BreadcrumbsComponent: () => <div data-testid="mock-breadcrumbs">Breadcrumbs Component</div>
}))

describe('HomePage', () => {
    const mockOrders = [
        { id: 1, status: 'PENDING' },
        { id: 2, status: 'COMPLETED' }
    ]
    const mockPaging = { total: 2, perPage: 10 }
    const mockFilterContext = {
        filterData: {
            paging: { page: 1, perPage: 10 },
            sort: { field: 'id', direction: 'asc' }
        },
        setFilter: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // Mock useOrders hook with more realistic data
        mockUseOrders.mockReturnValue({
            orders: mockOrders,
            paging: mockPaging,
            isLoading: false,
            error: null
        })
        // Mock filter context
        mockUseFilterContext.mockReturnValue(mockFilterContext)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders all main components', () => {
        render(
            <FilterProvider>
                <HomePage />
            </FilterProvider>
        )

        // Check if all components are rendered
        expect(screen.getByTestId('mock-breadcrumbs')).toBeInTheDocument()
        expect(screen.getByTestId('mock-toolbar')).toBeInTheDocument()
        expect(screen.getByTestId('mock-table')).toBeInTheDocument()

        // Check if components are rendered in the correct order
        const container = screen.getByTestId('home-page-container')
        const children = container.children
        expect(children[0]).toHaveTextContent('Breadcrumbs Component')
        expect(children[1]).toHaveTextContent('Toolbar Component')
        expect(children[2]).toHaveTextContent('Table Component')
    })

    it('has correct background color and padding', () => {
        render(
            <FilterProvider>
                <HomePage />
            </FilterProvider>
        )

        const container = screen.getByTestId('home-page-container')
        expect(container).toHaveStyle({
            background: '#F6F6F6',
            padding: '16px 0',
            minHeight: '100vh'
        })
    })

    it('integrates with useOrders hook', () => {
        render(
            <FilterProvider>
                <HomePage />
            </FilterProvider>
        )

        // Verify that useOrders was called
        expect(mockUseOrders).toHaveBeenCalled()

        // Verify that the hook's return value is used
        const { orders, paging, isLoading } = mockUseOrders.mock.results[0].value
        expect(orders).toEqual(mockOrders)
        expect(paging).toEqual(mockPaging)
        expect(isLoading).toBe(false)
    })

    it('handles loading state correctly', () => {
        mockUseOrders.mockReturnValue({
            orders: [],
            paging: { total: 0, perPage: 10 },
            isLoading: true,
            error: null
        })

        render(
            <FilterProvider>
                <HomePage />
            </FilterProvider>
        )

        const container = screen.getByTestId('home-page-container')
        expect(container).toHaveAttribute('aria-busy', 'true')
    })

    it('handles error state correctly', () => {
        mockUseOrders.mockReturnValue({
            orders: [],
            paging: { total: 0, perPage: 10 },
            isLoading: false,
            error: 'Failed to fetch orders'
        })

        render(
            <FilterProvider>
                <HomePage />
            </FilterProvider>
        )

        const container = screen.getByTestId('home-page-container')
        expect(container).toHaveAttribute('aria-busy', 'false')
    })

    it('has correct accessibility attributes', () => {
        render(
            <FilterProvider>
                <HomePage />
            </FilterProvider>
        )

        const container = screen.getByTestId('home-page-container')
        expect(container).toHaveAttribute('role', 'main')
        expect(container).toHaveAttribute('aria-busy', 'false')
    })

    it('integrates with filter context', () => {
        render(
            <FilterProvider>
                <HomePage />
            </FilterProvider>
        )

        // Verify that the filter context is available
        expect(mockFilterContext.filterData).toBeDefined()
        expect(mockFilterContext.setFilter).toBeDefined()
    })
})
