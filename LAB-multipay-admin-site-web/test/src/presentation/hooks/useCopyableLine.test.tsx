import { renderHook, act } from '@testing-library/react'
import { useCopyableLine } from '@/presentation/hooks/useCopyableLine'
import { toast } from 'react-toastify'

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
    },
}))

describe('useCopyableLine', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useCopyableLine('test', 'Test'))

        expect(result.current.copyIcon).toEqual({
            icon: 'material-symbols:link-rounded',
            color: '',
            label: 'Copiar',
        })
    })

    it('should show error toast when trying to copy empty value', () => {
        const { result } = renderHook(() => useCopyableLine('', 'Test'))

        act(() => {
            result.current.handleCopy()
        })

        expect(toast.error).toHaveBeenCalledWith('Test inválido. Não foi possível copiar.')
    })

    it('should copy text to clipboard and update icon state', async () => {
        const mockClipboard = {
            writeText: jest.fn().mockResolvedValue(undefined),
        }
        Object.assign(navigator, {
            clipboard: mockClipboard,
        })

        const { result } = renderHook(() => useCopyableLine('test value', 'Test'))

        await act(async () => {
            result.current.handleCopy()
        })

        expect(mockClipboard.writeText).toHaveBeenCalledWith('test value')
        expect(result.current.copyIcon).toEqual({
            icon: 'material-symbols:link-rounded',
            color: '#10b122',
            label: 'Copiado',
        })

        act(() => {
            jest.advanceTimersByTime(1000)
        })

        expect(result.current.copyIcon).toEqual({
            icon: 'material-symbols:link-rounded',
            color: 'var(--primary-main)',
            label: 'Copiar',
        })
    })

    it('should show error toast when clipboard write fails', async () => {
        const mockClipboard = {
            writeText: jest.fn().mockRejectedValue(new Error('Clipboard error')),
        }
        Object.assign(navigator, {
            clipboard: mockClipboard,
        })

        const { result } = renderHook(() => useCopyableLine('test value', 'Test'))

        await act(async () => {
            result.current.handleCopy()
        })

        expect(toast.error).toHaveBeenCalledWith('Erro ao copiar o Test Error: Clipboard error')
    })
})
