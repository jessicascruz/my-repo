import React from 'react'
import { render, screen } from '@testing-library/react'
import Pagination from '@/presentation/components/forRoutes/home/components/pagination'

describe('Pagination', () => {
    it('renders without any props', () => {
        render(<Pagination />)
        expect(screen.getByTestId('bottom-bar')).toBeInTheDocument()
    })

    it('renders with all optional components', () => {
        const perPage = <div data-testid="per-page">Per Page</div>
        const pages = <div data-testid="pages">Pages</div>
        const goToPage = <div data-testid="go-to-page">Go To Page</div>

        render(
            <Pagination
                perPage={perPage}
                pages={pages}
                goToPage={goToPage}
            />
        )

        expect(screen.getByTestId('per-page')).toBeInTheDocument()
        expect(screen.getByTestId('pages')).toBeInTheDocument()
        expect(screen.getByTestId('go-to-page')).toBeInTheDocument()
    })

    it('renders with only some optional components', () => {
        const perPage = <div data-testid="per-page">Per Page</div>
        const pages = <div data-testid="pages">Pages</div>

        render(
            <Pagination
                perPage={perPage}
                pages={pages}
            />
        )

        expect(screen.getByTestId('per-page')).toBeInTheDocument()
        expect(screen.getByTestId('pages')).toBeInTheDocument()
        expect(screen.queryByTestId('go-to-page')).not.toBeInTheDocument()
    })

    it('has static subcomponents', () => {
        expect(Pagination.PerPage).toBeDefined()
        expect(Pagination.Pages).toBeDefined()
        expect(Pagination.GoToPage).toBeDefined()
    })
})
