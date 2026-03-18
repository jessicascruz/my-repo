import { render, screen, fireEvent } from '@testing-library/react';
import { MonetaryInput } from '@/presentation/components/forRoutes/order/refund/components/MonetaryInput';
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat';

describe('MonetaryInput', () => {
    const mockOnChange = jest.fn();
    const defaultProps = {
        value: 'R$ 0,00',
        onChange: mockOnChange,
        label: 'Test Label',
    };

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('renders with basic props', () => {
        render(<MonetaryInput {...defaultProps} />);

        expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
        expect(screen.getByDisplayValue('R$ 0,00')).toBeInTheDocument();
    });

    it('formats input value as currency', () => {
        render(<MonetaryInput {...defaultProps} />);
        const input = screen.getByLabelText('Test Label');

        fireEvent.change(input, { target: { value: '123456' } });

        expect(mockOnChange).toHaveBeenCalledWith(expect.stringMatching(/^R\$[ \u00A0]1\.234,56$/));
    });

    it('handles zero value correctly', () => {
        render(<MonetaryInput {...defaultProps} />);
        const input = screen.getByLabelText('Test Label');

        fireEvent.change(input, { target: { value: 'R$ 0,0' } });

        expect(mockOnChange).toHaveBeenCalledWith(expect.stringMatching(/^R\$[ \u00A0]0,00$/));
    });

    it('enforces maximum value limit', () => {
        const maxValue = 1000;
        render(<MonetaryInput {...defaultProps} maxValue={maxValue} />);
        const input = screen.getByLabelText('Test Label');

        fireEvent.change(input, { target: { value: '200000' } });

        expect(mockOnChange).toHaveBeenCalledWith(formatToBrlCurrency(maxValue));
        expect(screen.getByText(/O valor máximo é de R\$[ \u00A0]1\.000,00/)).toBeInTheDocument();
    });

    it('removes non-numeric characters from input', () => {
        render(<MonetaryInput {...defaultProps} />);
        const input = screen.getByLabelText('Test Label');

        fireEvent.change(input, { target: { value: 'abc123def456' } });

        expect(mockOnChange).toHaveBeenCalledWith(expect.stringMatching(/^R\$[ \u00A0]1\.234,56$/));
    });

    it('handles empty input gracefully', () => {
        render(<MonetaryInput {...defaultProps} />);
        const input = screen.getByLabelText('Test Label');

        fireEvent.change(input, { target: { value: '' } });

        expect(mockOnChange).toHaveBeenCalledWith(expect.stringMatching(/^R\$[ \u00A0]0,00$/));
    });

    it('maintains currency format when typing', () => {
        render(<MonetaryInput {...defaultProps} />);
        const input = screen.getByLabelText('Test Label');

        fireEvent.change(input, { target: { value: '123' } });
        expect(mockOnChange).toHaveBeenCalledWith(expect.stringMatching(/^R\$[ \u00A0]1,23$/));

        fireEvent.change(input, { target: { value: '1234' } });
        expect(mockOnChange).toHaveBeenCalledWith(expect.stringMatching(/^R\$[ \u00A0]12,34$/));
    });
});
