// __tests__/DateEndFilter.test.tsx

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import moment from 'moment'

// Mocks
jest.mock(
  '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider',
  () => ({
    __esModule: true,
    LocalizationProvider: ({ children }: any) => <div>{children}</div>,
  })
)

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  __esModule: true,
  DatePicker: ({ value, onChange, disabled, minDate, slotProps }: any) => (
    <div data-testid="date-end-filter">
      <input
        type="text"
        disabled={disabled || !minDate}
        value={value ? moment(value).format('DD/MM/YYYY') : ''}
        onChange={e => {
          if (disabled) return
          const raw = e.target.value
          if (!raw || raw.trim() === '') {
            onChange(null)
          } else {
            const date = moment(raw, 'DD/MM/YYYY', true)
            onChange(date.isValid() ? date : null)
          }
        }}
      />
      <button
        data-testid="clear-button"
        onClick={() => slotProps?.field?.onClear?.()}
      />
    </div>
  ),
}))

import DateEndFilter from '@/presentation/components/forRoutes/home/components/filter/DateEndFilter'

describe('DateEndFilter', () => {
  it('renders correctly', () => {
    render(<DateEndFilter dateStart={new Date()} handleChange={jest.fn()} />)
    expect(screen.getByTestId('date-end-filter')).toBeInTheDocument()
  })

  it('calls handleChange with the correct date', async () => {
    const mockHandleChange = jest.fn()

    render(
      <DateEndFilter dateStart={new Date()} handleChange={mockHandleChange} />
    )

    const input = screen
      .getByTestId('date-end-filter')
      .querySelector('input') as HTMLInputElement

    fireEvent.change(input, { target: { value: '25/04/2023' } })

    await waitFor(() => {
      expect(mockHandleChange).toHaveBeenCalledWith('end', expect.any(Date))
      expect(
        moment(mockHandleChange.mock.calls[0][1]).format('DD/MM/YYYY')
      ).toBe('25/04/2023')
    })
  })

  it('calls handleChange when clearing the field', async () => {
    const mockHandleChange = jest.fn()

    render(
      <DateEndFilter
        dateStart={new Date()}
        dateEnd={moment('25/04/2023', 'DD/MM/YYYY').toDate()}
        handleChange={mockHandleChange}
      />
    )

    const input = screen
      .getByTestId('date-end-filter')
      .querySelector('input') as HTMLInputElement

    fireEvent.change(input, { target: { value: '' } })

    await waitFor(() => {
      expect(mockHandleChange).toHaveBeenCalledWith('end', null)
    })
  })

  it('clears both start and end dates when clear button is clicked', async () => {
    const mockHandleChange = jest.fn()

    render(
      <DateEndFilter
        dateStart={moment('24/04/2023', 'DD/MM/YYYY').toDate()}
        dateEnd={moment('25/04/2023', 'DD/MM/YYYY').toDate()}
        handleChange={mockHandleChange}
      />
    )

    const clearButton = screen.getByTestId('clear-button')
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(mockHandleChange).toHaveBeenCalledWith('start', null)
      expect(mockHandleChange).toHaveBeenCalledWith('end', null)
    })
  })

  it('allows date selection when dateStart is provided', () => {
    render(<DateEndFilter dateStart={new Date()} handleChange={jest.fn()} />)

    const input = screen
      .getByTestId('date-end-filter')
      .querySelector('input') as HTMLInputElement

    expect(input).not.toBeDisabled()
  })
})
