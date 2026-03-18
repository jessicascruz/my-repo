import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'

describe('Date format utils', () => {
  describe('isoToLocalePtBr', () => {
    it('formats ISO date strings to pt-BR format in UTC', () => {
      const mockDateString = '2025-05-26T14:00:00' // sem timezone, tratado como UTC
      const mockTimezoneDateString = '2025-05-26T14:00:00Z' // explícito UTC

      // Espera exatamente o que vem do UTC, sem conversão de fuso
      expect(isoToLocalePtBr(mockDateString)).toBe('26/05/2025 14:00:00')
      expect(isoToLocalePtBr(mockTimezoneDateString)).toBe('26/05/2025 14:00:00')
    })

    it('returns empty string if no date is provided', () => {
      expect(isoToLocalePtBr()).toBe('')
    })

    it('returns empty string for invalid formats', () => {
      expect(isoToLocalePtBr('not a date')).toBe('')
      expect(isoToLocalePtBr(new Date().toUTCString())).toBe('')
      expect(isoToLocalePtBr(new Date().toDateString())).toBe('')
    })
  })
})
