import axios from "axios";

interface UserInfoResponse {
  username: string;
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
}

interface ApiError {
  message: string;
  response?: {
    data?: unknown;
    status?: number;
  };
  request?: unknown;
}

export async function fetchUserInfo(token: string | undefined) {
  if (!token || typeof token !== "string") return null;

  try {
    const response = await axios.get<UserInfoResponse>(
      "/protocol/openid-connect/userinfo",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return {
      username: response.data?.username || "Usuário Desconhecido",
      roles: response.data?.resource_access?.["multipay"]?.roles || [],
    };
  } catch (error: unknown) {
    const apiError = error as ApiError;

    if (apiError.response) {
      console.error("Erro na resposta da API:", apiError.response.data);
    } else if (apiError.request) {
      console.error(
        "Erro na solicitação, sem resposta recebida:",
        apiError.request
      );
    } else {
      console.error("Erro inesperado:", apiError.message);
    }
    return null;
  }
}
