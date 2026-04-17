export interface PaymentConfirmationChangedDetail {
  invoiceId?: string;
  requestId?: string;
}

export const PAYMENT_CONFIRMATION_CHANGED_EVENT = "payment-confirmation-requests:changed";

export const emitPaymentConfirmationChanged = (detail: PaymentConfirmationChangedDetail = {}) => {
  window.dispatchEvent(new CustomEvent<PaymentConfirmationChangedDetail>(PAYMENT_CONFIRMATION_CHANGED_EVENT, { detail }));
};
