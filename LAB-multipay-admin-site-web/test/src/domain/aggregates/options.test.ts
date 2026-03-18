// options.test.ts
import {
  systemsOptions,
  statusOptions,
  companyOptions,
} from '@/domain/aggregates/options'

describe('Options', () => {
  describe('systemsOptions', () => {
    it('should be an array of system options', () => {
      expect(Array.isArray(systemsOptions)).toBe(true)
      expect(systemsOptions.length).toBeGreaterThan(0)
    })

    it('each system option should have value and label properties', () => {
      systemsOptions.forEach(option => {
        expect(option).toHaveProperty('value')
        expect(option).toHaveProperty('label')
        expect(typeof option.value).toBe('number')
        expect(typeof option.label).toBe('string')
      })
    })

    it('should have unique values', () => {
      const values = systemsOptions.map(option => option.value)
      const uniqueValues = new Set(values)
      expect(values.length).toBe(uniqueValues.size)
    })

    it('should contain specific expected options', () => {
      const expectedOptions = [
        { value: 1, label: 'MERCURY' },
        { value: 11, label: 'MERCADO LIVRE' },
        { value: 21, label: 'MULTIHUB' },
        { value: 35, label: 'MANUAL - DIRETO NO ERP' },
      ]

      expectedOptions.forEach(expected => {
        expect(systemsOptions).toContainEqual(expected)
      })
    })

    it('should handle duplicate labels with different values', () => {
      const mercadoLivreOptions = systemsOptions.filter(
        opt => opt.label === 'MERCADO LIVRE'
      )
      expect(mercadoLivreOptions).toHaveLength(2)
      expect(mercadoLivreOptions[0].value).toBe(11)
      expect(mercadoLivreOptions[1].value).toBe(12)
    })
  })

  describe('statusOptions', () => {
    it('should be an array of status options', () => {
      expect(Array.isArray(statusOptions)).toBe(true)
      expect(statusOptions.length).toBeGreaterThan(0)
    })

    it('each status option should have value and label properties', () => {
      statusOptions.forEach(option => {
        expect(option).toHaveProperty('value')
        expect(option).toHaveProperty('label')
        expect(typeof option.value).toBe('string')
        expect(typeof option.label).toBe('string')
      })
    })

    it('should have unique values', () => {
      const values = statusOptions.map(option => option.value)
      const uniqueValues = new Set(values)
      expect(values.length).toBe(uniqueValues.size)
    })

    it('should contain all expected statuses', () => {
      const expectedStatuses = [
        'CREATED',
        'VIEWED',
        'PENDING',
        'AUTHORIZED',
        'CONFIRMED',
        'DETECTION',
        'RECOVERY',
        'CANCELED',
        'DENIED',
        'REFUNDED',
        'EXPIRED',
      ]

      expectedStatuses.forEach(status => {
        expect(statusOptions.some(opt => opt.value === status)).toBe(true)
      })
    })
  })

  describe('companyOptions', () => {
    it('should be an array of company options', () => {
      expect(Array.isArray(companyOptions)).toBe(true)
      expect(companyOptions.length).toBeGreaterThan(0)
    })

    it('each company option should have value and label properties', () => {
      companyOptions.forEach(option => {
        expect(option).toHaveProperty('value')
        expect(option).toHaveProperty('label')
        expect(typeof option.value).toBe('string')
        expect(typeof option.label).toBe('string')
      })
    })

    it('should have unique values', () => {
      const values = companyOptions.map(option => option.value)
      const uniqueValues = new Set(values)
      expect(values.length).toBe(uniqueValues.size)
    })

    it('should contain all expected companies', () => {
      const expectedCompanies = [
        'Multilaser',
        'Multicomponentes',
        'Giga',
        'Giga 2',
        'Watts',
      ]

      expectedCompanies.forEach(company => {
        expect(companyOptions.some(opt => opt.value === company)).toBe(true)
      })
    })

    it('should have matching value and label for Giga and Watts', () => {
      const gigaOption = companyOptions.find(opt => opt.value === 'Giga')
      const wattsOption = companyOptions.find(opt => opt.value === 'Watts')

      expect(gigaOption?.label).toContain('Giga')
      expect(wattsOption?.label).toContain('Watts')
    })
  })
})
