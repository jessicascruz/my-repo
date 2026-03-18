import { render, screen } from '@testing-library/react'
import { IDiscount, IRequester } from '@/domain/aggregates/order'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'
import { DiscountRow } from '@/presentation/components/forRoutes/order/details/components/discounts/DiscountRow'

jest.mock('@/domain/seedWork/utils/currencyFormat', () => ({
  formatToBrlCurrency: jest.fn().mockImplementation(val => val),
}))

jest.mock(
  '@/presentation/components/forRoutes/order/details/components/components/RequesterModal',
  () => ({
    RequesterModal: ({ requester }: { requester: IRequester }) => (
      <div data-testid="requester-modal">{requester.email}</div>
    ),
  })
)

describe('DiscountRow', () => {
  const mockDiscount: IDiscount = {
    id: '123',
    systemId: 456,
    createdAt: '2024-04-10T12:00:00Z',
    requester: {
      email: 'req-email',
      id: 'req-id',
      name: 'req-name',
    },
    oldAmount: 1000,
    requestAmount: 800,
    oldDiscount: 100,
    requestDiscount: 200,
  }

  it('renders all discount fields correctly', () => {
    render(
      <table>
        <tbody>
          <DiscountRow data={mockDiscount} />
        </tbody>
      </table>
    )

    expect(screen.getByText(mockDiscount.systemId)).toBeInTheDocument()
    expect(
      screen.getByText(isoToLocalePtBr(mockDiscount.createdAt))
    ).toBeInTheDocument()
    expect(screen.getByTestId('requester-modal')).toHaveTextContent(
      mockDiscount.requester.email
    )
    expect(
      screen.getByText(formatToBrlCurrency(mockDiscount.oldAmount))
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatToBrlCurrency(mockDiscount.requestAmount))
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatToBrlCurrency(mockDiscount.oldDiscount))
    ).toBeInTheDocument()
    expect(
      screen.getByText(formatToBrlCurrency(mockDiscount.requestDiscount))
    ).toBeInTheDocument()
  })
})
