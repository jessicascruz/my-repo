// sort.test.ts
import { Sort, SortCriteria } from '@/domain/aggregates/filter/sort'

describe('Sort Enums', () => {
  describe('Sort', () => {
    it('should have Date value', () => {
      expect(Sort.Date).toBe('Date')
    })

    it('should have only expected values', () => {
      const values = Object.values(Sort)
      expect(values).toEqual(['Date'])
      expect(values.length).toBe(1)
    })
  })

  describe('SortCriteria', () => {
    it('should have correct values', () => {
      expect(SortCriteria.Descending).toBe('Descending')
      expect(SortCriteria.Ascending).toBe('Ascending')
    })

    it('should have only expected values', () => {
      const values = Object.values(SortCriteria)
      expect(values).toEqual(['Ascending', 'Descending'])
      expect(values.length).toBe(2)
    })
  })

  describe('Integration', () => {
    it('should work together in FilterPaging', () => {
      // This is just a type check, no runtime assertion needed
      const validCombination: { sort: Sort; criteria: SortCriteria } = {
        sort: Sort.Date,
        criteria: SortCriteria.Descending,
      }

      expect(validCombination).toBeDefined()
    })
  })
})
