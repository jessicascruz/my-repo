// date-range.test.ts
import moment from 'moment'
import { DateRange } from '@/domain/aggregates/filter/dateRange'

describe('DateRange', () => {
  describe('Constructor', () => {
    it('should create instance with no dates', () => {
      const dateRange = new DateRange()
      expect(dateRange.start).toBeUndefined()
      expect(dateRange.end).toBeUndefined()
    })

    it('should create instance with start date only', () => {
      const startDate = '2023-01-01'
      const dateRange = new DateRange(startDate)
      expect(dateRange.start).toBe(startDate)
      expect(dateRange.end).toBeUndefined()
    })

    it('should create instance with both dates', () => {
      const startDate = '2023-01-01'
      const endDate = '2023-01-31'
      const dateRange = new DateRange(startDate, endDate)
      expect(dateRange.start).toBe(startDate)
      expect(dateRange.end).toBe(endDate)
    })
  })

  describe('toQueryParams', () => {
    it('should return empty array when no dates are set', () => {
      const dateRange = new DateRange()
      expect(dateRange.toQueryParams()).toEqual([])
    })

    it('should return only start date param when end is not set', () => {
      const startDate = '2023-01-01'
      const dateRange = new DateRange(startDate)
      const params = dateRange.toQueryParams()
      expect(params).toHaveLength(1)
      expect(params[0]).toBe(`dateStart=${encodeURIComponent(startDate)}`)
    })

    it('should return both params when dates are set', () => {
      const startDate = '2023-01-01'
      const endDate = '2023-01-31'
      const dateRange = new DateRange(startDate, endDate)
      const params = dateRange.toQueryParams()
      expect(params).toHaveLength(2)
      expect(params).toContain(`dateStart=${encodeURIComponent(startDate)}`)
      expect(params).toContain(`dateEnd=${encodeURIComponent(endDate)}`)
    })

    it('should properly encode special characters in dates', () => {
      const startDate = '2023-01-01T00:00:00+00:00'
      const dateRange = new DateRange(startDate)
      const params = dateRange.toQueryParams()
      expect(params[0]).toBe(`dateStart=${encodeURIComponent(startDate)}`)
    })
  })

  describe('fromDates', () => {
    it('should return empty DateRange when no dates provided', () => {
      const dateRange = DateRange.fromDates()
      expect(dateRange.start).toBeUndefined()
      expect(dateRange.end).toBeUndefined()
    })

    it('should create DateRange with formatted start date only', () => {
      const startDate = new Date(2023, 0, 1)
      const dateRange = DateRange.fromDates(startDate)

      const expectedStart = moment(startDate)
        .startOf('day')
        .format('YYYY-MM-DDTHH:mm:ssZ')
      expect(dateRange.start).toBe(expectedStart)
      expect(dateRange.end).toBeUndefined()
    })

    it('should create DateRange with formatted end date only', () => {
      const endDate = new Date(2023, 0, 31)
      const dateRange = DateRange.fromDates(undefined, endDate)

      const expectedEnd = moment(endDate)
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ssZ')
      expect(dateRange.start).toBeUndefined()
      expect(dateRange.end).toBe(expectedEnd)
    })

    it('should create DateRange with both formatted dates', () => {
      const startDate = new Date(2023, 0, 1)
      const endDate = new Date(2023, 0, 31)
      const dateRange = DateRange.fromDates(startDate, endDate)

      const expectedStart = moment(startDate)
        .startOf('day')
        .format('YYYY-MM-DDTHH:mm:ssZ')
      const expectedEnd = moment(endDate)
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ssZ')

      expect(dateRange.start).toBe(expectedStart)
      expect(dateRange.end).toBe(expectedEnd)
    })

    it('should handle timezone correctly in formatting', () => {
      const date = new Date(2023, 0, 1)
      const dateRange = DateRange.fromDates(date)

      // Verifica se o formato inclui o timezone
      expect(dateRange.start).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}/
      )
    })
  })

  describe('Integration', () => {
    it('should create from Dates and convert to query params correctly', () => {
      const startDate = new Date(2023, 0, 1)
      const endDate = new Date(2023, 0, 31)

      const dateRange = DateRange.fromDates(startDate, endDate)
      const params = dateRange.toQueryParams()

      const expectedStart = moment(startDate)
        .startOf('day')
        .format('YYYY-MM-DDTHH:mm:ssZ')
      const expectedEnd = moment(endDate)
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ssZ')

      expect(params).toContain(`dateStart=${encodeURIComponent(expectedStart)}`)
      expect(params).toContain(`dateEnd=${encodeURIComponent(expectedEnd)}`)
    })
  })
})
