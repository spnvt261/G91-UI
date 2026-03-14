import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type { ApiResponse } from "../../models/common/api.model";
import type {
  DebtListQuery,
  DebtModel,
  InvoiceListQuery,
  InvoiceModel,
  PaymentRecordRequest,
} from "../../models/payment/payment.model";

const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

export const paymentService = {
  async getInvoiceList(params?: InvoiceListQuery): Promise<InvoiceModel[]> {
    const response = await api.get<ApiResponse<InvoiceModel[]>>(API.PAYMENT.INVOICE_LIST, { params });
    return unwrap(response);
  },

  async getInvoiceDetail(id: string): Promise<InvoiceModel> {
    const response = await api.get<ApiResponse<InvoiceModel>>(withId(API.PAYMENT.INVOICE_DETAIL, id));
    return unwrap(response);
  },

  async recordPayment(invoiceId: string, request: PaymentRecordRequest): Promise<void> {
    await api.post<ApiResponse<null>>(withId(API.PAYMENT.RECORD_PAYMENT, invoiceId), request);
  },

  async getDebtStatus(params?: DebtListQuery): Promise<DebtModel[]> {
    const response = await api.get<ApiResponse<DebtModel[]>>(API.PAYMENT.DEBT_STATUS, { params });
    return unwrap(response);
  },
};
