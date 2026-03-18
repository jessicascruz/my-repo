import IError from '@/domain/seedWork/errors/errorHandler/IError'
import { IErrorHandler } from '@/domain/seedWork/errors/errorHandler/IErrorHandler'

describe('IErrorHandler', () => {
  it('deve definir corretamente a assinatura do método creteError', () => {
    class TestErrorHandler implements IErrorHandler {
      createError(error: IError): IError {
        return error
      }
    }

    const errorHandler = new TestErrorHandler()
    const error: IError = {
      message: 'Erro de teste',
      detailedMessage: 'Detalhes do erro',
      errorCode: 'E400',
    }

    expect(errorHandler.createError(error)).toEqual(error)
  })
})
