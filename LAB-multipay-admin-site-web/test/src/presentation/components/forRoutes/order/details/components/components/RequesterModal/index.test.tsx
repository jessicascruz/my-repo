import { render, screen, fireEvent } from '@testing-library/react'
import { IRequester } from '@/domain/aggregates/order'
import { RequesterModal } from '@/presentation/components/forRoutes/order/details/components/components/RequesterModal'

describe('RequesterModal', () => {
  const mockRequester: IRequester = {
    id: 'req-001',
    name: 'Maria Silva',
    email: 'maria@example.com',
  }

  it('renders the requester email and opens modal on click', () => {
    render(<RequesterModal requester={mockRequester} />)

    const openButton = screen.getByRole('button', {
      name: new RegExp(mockRequester.email, 'i'),
    })
    expect(openButton).toBeInTheDocument()

    expect(
      screen.queryByText(/Informações do Solicitante/i)
    ).not.toBeInTheDocument()

    fireEvent.click(openButton)

    expect(screen.getByText(/Informações do Solicitante/i)).toBeInTheDocument()
    expect(screen.getByText(/ID Solicitante/i)).toBeInTheDocument()
    expect(screen.getByText(mockRequester.id)).toBeInTheDocument()
    expect(screen.getByText(/Nome Solicitante/i)).toBeInTheDocument()
    expect(screen.getByText(mockRequester.name)).toBeInTheDocument()
    expect(screen.getByText(/E-mail Solicitante/i)).toBeInTheDocument()
    expect(screen.queryAllByText(mockRequester.email)[0]).toBeInTheDocument()
    expect(screen.queryAllByText(mockRequester.email)[1]).toBeInTheDocument()
  })
})
