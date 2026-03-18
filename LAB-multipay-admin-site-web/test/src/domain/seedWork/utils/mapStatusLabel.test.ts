import { PaymentStatusEnum } from "@/domain/aggregates/order"
import mapStatusLabel from "@/domain/seedWork/utils/mapStatusLabel"

describe("mapStatusLabel", () => {
  it("should map PENDING status to 'Pendente'", () => {
    expect(mapStatusLabel(PaymentStatusEnum.PENDING)).toBe("Pendente")
  })

  it("should map AUTHORIZED status to 'Autorizado'", () => {
    expect(mapStatusLabel(PaymentStatusEnum.AUTHORIZED)).toBe("Autorizado")
  })

  it("should map CONFIRMED status to 'Confirmado'", () => {
    expect(mapStatusLabel(PaymentStatusEnum.CONFIRMED)).toBe("Confirmado")
  })

  it("should map CANCELED status to 'Cancelado'", () => {
    expect(mapStatusLabel(PaymentStatusEnum.CANCELED)).toBe("Cancelado")
  })

  it("should map DENIED status to 'Negado'", () => {
    expect(mapStatusLabel(PaymentStatusEnum.DENIED)).toBe("Negado")
  })

  it("should map CHARGED_BACK status to 'Estornado'", () => {
    expect(mapStatusLabel(PaymentStatusEnum.CHARGED_BACK)).toBe("Estornado")
  })

  it("should map REJECTED status to 'Rejeitado'", () => {
    expect(mapStatusLabel(PaymentStatusEnum.REJECTED)).toBe("Rejeitado")
  })

  it("should map ERROR status to 'Erro'", () => {
    expect(mapStatusLabel(PaymentStatusEnum.ERROR)).toBe("Erro")
  })

  it("should map REFUNDED status to 'Reembolsado'", () => {
    expect(mapStatusLabel(PaymentStatusEnum.REFUNDED)).toBe("Reembolsado")
  })
})
