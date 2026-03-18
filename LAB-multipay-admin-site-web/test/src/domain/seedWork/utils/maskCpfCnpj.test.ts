import { maskCpfCnpj } from '@/domain/seedWork/utils/maskCpfCnpj'

describe('maskCpfCnpj', () => {
  it('should return empty string when input is empty', () => {
    expect(maskCpfCnpj('')).toBe('')
  })

  describe('CPF formatting', () => {
    it('should format partial CPF (3 digits)', () => {
      expect(maskCpfCnpj('123')).toBe('123')
    })

    it('should format partial CPF (6 digits)', () => {
      expect(maskCpfCnpj('123456')).toBe('123.456')
    })

    it('should format partial CPF (9 digits)', () => {
      expect(maskCpfCnpj('123456789')).toBe('123.456.789')
    })

    it('should format complete CPF (11 digits)', () => {
      expect(maskCpfCnpj('12345678901')).toBe('123.456.789-01')
    })
  })

  describe('CNPJ formatting', () => {
    it('should format partial CNPJ (2 digits)', () => {
      expect(maskCpfCnpj('12')).toBe('12')
    })

    it('should format partial CNPJ (12 digits)', () => {
      expect(maskCpfCnpj('123456789012')).toBe('12.345.678/9012')
    })

    it('should format complete CNPJ (14 digits)', () => {
      expect(maskCpfCnpj('12345678901234')).toBe('12.345.678/9012-34')
    })

    it('should format CNPJ with extra digits (limit to 14)', () => {
      expect(maskCpfCnpj('12345678901234567890')).toBe('12.345.678/9012-34')
    })
  })

  describe('Edge cases', () => {
    it('should handle input with only non-digit characters', () => {
      expect(maskCpfCnpj('abc...//--')).toBe('')
    })

    it('should handle input with spaces', () => {
      expect(maskCpfCnpj(' 123 456 789 01 ')).toBe('123.456.789-01')
    })

    it('should handle already formatted CPF', () => {
      expect(maskCpfCnpj('123.456.789-01')).toBe('123.456.789-01')
    })

    it('should handle already formatted CNPJ', () => {
      expect(maskCpfCnpj('12.345.678/9012-34')).toBe('12.345.678/9012-34')
    })
  })
})
