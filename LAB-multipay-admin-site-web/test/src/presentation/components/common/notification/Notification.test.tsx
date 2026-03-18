import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotificationDrawer from "@/presentation/components/common/notification/Notification";
import { ThemeProvider, createTheme } from "@mui/material/styles";

describe("NotificationDrawer", () => {
  const theme = createTheme();

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  test("Renderiza o botão de notificação com o número correto de notificações", () => {
    renderWithTheme(<NotificationDrawer />);

    // Verifica se o botão com o ícone de notificação está renderizado
    const notificationButton = screen.getByRole("button");
    expect(notificationButton).toBeInTheDocument();

    // Verifica se o badge exibe o número correto de notificações (2)
    const badge = screen.getByText("2");
    expect(badge).toBeInTheDocument();
  });

  test("Abre o drawer e exibe as notificações ao clicar no botão", async () => {
    renderWithTheme(<NotificationDrawer />);

    // Clica no botão de notificação para abrir o drawer
    const notificationButton = screen.getByRole("button");
    fireEvent.click(notificationButton);

    // Aguarda a renderização do drawer e verifica se o título "Alertas" está presente
    const title = await screen.findByText(/Alertas/i);
    expect(title).toBeInTheDocument();

    // Verifica se as notificações estão sendo exibidas
    expect(screen.getByText(/Pedido #00001 aprovado/i)).toBeInTheDocument();
    expect(screen.getByText(/25\/07\/2024/i)).toBeInTheDocument();
    expect(screen.getByText(/Pedido #00785 rejeitado/i)).toBeInTheDocument();
    expect(screen.getByText(/22\/07\/2024/i)).toBeInTheDocument();
  });

  test("Fecha o drawer ao clicar no ícone de fechar", async () => {
    // Renderiza e obtém o container para facilitar a busca pelo ícone
    const { container } = renderWithTheme(<NotificationDrawer />);

    // Abre o drawer
    const notificationButton = screen.getByRole("button");
    fireEvent.click(notificationButton);

    // Aguarda o título do drawer ser exibido
    const title = await screen.findByText(/Alertas/i);
    expect(title).toBeInTheDocument();

    // Seleciona o ícone de fechar (SVG) e, a partir dele, obtém o botão pai
    const closeIcon = container.querySelector("svg");
    expect(closeIcon).toBeInTheDocument();
    const closeButton = closeIcon?.closest("button");
    expect(closeButton).toBeInTheDocument();

    // Clica no botão de fechar
    fireEvent.click(closeButton!);

    // Aguarda até que o título "Alertas" não esteja mais no documento (drawer fechado)
    await waitFor(() => {
      expect(screen.queryByText(/Alertas/i)).not.toBeInTheDocument();
    });
  });
});
