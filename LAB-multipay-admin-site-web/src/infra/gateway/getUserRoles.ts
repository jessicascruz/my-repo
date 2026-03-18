import axios from 'axios'

interface UserInfoResponse {
  username: string
  resource_access?: {
    [key: string]: {
      roles: string[]
    }
  }
}

interface ApiError {
  message: string
  response?: {
    data?: unknown
    status?: number
  }
  request?: unknown
}

const keycloakServerUrl = process.env.NEXT_PUBLIC_AUTH_ISSUER

export async function getUserRoles(token: string | undefined) {
  if (!token || typeof token !== 'string') return null

  try {
    const response = await axios.get<UserInfoResponse>(
      `${keycloakServerUrl}/protocol/openid-connect/userinfo`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    return {
      username: response.data?.username || 'Usuário Desconhecido',
      roles: response.data?.resource_access?.['multipay']?.roles || [],
    }
  } catch (error: unknown) {
    const apiError = error as ApiError

    if (apiError.response) {
      console.error('Erro na resposta da API:', apiError.response.data)
    } else if (apiError.request) {
      console.error(
        'Erro na solicitação, sem resposta recebida:',
        apiError.request
      )
    } else {
      console.error('Erro inesperado:', apiError.message)
    }
    return null
  }
}
