import { authorizationRolesByContext } from "@/infra/context/roles";

describe("authorizationRolesByContext", () => {
  it("should return correct roles for 'home'", () => {
    expect(authorizationRolesByContext.home).toEqual(["multipay:admin", "multipay:single-receivable-order-view"]);
  });

  it("should return correct roles for 'order'", () => {
    expect(authorizationRolesByContext.order).toEqual(["multipay:admin", "multipay:single-receivable-order-view"]);
  });

  it("should return correct roles for 'details'", () => {
    expect(authorizationRolesByContext.details).toEqual(["multipay:admin", "multipay:single-receivable-order-view"]);
  });

  it("should return correct roles for 'capture'", () => {
    expect(authorizationRolesByContext.capture).toEqual(["multipay:admin", "multipay:payment-card-capture"]);
  });

  it("should return correct roles for 'refund'", () => {
    expect(authorizationRolesByContext.refund).toEqual(["multipay:admin", "multipay:payment-refund"]);
  });

  it("should return correct roles for 'cancel'", () => {
    expect(authorizationRolesByContext.cancel).toEqual(["multipay:admin", "multipay:payment-cancel"]);
  });  

  it("should return undefined for unknown context", () => {
    expect(authorizationRolesByContext["unknown"]).toBeUndefined();
  });
});
