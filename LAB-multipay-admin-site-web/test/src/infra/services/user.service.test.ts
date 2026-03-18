import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { fetchUserInfo } from '@/infra/services/userService'

// Cria um mock do axios
const mock = new MockAdapter(axios)

describe('fetchUserInfo', () => {
  afterEach(() => {
    mock.reset() // Limpa os mocks após cada teste
  })

  it('should return user info when the token is valid', async () => {
    // Mock para um retorno bem-sucedido
    const mockResponse = {
      username: 'john_doe',
      resource_access: {
        multipay: {
          roles: ['admin', 'user'],
        },
      },
    }

    // Configura o mock para uma solicitação GET
    mock.onGet('/protocol/openid-connect/userinfo').reply(200, mockResponse)

    const result = await fetchUserInfo('valid_token')

    // Verifique se o resultado está correto
    expect(result).toEqual({
      username: 'john_doe',
      roles: ['admin', 'user'],
    })
  })

  it('should return default values when the response does not contain roles', async () => {
    // Mock para um retorno sem roles
    const mockResponse = {
      username: 'john_doe',
      resource_access: {},
    }

    mock.onGet('/protocol/openid-connect/userinfo').reply(200, mockResponse)

    const result = await fetchUserInfo('valid_token')

    // Verifique se o resultado tem o valor padrão para roles
    expect(result).toEqual({
      username: 'john_doe',
      roles: [],
    })
  })

  it("should return 'Usuário Desconhecido' when username is missing", async () => {
    // Mock para um retorno sem o campo username
    const mockResponse = {
      resource_access: {
        multipay: {
          roles: ['user'],
        },
      },
    }

    mock.onGet('/protocol/openid-connect/userinfo').reply(200, mockResponse)

    const result = await fetchUserInfo('valid_token')

    // Verifique se o nome de usuário padrão foi retornado
    expect(result).toEqual({
      username: 'Usuário Desconhecido',
      roles: ['user'],
    })
  })

  it('should return null when there is no token', async () => {
    const result = await fetchUserInfo(undefined)

    // Verifique se o resultado é null
    expect(result).toBeNull()
  })

  it('should handle errors and return null when API request fails', async () => {
    // Mock para erro de requisição
    mock.onGet('/protocol/openid-connect/userinfo').reply(500)

    const result = await fetchUserInfo('valid_token')

    // Verifique se o resultado é null
    expect(result).toBeNull()
  })

  it('should handle errors and log messages when API response has an error', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    // Mock para um erro de resposta da API
    const errorResponse = { message: 'Internal server error' }
    mock.onGet('/protocol/openid-connect/userinfo').reply(500, errorResponse)

    const result = await fetchUserInfo('valid_token')

    // Verifique se o resultado é null e se o erro foi logado
    expect(result).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro na resposta da API:',
      errorResponse
    )

    consoleErrorSpy.mockRestore() // Restaura o spy
  })

  it('should log request error when no response is received', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    // Mock a network error (request was made but no response received)
    mock.onGet('/protocol/openid-connect/userinfo').reply(() => {
      return Promise.reject({
        request: {}, // This is what triggers the apiError.request branch
      })
    })

    const result = await fetchUserInfo('valid_token')

    expect(result).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro na solicitação, sem resposta recebida:',
      expect.anything() // The actual request object
    )

    consoleErrorSpy.mockRestore()
  })

  it('should handle unexpected errors', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    // Mock an unexpected error (not request/response related)
    const errorMessage = 'Unexpected error'
    mock.onGet('/protocol/openid-connect/userinfo').reply(() => {
      throw new Error(errorMessage)
    })

    const result = await fetchUserInfo('valid_token')

    expect(result).toBeNull()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro inesperado:',
      errorMessage
    )

    consoleErrorSpy.mockRestore()
  })
})
