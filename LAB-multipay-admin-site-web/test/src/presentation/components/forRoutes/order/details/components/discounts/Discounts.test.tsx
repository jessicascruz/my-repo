import { IDiscount } from '@/domain/aggregates/order'
import Discounts, {
  discountHeaders,
} from '@/presentation/components/forRoutes/order/details/components/discounts/Discounts'
import { render, screen } from '@testing-library/react'

jest.mock(
  '@/presentation/components/forRoutes/order/details/components/discounts/DiscountRow',
  () => ({
    DiscountRow: ({ data }: { data: IDiscount }) => (
      <tr>
        <td>{data.id}</td>
      </tr>
    ),
  })
)

describe('Discounts', () => {
  const mockData: IDiscount[] = [
    {
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
    },
    {
      id: '1234',
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
    },
  ]

  it('renders headers and data correctly', () => {
    render(<Discounts data={mockData} />)

    discountHeaders.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument()
    })
    expect(screen.getByText(mockData[0].id)).toBeInTheDocument()
    expect(screen.getByText(mockData[1].id)).toBeInTheDocument()
  })

  it('does not render if no data', () => {
    render(<Discounts />)

    discountHeaders.forEach(header => {
      expect(screen.queryByText(header)).not.toBeInTheDocument()
    })
  })
})
