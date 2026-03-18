export const authorizationRolesByContext: Record<string, string[]> = {
  home: ["multipay:admin", "multipay:single-receivable-order-view"],
  order: ["multipay:admin", "multipay:single-receivable-order-view"],
  details: ["multipay:admin", "multipay:single-receivable-order-view"],
  capture: ["multipay:admin", "multipay:payment-card-capture"],
  refund: ["multipay:admin", "multipay:payment-refund"],
  cancel: ["multipay:admin", "multipay:payment-cancel"],
  manualPaymentViewPolicy: ["multipay:admin", "multipay-view-manual-payment_policy"],
  manualPaymentView: ["multipay:admin", "multipay:manual-payment-view"],
  manualPaymentCreate: ["multipay:admin", "multipay:manual-payment-create"],
  manualPaymentApproval: ["multipay:admin", "multipay:manual-payment-approval"],
};