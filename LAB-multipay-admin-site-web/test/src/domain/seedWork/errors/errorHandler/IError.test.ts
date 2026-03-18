import IError from '@/domain/seedWork/errors/errorHandler/IError';

describe('IError', () => {
  it('deve criar um objeto que segue a estrutura de IError', () => {
    const error: IError = {
      message: 'Erro ao carregar dados',
      detailedMessage: 'Falha ao buscar informações do servidor',
      errorCode: 'E500',
    };

    expect(error).toHaveProperty('message', 'Erro ao carregar dados');
    expect(error).toHaveProperty(
      'detailedMessage',
      'Falha ao buscar informações do servidor'
    );
    expect(error).toHaveProperty('errorCode', 'E500');
  });

  it('deve garantir que errorCode seja uma string', () => {
    const error: IError = {
      message: 'Erro de validação',
      detailedMessage: 'Campo obrigatório não preenchido',
      errorCode: 'E400', // Deve ser string conforme a interface
    };

    expect(typeof error.errorCode).toBe('string');
  });
});
