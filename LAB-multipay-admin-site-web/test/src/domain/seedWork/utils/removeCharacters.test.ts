import { removeCharacters } from '@/domain/seedWork/utils/removeCharacters';

describe('removeCharacters', () => {
    it('should remove all non-digit characters from a string', () => {
        expect(removeCharacters('abc123def456')).toBe('123456');
        expect(removeCharacters('123-456-789')).toBe('123456789');
        expect(removeCharacters('(123) 456-7890')).toBe('1234567890');
    });

    it('should return empty string when input contains no digits', () => {
        expect(removeCharacters('abc')).toBe('');
        expect(removeCharacters('!@#$%^&*()')).toBe('');
        expect(removeCharacters('')).toBe('');
    });

    it('should return the original string when input is null or undefined', () => {
        expect(removeCharacters(null)).toBe(null);
        expect(removeCharacters(undefined)).toBe(undefined);
    });

    it('should handle strings with only digits', () => {
        expect(removeCharacters('123456')).toBe('123456');
    });
});
