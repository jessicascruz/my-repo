// __tests__/DateStartFilter.test.tsx

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
  DatePicker: ({ label, value, onChange, slotProps }: any) => {
    return (
      <label>
        {label}
        <input
          aria-label={label}
          data-testid="date-start-filter"
          type="text"
          value={value ? moment(value).format('DD/MM/YYYY') : ''}
          onChange={e => {
            const raw = e.target.value
            if (!raw || raw.trim() === '') {
              onChange(null)
              slotProps?.field?.onClear?.()
            } else {
              const date = moment(raw, 'DD/MM/YYYY', true)
              onChange(date.isValid() ? date : null)
            }
          }}
        />
      </label>
    )
  },
}))

import DateStartFilter from '@/presentation/components/forRoutes/home/components/filter/DateStartFilter'

describe('DateStartFilter', () => {
  it('calls handleChange with the correct date', async () => {
    const mockHandleChange = jest.fn()
    render(
      <DateStartFilter
        dateEnd={new Date('2024-04-20')}
        handleChange={mockHandleChange}
      />
    )

    const input = screen.getByTestId('date-start-filter')
    fireEvent.change(input, { target: { value: '21/04/2024' } })

    await waitFor(() => {
      expect(mockHandleChange).toHaveBeenCalledWith('start', expect.any(Date))
    })
  })

  it('calls handleChange when clearing the field', async () => {
    const mockHandleChange = jest.fn()

    render(
      <DateStartFilter
        dateStart={moment('21/04/2024', 'DD/MM/YYYY').toDate()}
        dateEnd={moment('25/04/2024', 'DD/MM/YYYY').toDate()}
        handleChange={mockHandleChange}
      />
    )

    const input = screen.getByTestId('date-start-filter')
    fireEvent.change(input, { target: { value: '' } })

    await waitFor(() => {
      expect(mockHandleChange).toHaveBeenCalledWith('start', null)
      expect(mockHandleChange).toHaveBeenCalledWith('end', null)
    })
  })

  it('sets dateEnd when setting dateStart', async () => {
    const mockHandleChange = jest.fn()

    render(<DateStartFilter handleChange={mockHandleChange} />)

    const input = screen.getByTestId('date-start-filter')
    fireEvent.change(input, { target: { value: '25/04/2024' } })

    await waitFor(() => {
      expect(mockHandleChange).toHaveBeenCalledWith('start', expect.any(Date))
      expect(mockHandleChange).toHaveBeenCalledWith('end', expect.any(Date))
    })
  })
})
