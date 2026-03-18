import { DateRange } from './dateRange'
import { Sort, SortCriteria } from './sort'

export class FilterPaging {
  constructor(
    public page: number = 1,
    public perPage: number = 10,
    public sort: Sort = Sort.Date,
    public sortCriteria: SortCriteria = SortCriteria.Descending
  ) {}

  toQueryParams(): string[] {
    return [
      `page=${this.page}`,
      `perPage=${this.perPage}`,
      `sort=${this.sort}`,
      `sortCriteria=${this.sortCriteria}`,
    ]
  }

  static fromParams(params: URLSearchParams): FilterPaging {
    const safeParseInt = (
      value: string | null,
      defaultValue: number
    ): number => {
      if (value === null) return defaultValue
      const parsed = parseInt(value, 10)
      return Number.isNaN(parsed) ? defaultValue : parsed
    }

    return new FilterPaging(
      safeParseInt(params.get('page'), 1),
      safeParseInt(params.get('perPage'), 10),
      (params.get('sort') as Sort) ?? Sort.Date,
      (params.get('sortCriteria') as SortCriteria) ?? SortCriteria.Descending
    )
  }
}

export class Filter {
  public paging: FilterPaging
  public orderId?: string
  public referenceId?: string
  public createdAt?: string
  public status?: string
  public systemId?: number
  public company?: string
  public businessPartnerId?: string
  public businessPartnerEmail?: string
  public businessPartnerDocumentNumber?: string
  public dateRange?: DateRange

  constructor({
    paging = new FilterPaging(),
    orderId,
    referenceId,
    createdAt,
    status,
    systemId,
    company,
    businessPartnerId,
    businessPartnerEmail,
    businessPartnerDocumentNumber,
    dateRange,
  }: Partial<Filter> = {}) {
    this.paging = paging
    this.orderId = orderId
    this.referenceId = referenceId
    this.createdAt = createdAt
    this.status = status
    this.systemId = systemId
    this.company = company
    this.businessPartnerId = businessPartnerId
    this.businessPartnerEmail = businessPartnerEmail
    this.businessPartnerDocumentNumber = businessPartnerDocumentNumber
    this.dateRange = dateRange
  }

  toQueryString(): string {
    const params: string[] = []

    for (const [key, value] of Object.entries(this)) {
      if (value === null || value === undefined || value === '') continue

      if (value instanceof FilterPaging) {
        params.push(...value.toQueryParams())
      } else if (value instanceof DateRange) {
        params.push(...value.toQueryParams())
      } else {
        params.push(`${key}=${encodeURIComponent(String(value))}`)
      }
    }

    return params.join('&')
  }

  mapFilled(): Record<string, string> {
    const mapped: Record<string, string> = {
      orderId: this.orderId ?? '',
      referenceId: this.referenceId ?? '',
      createdAt: this.createdAt ?? '',
      status: this.status ?? '',
      systemId: this.systemId?.toString() ?? '',
      company: this.company ?? '',
      businessPartnerId: this.businessPartnerId ?? '',
      businessPartnerEmail: this.businessPartnerEmail ?? '',
      businessPartnerDocumentNumber: this.businessPartnerDocumentNumber ?? '',
      start: this.dateRange?.start ?? '',
      end: this.dateRange?.end ?? '',
      page: this.paging.page.toString(),
      perPage: this.paging.perPage.toString(),
      sort: this.paging.sort,
      sortCriteria: this.paging.sortCriteria,
    }

    return Object.fromEntries(
      Object.entries(mapped).filter(
        ([_, value]) => value !== null && value !== ''
      )
    )
  }

  mapToSearchParams(): string {
    return new URLSearchParams(this.mapFilled()).toString()
  }

  static fromSearchParams(search: string): Filter {
    const params = new URLSearchParams(search)

    const dateRange = new DateRange(
      params.get('dateStart') ?? undefined,
      params.get('dateEnd') ?? undefined
    )
    return new Filter({
      paging: FilterPaging.fromParams(params),
      orderId: params.get('orderId') ?? undefined,
      referenceId: params.get('referenceId') ?? undefined,
      createdAt: params.get('createdAt') ?? undefined,
      status: params.get('status') ?? undefined,
      systemId: params.has('systemId')
        ? Number(params.get('systemId'))
        : undefined,
      company: params.get('company') ?? undefined,
      businessPartnerId: params.get('businessPartnerId') ?? undefined,
      businessPartnerEmail: params.get('businessPartnerEmail') ?? undefined,
      businessPartnerDocumentNumber:
        params.get('businessPartnerDocumentNumber') ?? undefined,
      dateRange,
    })
  }
}
