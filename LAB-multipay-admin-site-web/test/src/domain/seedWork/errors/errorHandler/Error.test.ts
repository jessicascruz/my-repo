import { ErrorHandler } from '@/domain/seedWork/errors/errorHandler/Error';
import IError from '@/domain/seedWork/errors/errorHandler/IError';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  it('deve criar um erro corretamente', () => {
    const errorData: IError = {
      message: 'Erro de teste',
      detailedMessage: 'Detalhes do erro',
      errorCode: '400',
    };

    const error = errorHandler.createError(errorData);

    expect(error).toEqual(errorData);
  });
});
