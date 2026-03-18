// filter.test.ts
import { Filter, FilterPaging } from '@/domain/aggregates/filter/filter'
import { DateRange } from '@/domain/aggregates/filter/dateRange'
import { Sort, SortCriteria } from '@/domain/aggregates/filter/sort'

describe('FilterPaging', () => {
  describe('Constructor', () => {
    it('should initialize with default values', () => {
      const paging = new FilterPaging()
      expect(paging.page).toBe(1)
      expect(paging.perPage).toBe(10)
      expect(paging.sort).toBe(Sort.Date)
      expect(paging.sortCriteria).toBe(SortCriteria.Descending)
    })

    it('should initialize with custom values', () => {
      const paging = new FilterPaging(2, 20, Sort.Date, SortCriteria.Descending)
      expect(paging.page).toBe(2)
      expect(paging.perPage).toBe(20)
      expect(paging.sort).toBe(Sort.Date) // Only Date is available in Sort enum
      expect(paging.sortCriteria).toBe(SortCriteria.Descending)
    })
  })

  describe('toQueryParams', () => {
    it('should return correct query params', () => {
      const paging = new FilterPaging(3, 15, Sort.Date, SortCriteria.Descending)
      const params = paging.toQueryParams()
      expect(params).toEqual([
        'page=3',
        'perPage=15',
        `sort=${Sort.Date}`,
        `sortCriteria=${SortCriteria.Descending}`,
      ])
    })
  })

  describe('fromParams', () => {
    it('should create from URLSearchParams with defaults', () => {
      const params = new URLSearchParams()
      const paging = FilterPaging.fromParams(params)
      expect(paging.page).toBe(1)
      expect(paging.perPage).toBe(10)
      expect(paging.sort).toBe(Sort.Date)
      expect(paging.sortCriteria).toBe(SortCriteria.Descending)
    })

    it('should create from URLSearchParams with custom values', () => {
      const params = new URLSearchParams()
      params.set('page', '5')
      params.set('perPage', '25')
      params.set('sort', Sort.Date)
      params.set('sortCriteria', SortCriteria.Descending)

      const paging = FilterPaging.fromParams(params)
      expect(paging.page).toBe(5)
      expect(paging.perPage).toBe(25)
      expect(paging.sort).toBe(Sort.Date) // Only Date is available in Sort enum
      expect(paging.sortCriteria).toBe(SortCriteria.Descending)
    })

    it('should handle invalid number values', () => {
      const params = new URLSearchParams()
      params.set('page', 'invalid')
      params.set('perPage', 'NaN')

      const paging = FilterPaging.fromParams(params)
      expect(paging.page).toBe(1) // fallback to default
      expect(paging.perPage).toBe(10) // fallback to default
    })
  })
})

describe('Filter', () => {
  describe('Constructor', () => {
    it('should initialize with default values', () => {
      const filter = new Filter()
      expect(filter.paging).toBeInstanceOf(FilterPaging)
      expect(filter.orderId).toBeUndefined()
      expect(filter.dateRange).toBeUndefined()
    })

    it('should initialize with custom values', () => {
      const dateRange = new DateRange('2023-01-01', '2023-01-31')
      const filter = new Filter({
        orderId: '123',
        referenceId: 'ref-456',
        dateRange,
        paging: new FilterPaging(2, 20),
      })

      expect(filter.orderId).toBe('123')
      expect(filter.referenceId).toBe('ref-456')
      expect(filter.dateRange).toBe(dateRange)
      expect(filter.paging.page).toBe(2)
      expect(filter.paging.perPage).toBe(20)
    })
  })

  describe('toQueryString', () => {
    it('should return empty string for empty filter', () => {
      const filter = new Filter()
      expect(filter.toQueryString()).not.toBe('')
    })

    it('should include paging params', () => {
      const filter = new Filter({
        paging: new FilterPaging(2, 15),
      })
      expect(filter.toQueryString()).toBe(
        'page=2&perPage=15&sort=Date&sortCriteria=Descending'
      )
    })

    it('should include date range params', () => {
      const filter = new Filter({
        dateRange: new DateRange('2023-01-01', '2023-01-31'),
      })
      expect(filter.toQueryString()).toContain('dateStart=2023-01-01')
      expect(filter.toQueryString()).toContain('dateEnd=2023-01-31')
    })

    it('should include other filter params', () => {
      const filter = new Filter({
        orderId: '123',
        status: 'PENDING',
      })
      expect(filter.toQueryString()).toContain('orderId=123')
      expect(filter.toQueryString()).toContain('status=PENDING')
    })

    it('should encode special characters', () => {
      const filter = new Filter({
        businessPartnerEmail: 'user@example.com',
      })
      expect(filter.toQueryString()).toContain(
        'businessPartnerEmail=user%40example.com'
      )
    })
  })

  describe('mapFilled', () => {
    it('should only include filled values', () => {
      const filter = new Filter({
        orderId: '123',
        status: 'PENDING',
        paging: new FilterPaging(2),
      })

      const mapped = filter.mapFilled()
      expect(mapped.orderId).toBe('123')
      expect(mapped.status).toBe('PENDING')
      expect(mapped.page).toBe('2')
      expect(mapped.perPage).toBe('10') // default included
      expect(mapped.createdAt).toBeUndefined() // not set
    })

    it('should convert numbers to strings', () => {
      const filter = new Filter({
        systemId: 5,
      })

      const mapped = filter.mapFilled()
      expect(mapped.systemId).toBe('5')
    })

    it('should handle date range', () => {
      const filter = new Filter({
        dateRange: new DateRange('2023-01-01'),
      })

      const mapped = filter.mapFilled()
      expect(mapped.start).toBe('2023-01-01')
      expect(mapped.end).toBeUndefined() // DateRange only adds params if values exist
    })
  })

  describe('mapToSearchParams', () => {
    it('should return URLSearchParams string', () => {
      const filter = new Filter({
        orderId: '123',
        paging: new FilterPaging(2),
      })

      const paramsString = filter.mapToSearchParams()
      expect(paramsString).toContain('orderId=123')
      expect(paramsString).toContain('page=2')
    })
  })

  describe('fromSearchParams', () => {
    it('should create from empty search params', () => {
      const filter = Filter.fromSearchParams('')
      expect(filter.orderId).toBeUndefined()
      expect(filter.paging.page).toBe(1) // default
    })

    it('should parse all filter fields', () => {
      const search =
        'orderId=123&status=PENDING&page=2&dateStart=2023-01-01&systemId=5'
      const filter = Filter.fromSearchParams(search)

      expect(filter.orderId).toBe('123')
      expect(filter.status).toBe('PENDING')
      expect(filter.paging.page).toBe(2)
      expect(filter.systemId).toBe(5)
      expect(filter.dateRange?.start).toBe('2023-01-01')
    })

    it('should handle number conversion for systemId', () => {
      const search = 'systemId=5'
      const filter = Filter.fromSearchParams(search)
      expect(filter.systemId).toBe(5)
    })

    it('should create date range when dateStart/dateEnd params exist', () => {
      const search = 'dateStart=2023-01-01&dateEnd=2023-01-31'
      const filter = Filter.fromSearchParams(search)

      expect(filter.dateRange).toBeInstanceOf(DateRange)
      expect(filter.dateRange?.start).toBe('2023-01-01')
      expect(filter.dateRange?.end).toBe('2023-01-31')
    })
  })

  describe('Integration', () => {
    it('should round-trip through query string', () => {
      const originalFilter = new Filter({
        orderId: '123',
        status: 'PENDING',
        paging: new FilterPaging(2, 15),
        dateRange: new DateRange('2023-01-01'),
      })

      const queryString = originalFilter.toQueryString()
      const parsedFilter = Filter.fromSearchParams(queryString)

      expect(parsedFilter.orderId).toBe(originalFilter.orderId)
      expect(parsedFilter.status).toBe(originalFilter.status)
      expect(parsedFilter.paging.page).toBe(originalFilter.paging.page)
      expect(parsedFilter.paging.perPage).toBe(originalFilter.paging.perPage)
      expect(parsedFilter.dateRange?.start).toBe(
        originalFilter.dateRange?.start
      )
    })
  })
})
