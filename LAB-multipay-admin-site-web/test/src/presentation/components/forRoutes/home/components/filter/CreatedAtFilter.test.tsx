import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import moment from 'moment'

// Mock dos componentes MUI Date Pickers
jest.mock(
  '@mui/x-date-pickers/LocalizationProvider/LocalizationProvider',
  () => ({
    __esModule: true,
    LocalizationProvider: ({ children }: any) => <div>{children}</div>,
  })
)

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  __esModule: true,
  DatePicker: ({ label, value, onChange }: any) => {
    return (
      <div>
        <label htmlFor="date-input">{label}</label>
        <input
          id="date-input"
          aria-label={label}
          type="text"
          value={value ? moment(value).format('DD/MM/YYYY') : ''}
          onChange={e => {
            const raw = e.target.value
            if (!raw || raw.trim() === '') {
              onChange(null)
            } else {
              const date = moment(raw, 'DD/MM/YYYY', true)
              onChange(date.isValid() ? date : null)
            }
          }}
        />
      </div>
    )
  },
}))

import CreatedAtFilter from '@/presentation/components/forRoutes/home/components/filter/CreatedAtFilter'

describe('CreatedAtFilter', () => {
  it('deve renderizar o campo com o rótulo correto', () => {
    const mockHandleChange = jest.fn()

    render(<CreatedAtFilter date={undefined} handleChange={mockHandleChange} />)

    expect(screen.getByLabelText('Data de Criação')).toBeInTheDocument()
  })

  it('deve chamar handleChange com o valor correto ao mudar a data', async () => {
    const mockHandleChange = jest.fn()

    render(<CreatedAtFilter date={undefined} handleChange={mockHandleChange} />)

    const input = screen.getByLabelText('Data de Criação')

    fireEvent.change(input, { target: { value: '20/04/2023' } })
    fireEvent.blur(input) // Simula sair do campo para acionar o onChange

    await waitFor(() => {
      expect(mockHandleChange).toHaveBeenCalled()
      const lastCall =
        mockHandleChange.mock.calls[mockHandleChange.mock.calls.length - 1]
      const selectedDate = lastCall[1] as Date
      expect(lastCall[0]).toBe('createdAt')
      expect(moment(selectedDate).format('DD/MM/YYYY')).toBe('20/04/2023')
    })
  })

  it('deve exibir a data inicial corretamente no campo', () => {
    const mockHandleChange = jest.fn()
    const initialDate = new Date('2023-04-20T00:00:00Z')

    render(
      <CreatedAtFilter date={initialDate} handleChange={mockHandleChange} />
    )

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByLabelText('Data de Criação') as HTMLInputElement

    expect(input.value).toBe('20/04/2023')
  })

  it('deve chamar handleChange com null ao limpar a data', async () => {
    const mockHandleChange = jest.fn()

    render(
      <CreatedAtFilter
        date={moment('20/04/2023', 'DD/MM/YYYY').toDate()}
        handleChange={mockHandleChange}
      />
    )

    const input = screen.getByLabelText('Data de Criação')

    // Simula limpar o campo
    fireEvent.change(input, { target: { value: '' } })

    await waitFor(() => {
      expect(mockHandleChange).toHaveBeenCalled()
      expect(mockHandleChange).toHaveBeenCalledWith('createdAt', null)
    })
  })
})
