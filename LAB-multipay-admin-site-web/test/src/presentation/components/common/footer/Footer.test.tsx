import { render, screen } from "@testing-library/react";
import Footer from "@/presentation/components/common/footer/Footer";
import { ThemeProvider, createTheme } from "@mui/material/styles";

describe("Footer Component", () => {
  const theme = createTheme({
    breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  });

  beforeEach(() => {
    // Reset do mock para cada teste
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(max-width:600px)" ? true : false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // métodos antigos
      removeListener: jest.fn(),
      addEventListener: jest.fn(), // métodos modernos
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  test("Não renderiza em telas menores que 600px", () => {
    // Para esse teste, queremos que matches seja true para (max-width:600px)
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(max-width:600px)",
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <ThemeProvider theme={theme}>
        <Footer />
      </ThemeProvider>
    );

    const footerElement = screen.queryByText(/GRUPO MULTI/i);
    expect(footerElement).not.toBeInTheDocument();
  });

  test("Renderiza corretamente em telas maiores que 600px", () => {
    // Para esse teste, queremos que matches seja false para (max-width:600px)
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === "(max-width:600px)" ? false : true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <ThemeProvider theme={theme}>
        <Footer />
      </ThemeProvider>
    );

    const footerElement = screen.getByText(/GRUPO MULTI/i);
    expect(footerElement).toBeInTheDocument();
  });
});
