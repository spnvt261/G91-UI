import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  DebtListQuery,
  DebtModel,
  InvoiceListQuery,
  InvoiceModel,
  PaymentRecordRequest,
} from "../../models/payment/payment.model";
import { extractList } from "../service.utils";

export const paymentService = {
  async getInvoiceList(params?: InvoiceListQuery): Promise<InvoiceModel[]> {
    const response = await api.get<unknown>(API.PAYMENT.INVOICE_LIST, { params });
    return extractList<InvoiceModel>(response.data);
  },

  async getInvoiceDetail(id: string): Promise<InvoiceModel> {
    const response = await api.get<InvoiceModel>(withId(API.PAYMENT.INVOICE_DETAIL, id));
    return response.data;
  },

  async recordPayment(invoiceId: string, request: PaymentRecordRequest): Promise<void> {
    await api.post<void>(withId(API.PAYMENT.RECORD_PAYMENT, invoiceId), request);
  },

  async getDebtStatus(params?: DebtListQuery): Promise<DebtModel[]> {
    const response = await api.get<unknown>(API.PAYMENT.DEBT_STATUS, { params });
    return extractList<DebtModel>(response.data);
  },
};
