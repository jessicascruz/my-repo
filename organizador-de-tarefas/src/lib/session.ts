import { BACKEND } from "./backend";

// Import dinâmico: no modo sqlite o SDK do Firebase nunca é carregado.
export async function login() {
  if (BACKEND === "firebase") {
    const { loginWithGoogle } = await import("./firebase");
    await loginWithGoogle();
  }
}

export async function logout() {
  if (BACKEND === "firebase") {
    const { logout: firebaseLogout } = await import("./firebase");
    await firebaseLogout();
    return;
  }
  // ponytail: modo local não tem sessão; recarregar é o "sair" honesto.
  window.location.reload();
}
