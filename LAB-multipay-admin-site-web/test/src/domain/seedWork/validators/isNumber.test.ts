import { isNumber } from '@/domain/seedWork/validators/isNumber'

describe('isNumber', () => {
  it('should return true for valid numbers', () => {
    expect(isNumber('123')).toBe(true)
    expect(isNumber(123)).toBe(true)
    expect(isNumber('12.34')).toBe(true)
    expect(isNumber(12.34)).toBe(true)
    expect(isNumber('-123')).toBe(true)
    expect(isNumber(-123)).toBe(true)
    expect(isNumber('0')).toBe(true)
    expect(isNumber(0)).toBe(true)
  })
})
