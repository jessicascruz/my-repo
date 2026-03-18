import CommentsSection from '@/presentation/components/forRoutes/order/details/components/comments/Comments';
import { fireEvent, render, screen } from '@testing-library/react';

describe('CommentsSection', () => {
  it('deve renderizar os comentários corretamente', () => {
    render(<CommentsSection />);

    // Verifica se os nomes dos comentários estão na tela
    expect(screen.getByText('Você')).toBeInTheDocument();
    expect(screen.getByText('Laura Rodrigues dos Santos')).toBeInTheDocument();

    // Busca por todos os elementos que contenham parte do texto da mensagem usando regex (case-insensitive)
    const messages = screen.getAllByText(
      /Lorem ipsum dolor sit amet consectetur\./i
    );
    expect(messages).toHaveLength(2);

    // Verifica se as datas dos comentários estão na tela
    expect(screen.getByText('06/08/2024 - 16:55')).toBeInTheDocument();
    expect(screen.getByText('05/08/2024 - 14:21')).toBeInTheDocument();

    // Verifica se o campo de input e o botão estão presentes
    expect(
      screen.getByPlaceholderText('Insira aqui a sua mensagem...')
    ).toBeInTheDocument();
    expect(screen.getByText('Enviar')).toBeInTheDocument();
  });

  it('deve permitir enviar uma mensagem', () => {
    render(<CommentsSection />);

    const input = screen.getByPlaceholderText(
      'Insira aqui a sua mensagem...'
    ) as HTMLInputElement;
    const button = screen.getByText('Enviar');

    // Simula a digitação no campo de input
    fireEvent.change(input, { target: { value: 'Nova mensagem' } });
    expect(input.value).toBe('Nova mensagem');

    // Simula o clique no botão de enviar
    fireEvent.click(button);
  });

  it('deve abrir o seletor de arquivos ao clicar no ícone de anexar', () => {
    render(<CommentsSection />);

    // Busca o ícone de anexo pelo test id definido no componente
    const attachIcon = screen.getByTestId('AttachFileIcon');
    expect(attachIcon).toBeInTheDocument();

    // Seleciona o input de arquivo que está dentro do label
    const fileInput = attachIcon.parentElement?.querySelector(
      "input[type='file']"
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    // Simula um clique no input de arquivo
    fireEvent.click(fileInput);

    // Simula a seleção de um arquivo
    const file = new File(['dummy content'], 'example.png', {
      type: 'image/png',
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(fileInput.files?.[0]).toStrictEqual(file);
    expect(fileInput.files).toHaveLength(1);
  });
});
