import { render, screen, fireEvent } from '@testing-library/react'
import { ClearFilter } from '@/presentation/components/forRoutes/home/components/filter/ClearFilters'
import { useFilterContext } from '@/presentation/context/filter-context'

// Mock the useFilterContext hook
jest.mock('@/presentation/context/filter-context')

// Mock the Icon component
jest.mock('@iconify/react/dist/iconify.js', () => ({
    Icon: () => <span data-testid="clear-icon">×</span>
}))

// Mock the MUI components
jest.mock('@mui/material', () => ({
    Button: ({ children, onClick, disabled, startIcon, ...props }: any) => (
        <button
            data-testid="clear-filter-button"
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {startIcon}
            {children}
        </button>
    ),
    Grid: ({ children }: any) => <div>{children}</div>,
    Grid2: ({ children }: any) => <div>{children}</div>
}))

describe('ClearFilter Component', () => {
    const mockHandleClearFilter = jest.fn()
    const mockUseFilterContext = useFilterContext as jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the clear filter button', () => {
        mockUseFilterContext.mockReturnValue({
            handleClearFilter: mockHandleClearFilter,
            isEmptyFilter: false
        })

        render(<ClearFilter />)

        const button = screen.getByTestId('clear-filter-button')
        expect(button).toBeInTheDocument()
    })

    it('should be disabled when filters are empty', () => {
        mockUseFilterContext.mockReturnValue({
            handleClearFilter: mockHandleClearFilter,
            isEmptyFilter: true
        })

        render(<ClearFilter />)

        const button = screen.getByTestId('clear-filter-button')
        expect(button).toBeDisabled()
    })

    it('should call handleClearFilter when clicked', () => {
        mockUseFilterContext.mockReturnValue({
            handleClearFilter: mockHandleClearFilter,
            isEmptyFilter: false
        })

        render(<ClearFilter />)

        const button = screen.getByTestId('clear-filter-button')
        fireEvent.click(button)
        expect(mockHandleClearFilter).toHaveBeenCalledTimes(1)
    })

    it('should display the correct text', () => {
        mockUseFilterContext.mockReturnValue({
            handleClearFilter: mockHandleClearFilter,
            isEmptyFilter: false
        })

        render(<ClearFilter />)

        const button = screen.getByTestId('clear-filter-button')
        expect(button).toHaveTextContent('Limpar filtros')
    })

    it('should render the clear icon', () => {
        mockUseFilterContext.mockReturnValue({
            handleClearFilter: mockHandleClearFilter,
            isEmptyFilter: false
        })

        render(<ClearFilter />)

        const icon = screen.getByTestId('clear-icon')
        expect(icon).toBeInTheDocument()
    })
})
