import { CollapsableListContainer } from '@/presentation/components/forRoutes/order/details/components/components/CollapsableListContainer'
import { render, screen } from '@testing-library/react'

describe('CollapsableListContainer', () => {
  const childText = 'This is inside the container'

  it('renders title when provided', () => {
    render(
      <CollapsableListContainer title="Test Title">
        <p>{childText}</p>
      </CollapsableListContainer>
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText(childText)).toBeInTheDocument()
  })

  it('does not render title when not provided', () => {
    render(
      <CollapsableListContainer>
        <p>{childText}</p>
      </CollapsableListContainer>
    )

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByText(childText)).toBeInTheDocument()
  })
})
