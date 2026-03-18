
import { IRefund } from '@/domain/aggregates/order'
import Refunds, {
  refundsHeaders,
} from '@/presentation/components/forRoutes/order/details/components/refunds/Refunds'
import { render, screen } from '@testing-library/react'

jest.mock(
  '@/presentation/components/forRoutes/order/details/components/refunds/RefundRow',
  () => ({
    RefundRow: ({ data }: { data: IRefund }) => (
      <tr>
        <td>{data.id}</td>
      </tr>
    ),
  })
)

describe('Refunds', () => {
  const mockData: IRefund[] = [
    {
      id: '123',
      amount: 500,
      updatedAt: '2024-04-10T12:00:00Z',
      createdAt: '2024-04-10T12:00:00Z',
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
    },
    {
      id: '1234',
      amount: 500,
      updatedAt: '2024-04-10T12:00:00Z',
      createdAt: '2024-04-10T12:00:00Z',
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
    },
  ]

  it('renders headers and data correctly', () => {
    render(<Refunds refundData={mockData} />)

    refundsHeaders.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument()
    })
    expect(screen.getByText(mockData[0].id)).toBeInTheDocument()
    expect(screen.getByText(mockData[1].id)).toBeInTheDocument()
  })

  it('does not render if no data', () => {
    render(<Refunds />)

    refundsHeaders.forEach(header => {
      expect(screen.queryByText(header)).not.toBeInTheDocument()
    })
  })
})
