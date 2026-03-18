import { removeLetters } from '@/domain/seedWork/utils/removeLetters'

describe('removeLetters', () => {
    it('should remove all letters from a string', () => {
        expect(removeLetters('abc123')).toBe('123')
        expect(removeLetters('ABC123')).toBe('123')
        expect(removeLetters('aBc123')).toBe('123')
    })

    it('should handle strings with only letters', () => {
        expect(removeLetters('abc')).toBe('')
        expect(removeLetters('ABC')).toBe('')
        expect(removeLetters('aBc')).toBe('')
    })

    it('should handle strings with only numbers', () => {
        expect(removeLetters('123')).toBe('123')
        expect(removeLetters('456')).toBe('456')
    })

    it('should handle strings with special characters', () => {
        expect(removeLetters('abc123!@#')).toBe('123!@#')
        expect(removeLetters('ABC123!@#')).toBe('123!@#')
    })

    it('should handle empty string', () => {
        expect(removeLetters('')).toBe('')
    })

    it('should handle null or undefined input', () => {
        expect(removeLetters(null)).toBe(null)
        expect(removeLetters(undefined)).toBe(undefined)
    })
})
