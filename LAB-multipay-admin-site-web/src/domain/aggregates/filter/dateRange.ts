import moment from 'moment'

export class DateRange {
  constructor(
    public start?: string,
    public end?: string
  ) {}

  toQueryParams(): string[] {
    const params: string[] = []
    if (this.start) params.push(`dateStart=${encodeURIComponent(this.start)}`)
    if (this.end) params.push(`dateEnd=${encodeURIComponent(this.end)}`)
    return params
  }

  static fromDates(start?: Date, end?: Date): DateRange {
    return new DateRange(
      start
        ? moment(start).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')
        : undefined,
      end ? moment(end).endOf('day').format('YYYY-MM-DDTHH:mm:ssZ') : undefined
    )
  }
}
