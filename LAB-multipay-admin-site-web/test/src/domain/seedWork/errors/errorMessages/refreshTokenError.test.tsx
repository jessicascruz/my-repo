import {
  refreshAccessTokenCatchError,
  refreshAccessTokenNotOkError,
} from '@/domain/seedWork/errors/errorMessages/refreshTokenError';

describe('refreshTokenError messages', () => {
  it('deve ter uma mensagem e um código de erro para refreshAccessTokenNotOkError', () => {
    expect(refreshAccessTokenNotOkError).toEqual({
      message: 'Error on refreshAccessToken',
      errorCode: 'refreshAccessToken.catchError',
    });
  });

  it('deve ter uma mensagem e um código de erro para refreshAccessTokenCatchError', () => {
    expect(refreshAccessTokenCatchError).toEqual({
      message: 'Error on refreshAccessToken',
      errorCode: 'refreshAccessToken.catchError',
    });
  });
});
