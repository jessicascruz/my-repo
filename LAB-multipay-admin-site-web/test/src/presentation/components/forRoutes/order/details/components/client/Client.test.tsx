import React from 'react'
import { render, screen } from '@testing-library/react'
import CustomerForm from '@/presentation/components/forRoutes/order/details/components/client/Client'
import { IBusinessPartnerResponse } from '@/domain/aggregates/order'

describe('CustomerForm Component', () => {
  const mockData: IBusinessPartnerResponse = {
    name: 'John Doe',
    documentNumber: '123.456.789-09',
    email: 'john.doe@example.com',
    phoneNumber: '(11) 99999-9999',
    address: {
      street: 'Main Street',
      number: '123',
      complement: 'Apt 101',
      neighborhood: 'Downtown',
      city: 'São Paulo',
      state: 'SP',
      postalCode: '01001-000',
    },
    // Add other required properties from IBusinessPartnerResponse
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    documentType: 'CPF',
  }

  it('renders all form fields with correct values', () => {
    render(<CustomerForm data={mockData} />)

    // Get all email inputs (since there are duplicates)
    const emailInputs = screen.getAllByTestId('input-email')

    // Verify each email input has the correct value
    emailInputs.forEach(input => {
      expect(input).toHaveValue(mockData.email)
    })

    // Test other unique fields
    expect(screen.getByTestId('input-name')).toHaveValue(mockData.name)
    expect(screen.getByTestId('input-documentNumber')).toHaveValue(
      mockData.documentNumber
    )
    expect(screen.getByTestId('input-phoneNumber')).toHaveValue(
      mockData.phoneNumber
    )
    expect(screen.getByTestId('input-street')).toHaveValue(
      mockData.address.street
    )
    expect(screen.getByTestId('input-number')).toHaveValue(
      mockData.address.number
    )
    expect(screen.getByTestId('input-complement')).toHaveValue(
      mockData.address.complement
    )
    expect(screen.getByTestId('input-neighborhood')).toHaveValue(
      mockData.address.neighborhood
    )
    expect(screen.getByTestId('input-city')).toHaveValue(mockData.address.city)
    expect(screen.getByTestId('input-state')).toHaveValue(
      mockData.address.state
    )

    const postalCodeInputs = screen.getAllByTestId('input-postalCode')

    // Verify each email input has the correct value
    postalCodeInputs.forEach(input => {
      expect(input).toHaveValue(mockData.address.postalCode)
    })
  })

  it('renders all fields as read-only', () => {
    render(<CustomerForm data={mockData} />)

    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => {
      expect(input).toHaveAttribute('readonly')
    })
  })

  it('renders correct grid layout', () => {
    render(<CustomerForm data={mockData} />)

    // Check grid item sizes
    const nameField = screen.getByTestId('input-name').closest('.MuiGrid2-root')
    expect(nameField).toHaveClass('MuiGrid2-grid-xs-12')
    expect(nameField).toHaveClass('MuiGrid2-grid-sm-6')
    expect(nameField).toHaveClass('MuiGrid2-grid-md-3')

    const streetField = screen
      .getByTestId('input-street')
      .closest('.MuiGrid2-root')
    expect(streetField).toHaveClass('MuiGrid2-grid-xs-12')
    expect(streetField).toHaveClass('MuiGrid2-grid-sm-6')
    expect(streetField).toHaveClass('MuiGrid2-grid-md-6')
  })

  it('handles empty complement field gracefully', () => {
    const testData = {
      ...mockData,
      address: {
        ...mockData.address,
        complement: '',
      },
    }

    render(<CustomerForm data={testData} />)
    expect(screen.getByTestId('input-complement')).toHaveValue('')
  })
})
