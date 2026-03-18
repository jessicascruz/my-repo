import SearchBox from '@/presentation/components/forRoutes/home/components/search/Search';
import { render, screen } from '@testing-library/react';

describe('SearchBox', () => {
  it('deve renderizar corretamente', () => {
    render(<SearchBox />);

    // Verifica se o ícone de pesquisa está presente usando o data-testid
    const searchIcon = screen.getByTestId('SearchIcon');
    expect(searchIcon).toBeInTheDocument();
  });
});
