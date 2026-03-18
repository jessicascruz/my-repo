import Provider from '@/presentation/components/forRoutes/order/details/components/provider/Provider';
import { render, screen } from '@testing-library/react';

describe('Provider', () => {
  it("deve renderizar o texto 'Provedores'", () => {
    render(<Provider />);
    expect(screen.getByText('Provedores')).toBeInTheDocument();
  });
});
