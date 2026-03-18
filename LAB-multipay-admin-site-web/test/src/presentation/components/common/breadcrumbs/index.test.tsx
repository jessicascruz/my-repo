import { render, screen } from '@testing-library/react';
import { BreadcrumbsComponent } from '@/presentation/components/common/breadcrumb';
import { useParams, usePathname, useSearchParams } from 'next/navigation';

// Mock next/navigation hooks
jest.mock('next/navigation', () => ({
    useParams: jest.fn(),
    usePathname: jest.fn(),
    useSearchParams: jest.fn(),
}));

describe('BreadcrumbsComponent', () => {
    const mockUseParams = useParams as jest.Mock;
    const mockUsePathname = usePathname as jest.Mock;
    const mockUseSearchParams = useSearchParams as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSearchParams.mockReturnValue(new URLSearchParams(''));
    });

    it('should render home breadcrumb when not on home page', () => {
        mockUsePathname.mockReturnValue('/order');
        mockUseParams.mockReturnValue({});

        render(<BreadcrumbsComponent />);

        expect(screen.getByText('Página Inicial')).toBeInTheDocument();
        expect(screen.getByText('Ordens')).toBeInTheDocument();
    });

    it('should render order details breadcrumb with correct links', () => {
        mockUsePathname.mockReturnValue('/order/123/details');
        mockUseParams.mockReturnValue({ id: '123' });
        mockUseSearchParams.mockReturnValue(new URLSearchParams('status=pending'));

        render(<BreadcrumbsComponent />);

        expect(screen.getByText('Página Inicial')).toBeInTheDocument();
        expect(screen.getByText('Ordens')).toBeInTheDocument();
        expect(screen.getByText('Detalhes')).toBeInTheDocument();
    });

    it('should filter out numeric segments from path', () => {
        mockUsePathname.mockReturnValue('/order/123/details/456');
        mockUseParams.mockReturnValue({ id: '123' });

        render(<BreadcrumbsComponent />);

        expect(screen.getByText('Página Inicial')).toBeInTheDocument();
        expect(screen.getByText('Ordens')).toBeInTheDocument();
        expect(screen.getByText('Detalhes')).toBeInTheDocument();
        // Should not show the numeric segments
        expect(screen.queryByText('123')).not.toBeInTheDocument();
        expect(screen.queryByText('456')).not.toBeInTheDocument();
        expect(screen.getByText('Ordens').textContent).toBe('Ordens');
    });

    it('should render refund breadcrumb', () => {
        mockUsePathname.mockReturnValue('/refund');
        mockUseParams.mockReturnValue({});

        render(<BreadcrumbsComponent />);

        expect(screen.getByText('Página Inicial')).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Estorno'))).toBeInTheDocument();
    });

    it('should preserve search params in links', () => {
        mockUsePathname.mockReturnValue('/order/123/details');
        mockUseParams.mockReturnValue({ id: '123' });
        mockUseSearchParams.mockReturnValue(new URLSearchParams('status=pending&type=refund'));

        render(<BreadcrumbsComponent />);

        const homeLink = screen.getByText('Página Inicial').closest('a');
        expect(homeLink).toHaveAttribute('href', '/home?status=pending&type=refund');
    });

    it('should handle translations based on last parameter', () => {
        mockUsePathname.mockReturnValue('/order/123/details');
        mockUseParams.mockReturnValue({ id: '123' });
        mockUseSearchParams.mockReturnValue(new URLSearchParams(''));

        render(<BreadcrumbsComponent />);

        // First item (not last) should be a link
        const homeLink = screen.getByText('Página Inicial').closest('a');
        expect(homeLink).toHaveAttribute('href', '/home?');

        // Middle item should be plain text
        expect(screen.getByText('Ordens').closest('a')).toBeNull();

        // Last item should be plain text
        expect(screen.getByText('Detalhes').closest('a')).toBeNull();
    });

    it('should use path segment as fallback when translation is undefined', () => {
        mockUsePathname.mockReturnValue('/unknown-path');
        mockUseParams.mockReturnValue({});
        mockUseSearchParams.mockReturnValue(new URLSearchParams(''));

        render(<BreadcrumbsComponent />);

        expect(screen.getByText('Página Inicial')).toBeInTheDocument();
        expect(screen.getByText('unknown-path')).toBeInTheDocument();
    });

    it('should render refund breadcrumb', () => {
        mockUsePathname.mockReturnValue('/refund');
        mockUseParams.mockReturnValue({});

        render(<BreadcrumbsComponent />);

        expect(screen.getByText('Página Inicial')).toBeInTheDocument();
        expect(screen.getByText((content) => content.includes('Estorno'))).toBeInTheDocument();
    });
});
