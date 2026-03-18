import { renderHook } from "@testing-library/react";
import { useKeycloakData } from "@/presentation/hooks/useKeycloakData";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react");

describe("useKeycloakData", () => {
  it("deve retornar os dados corretamente quando autenticado", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        sub: "123",
        user: { name: "Lucas Galdino", email: "lucas@email.com" },
        // roles: ["admin", "user"],
      },
      status: "authenticated",
    });

    const { result } = renderHook(() => useKeycloakData());

    expect(result.current.userId).toBe("123");
    expect(result.current.username).toBe("Lucas Galdino");
    expect(result.current.status).toBe("authenticated");
    // expect(result.current.roles).toEqual(["admin", "user"]);
    expect(result.current.userEmail).toBe("lucas@email.com");
  });

  it("deve retornar valores vazios quando não autenticado", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    const { result } = renderHook(() => useKeycloakData());

    expect(result.current.userId).toBe("");
    expect(result.current.username).toBe("");
    expect(result.current.status).toBe("unauthenticated");
    // expect(result.current.roles).toEqual([]);
    expect(result.current.userEmail).toBe("");
  });

  it("deve formatar o nome corretamente", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        sub: "456",
        user: { name: "Ana Clara Silva", email: "ana@email.com" },
        // roles: ["editor"],
      },
      status: "authenticated",
    });

    const { result } = renderHook(() => useKeycloakData());

    expect(result.current.username).toBe("Ana Silva"); // Primeiro e último nome
  });

  it("deve manter o nome original se houver apenas um nome", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        sub: "789",
        user: { name: "Carlos", email: "carlos@email.com" },
        // roles: ["viewer"],
      },
      status: "authenticated",
    });

    const { result } = renderHook(() => useKeycloakData());

    expect(result.current.username).toBe("Carlos");
  });
});
