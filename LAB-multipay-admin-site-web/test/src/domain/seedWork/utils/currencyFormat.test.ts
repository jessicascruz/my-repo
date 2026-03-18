import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'

describe('formatToBrlCurrency', () => {
  it('should format number to BRL currency', () => {
    expect(formatToBrlCurrency(1000)).toBe('R$ 1.000,00')
    expect(formatToBrlCurrency(1234.56)).toBe('R$ 1.234,56')
    expect(formatToBrlCurrency(0.99)).toBe('R$ 0,99')
    expect(formatToBrlCurrency(999999.99)).toBe('R$ 999.999,99')
  })

  it('should handle negative numbers', () => {
    expect(formatToBrlCurrency(-1000)).toBe('-R$ 1.000,00')
    expect(formatToBrlCurrency(-1234.56)).toBe('-R$ 1.234,56')
  })

  it('should return string input unchanged', () => {
    expect(formatToBrlCurrency('R$ 1.000,00')).toBe('R$ 1.000,00')
    expect(formatToBrlCurrency('1000')).toBe('1000')
    expect(formatToBrlCurrency('abc')).toBe('abc')
    expect(formatToBrlCurrency('')).toBe('')
  })

  it('should handle edge cases', () => {
    expect(formatToBrlCurrency(0)).toBe('R$ 0,00')
    expect(formatToBrlCurrency(NaN)).toBe('NaN')
    expect(formatToBrlCurrency(Infinity)).toBe('Infinity')
    expect(formatToBrlCurrency(-Infinity)).toBe('-Infinity')
  })
})
