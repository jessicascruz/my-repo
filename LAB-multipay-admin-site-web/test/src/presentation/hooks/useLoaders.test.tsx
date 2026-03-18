import { renderHook, act } from '@testing-library/react';
import { useContext } from 'react';
import useLoaders from '@/presentation/hooks/useLoaders';
import { LoaderContext } from '@/presentation/providers/LoaderProvider';

// Mock the useContext hook
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useContext: jest.fn(),
}));

describe('useLoaders', () => {
    const mockContext = {
        startLoading: jest.fn(),
        stopLoading: jest.fn(),
        isLoading: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return the loader context when used within LoaderProvider', () => {
        // Mock useContext to return our mock context
        (useContext as jest.Mock).mockReturnValue(mockContext);

        const { result } = renderHook(() => useLoaders());

        expect(result.current).toEqual(mockContext);
        expect(useContext).toHaveBeenCalledWith(LoaderContext);
    });

    it('should throw an error when used outside LoaderProvider', () => {
        // Mock useContext to return undefined (simulating usage outside provider)
        (useContext as jest.Mock).mockReturnValue(undefined);

        expect(() => {
            renderHook(() => useLoaders());
        }).toThrow('useLoaders must be used within a LoaderProvider');
    });

    it('should provide working loading state management', () => {
        // Mock useContext to return our mock context
        (useContext as jest.Mock).mockReturnValue(mockContext);

        const { result } = renderHook(() => useLoaders());

        act(() => {
            result.current.startLoading();
        });

        expect(mockContext.startLoading).toHaveBeenCalled();

        act(() => {
            result.current.stopLoading();
        });

        expect(mockContext.stopLoading).toHaveBeenCalled();
    });
});
