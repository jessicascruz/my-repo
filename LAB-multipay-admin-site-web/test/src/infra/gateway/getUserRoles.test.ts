import { getUserRoles } from '@/infra/gateway/getUserRoles'
import axios from 'axios'

// Mock do axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock das variáveis de ambiente

describe('getUserRoles', () => {
  const originalEnv = process.env
  const mockToken = 'valid-token-123'
  const mockUserInfo = {
    username: 'testuser',
    resource_access: {
      multipay: {
        roles: ['admin', 'user'],
      },
    },
  }

  beforeEach(() => {
    jest.resetModules() // Isso é importante para resetar os mocks de módulos
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_AUTH_ISSUER:
        'https://sso.qa.grupomulti.com.br/auth/realms/multi/protocol/openid-connect/userinfo',
    }
    jest.clearAllMocks()
  })

  it('should return null when token is not provided', async () => {
    const result = await getUserRoles(undefined)
    expect(result).toBeNull()
  })

  it('should return null when token is not a string', async () => {
    const result = await getUserRoles(123 as any)
    expect(result).toBeNull()
  })

  it('should return user info with roles when request succeeds', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockUserInfo })

    const result = await getUserRoles(mockToken)

    expect(result).toEqual({
      username: 'testuser',
      roles: ['admin', 'user'],
    })
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://sso.qa.grupomulti.com.br/auth/realms/multi/protocol/openid-connect/userinfo',
      {
        headers: { Authorization: 'Bearer valid-token-123' },
      }
    )
  })

  it('should handle empty resource_access', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { username: 'testuser' },
    })

    const result = await getUserRoles(mockToken)

    expect(result).toEqual({
      username: 'testuser',
      roles: [],
    })
  })

  it('should handle empty multipay roles', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        username: 'testuser',
        resource_access: { other_app: { roles: ['other_role'] } },
      },
    })

    const result = await getUserRoles(mockToken)

    expect(result).toEqual({
      username: 'testuser',
      roles: [],
    })
  })

  it('should return null and log error when API responds with error', async () => {
    const errorResponse = {
      response: {
        status: 401,
        data: { error: 'Unauthorized' },
      },
    }
    mockedAxios.get.mockRejectedValueOnce(errorResponse)
    console.error = jest.fn()

    const result = await getUserRoles(mockToken)

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith(
      'Erro na resposta da API:',
      errorResponse.response.data
    )
  })

  it('should return null and log error when request fails', async () => {
    const errorRequest = {
      request: 'Network Error',
    }
    mockedAxios.get.mockRejectedValueOnce(errorRequest)
    console.error = jest.fn()

    const result = await getUserRoles(mockToken)

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith(
      'Erro na solicitação, sem resposta recebida:',
      errorRequest.request
    )
  })

  it('should return null and log error for unexpected errors', async () => {
    const errorMessage = {
      message: 'Unexpected Error',
    }
    mockedAxios.get.mockRejectedValueOnce(errorMessage)
    console.error = jest.fn()

    const result = await getUserRoles(mockToken)

    expect(result).toBeNull()
    expect(console.error).toHaveBeenCalledWith(
      'Erro inesperado:',
      errorMessage.message
    )
  })

  it('should use default URL when env variable is not set', async () => {
    // Remover o mock das variáveis de ambiente
    jest.unmock('process')
    process.env.NEXT_PUBLIC_AUTH_ISSUER = ''

    mockedAxios.get.mockResolvedValueOnce({ data: mockUserInfo })

    await getUserRoles(mockToken)

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://sso.qa.grupomulti.com.br/auth/realms/multi/protocol/openid-connect/userinfo',
      expect.anything()
    )
  })

  it("should return 'Usuário Desconhecido' when username is not provided", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        // Sem username definido
        resource_access: {
          multipay: {
            roles: ['user'],
          },
        },
      },
    })

    const result = await getUserRoles(mockToken)

    expect(result).toEqual({
      username: 'Usuário Desconhecido',
      roles: ['user'],
    })
  })
})
