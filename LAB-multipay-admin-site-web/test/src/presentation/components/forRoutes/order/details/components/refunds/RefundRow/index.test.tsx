import { render, screen } from '@testing-library/react'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'
import { RefundRow } from '@/presentation/components/forRoutes/order/details/components/refunds/RefundRow'
import { IRefund, IRequester } from '@/domain/aggregates/order'

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

describe('Refund', () => {
  const mockDiscount: IRefund = {
    id: '123',
    amount: 500,
    updatedAt: '2024-04-10T12:00:00Z',
    createdAt: '2024-04-10T14:00:00Z',
    acquirer: {
      id: 1,
      description: 'acq-desc',
      paymentId: 'acq-payid',
      refundId: 'acq-refid',
      status: 'acq-stat',
      statusDetail: 'acq-statdet',
    },
    requester: {
      email: 'req-email',
      id: 'req-id',
      name: 'req-name',
    },
  }

  it('renders all refund fields correctly', () => {
    render(
      <table>
        <tbody>
          <RefundRow data={mockDiscount} />
        </tbody>
      </table>
    )

    expect(screen.getByText(mockDiscount.acquirer.paymentId)).toBeInTheDocument()
    expect(screen.getByText(mockDiscount.acquirer.refundId)).toBeInTheDocument()
 //   expect(screen.getByText(mockDiscount.acquirer.id)).toBeInTheDocument()
    expect(screen.getByText(isoToLocalePtBr(mockDiscount.createdAt))).toBeInTheDocument()
    expect(screen.getByText(isoToLocalePtBr(mockDiscount.updatedAt))).toBeInTheDocument()
    expect(screen.getByTestId('requester-modal')).toHaveTextContent(mockDiscount.requester.email)
    expect(screen.getByText(formatToBrlCurrency(mockDiscount.amount))).toBeInTheDocument()
  })
})
