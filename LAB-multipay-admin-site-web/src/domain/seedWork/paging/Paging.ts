import IPaging from './IPaging'

export class Paging implements IPaging {
  currentPage: number
  pages: number
  perPage: number
  total: number

  constructor(
    currentPage: number = 1,
    pages: number = 0,
    perPage: number = 10,
    total: number = 0
  ) {
    this.currentPage = currentPage
    this.pages = pages
    this.perPage = perPage
    this.total = total
  }
}
