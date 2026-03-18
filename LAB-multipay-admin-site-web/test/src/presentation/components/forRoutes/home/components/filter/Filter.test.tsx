import { render, screen, fireEvent } from '@testing-library/react'
import ButtonFilter from '@/presentation/components/forRoutes/home/components/filter/Filter'
import { FilterProvider } from '@/presentation/context/filter-context'

// Mock the child components
jest.mock('@/presentation/components/forRoutes/home/components/filter/ClearFilters', () => ({
    ClearFilter: () => <div data-testid="clear-filter">Clear Filter</div>
}))

jest.mock('@/presentation/components/forRoutes/home/components/filter/Formulary', () => ({
    __esModule: true,
    default: ({ open, handleClose }: { open: boolean; handleClose: () => void }) => (
        <div data-testid="formulary" data-open={open}>
            Formulary Component{' '}
            <button onClick={handleClose}>Close</button>
        </div>
    ),
}))

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn(), pathname: '/', query: {}, asPath: '/', events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() }, isFallback: false }),
    useSearchParams: () => ({
        get: jest.fn(),
        set: jest.fn(),
        entries: () => [].entries(),
    })
}))

const renderWithProvider = (component: React.ReactNode) => {
    return render(
        <FilterProvider>
            {component}
        </FilterProvider>
    )
}

describe('ButtonFilter', () => {
    it('renders the filter button and clear filter component', () => {
        renderWithProvider(<ButtonFilter />)

        expect(screen.getByText('Filtros')).toBeInTheDocument()
        expect(screen.getByTestId('clear-filter')).toBeInTheDocument()
    })

    it('opens the formulary when filter button is clicked', () => {
        renderWithProvider(<ButtonFilter />)

        const filterButton = screen.getByText('Filtros')
        fireEvent.click(filterButton)

        const formulary = screen.getByTestId('formulary')
        expect(formulary).toHaveAttribute('data-open', 'true')
    })

    it('closes the formulary when handleClose is called', () => {
        renderWithProvider(<ButtonFilter />)

        // Open the formulary
        const filterButton = screen.getByText('Filtros')
        fireEvent.click(filterButton)

        // Get the formulary component
        const formulary = screen.getByTestId('formulary')

        // Simulate closing the formulary
        const closeButton = formulary.querySelector('button')
        if (closeButton) {
            fireEvent.click(closeButton)
        }

        // The formulary should be closed
        expect(formulary).toHaveAttribute('data-open', 'false')
    })

    it('has correct button styling', () => {
        renderWithProvider(<ButtonFilter />)

        const filterButton = screen.getByText('Filtros')
        expect(filterButton).toHaveStyle({
            color: 'rgb(255, 255, 255)',
            background: 'rgb(0, 80, 215)',
            border: '1px solid #d1d1d1'
        })
    })
})
