import ISearch from "@/domain/seedWork/paging/ISearch"
import { Paging } from "@/domain/seedWork/paging/Paging"
import { Search } from "@/domain/seedWork/paging/Search"

describe('Search', () => {
  interface MockData {
    id: string
    name: string
  }

  it('should create with default empty values', () => {
    const search = new Search<MockData>()

    expect(search.data).toEqual([])
    expect(search.paging).toBeInstanceOf(Paging)
    expect(search.paging.currentPage).toBe(1)

    // Verifica se implementa a interface ISearch
    expect(search).toMatchObject<ISearch<MockData>>({
      data: expect.any(Array),
      paging: expect.objectContaining({
        currentPage: expect.any(Number),
        pages: expect.any(Number),
        perPage: expect.any(Number),
        total: expect.any(Number),
      }),
    })
  })

  it('should create with custom data and paging', () => {
    const mockData = [{ id: '1', name: 'Test' }]
    const customPaging = new Paging(2, 3, 10, 30)
    const search = new Search<MockData>(mockData, customPaging)

    expect(search.data).toEqual(mockData)
    expect(search.paging).toBe(customPaging)
    expect(search.paging.currentPage).toBe(2)
  })

  it('should allow modification of data and paging', () => {
    const search = new Search<MockData>()

    const newData = [{ id: '2', name: 'Updated' }]
    const newPaging = new Paging(3, 5, 15, 75)

    search.data = newData
    search.paging = newPaging

    expect(search.data).toEqual(newData)
    expect(search.paging).toBe(newPaging)
  })

  it('should work with different data types', () => {
    const numberSearch = new Search<number>([1, 2, 3])
    expect(numberSearch.data).toEqual([1, 2, 3])

    const stringSearch = new Search<string>(['a', 'b', 'c'])
    expect(stringSearch.data).toEqual(['a', 'b', 'c'])
  })

  it('should maintain reference to paging object', () => {
    const paging = new Paging()
    const search = new Search<MockData>([], paging)

    paging.currentPage = 5

    expect(search.paging.currentPage).toBe(5)
  })
})
