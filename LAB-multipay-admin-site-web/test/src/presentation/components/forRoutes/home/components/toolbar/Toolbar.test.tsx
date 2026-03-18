import { render, screen } from '@testing-library/react'
import SearchToolbar from '@/presentation/components/forRoutes/home/components/toolbar/Toolbar'

// Mock the child components
jest.mock('@/presentation/components/forRoutes/home/components/filter/Filter', () => {
    return function MockButtonFilter() {
        return <div data-testid="button-filter">Button Filter</div>
    }
})

jest.mock('@/presentation/components/forRoutes/home/components/filter/RenderFilters', () => {
    return function MockRenderFilters() {
        return <div data-testid="render-filters">Render Filters</div>
    }
})

describe('SearchToolbar', () => {
    it('renders without crashing', () => {
        render(<SearchToolbar />)
    })

    it('renders the Grid2 container with correct styling', () => {
        render(<SearchToolbar />)
        const gridContainer = screen.getByTestId('grid-container')

        expect(gridContainer).toHaveStyle({
            margin: '12px 1rem',
            backgroundColor: '#fff',
            boxShadow: '0px 0px 5px 0px rgba(0, 0, 0, 0.1)',
            padding: '1rem',
        })
    })

    it('renders RenderFilters and ButtonFilter components', () => {
        render(<SearchToolbar />)

        expect(screen.getByTestId('render-filters')).toBeInTheDocument()
        expect(screen.getByTestId('button-filter')).toBeInTheDocument()
    })
})
