import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  CustomerQuotationListResponseData,
  CustomerQuotationSummaryResponseData,
  QuotationDetailResponseData,
  QuotationFormInitQuery,
  QuotationFormInitResponseData,
  QuotationHistoryResponseData,
  QuotationListQuery,
  QuotationModel,
  QuotationPreviewResponseData,
  QuotationRequest,
  QuotationSubmitResponseData,
} from "../../models/quotation/quotation.model";

const toQuotationModelFromSummary = (item: CustomerQuotationListResponseData["items"][number]): QuotationModel => ({
  id: item.id,
  quotationNumber: item.quotationNumber,
  customerId: "",
  items: [],
  totalAmount: item.totalAmount,
  status: item.status,
  validUntil: item.validUntil,
  createdAt: item.createdAt,
});

const toQuotationModelFromDetail = (detail: QuotationDetailResponseData): QuotationModel => ({
  id: detail.quotation.id,
  quotationNumber: detail.quotation.quotationNumber,
  customerId: detail.quotation.customerId,
  projectId: detail.quotation.projectId,
  items: detail.items,
  totalAmount: detail.quotation.totalAmount,
  status: detail.quotation.status,
  validUntil: detail.quotation.validUntil,
  createdAt: detail.quotation.createdAt,
});

const toQuotationModelFromSubmit = (payload: QuotationSubmitResponseData): QuotationModel => ({
  id: payload.quotation.id,
  quotationNumber: payload.quotation.quotationNumber,
  customerId: payload.quotation.customerId,
  projectId: payload.quotation.projectId,
  items: [],
  totalAmount: payload.quotation.totalAmount,
  status: payload.quotation.status,
  validUntil: payload.quotation.validUntil,
  createdAt: payload.quotation.createdAt,
});

export const quotationService = {
  async getFormInit(params?: QuotationFormInitQuery): Promise<QuotationFormInitResponseData> {
    const response = await api.get<QuotationFormInitResponseData>(API.CUSTOMER.QUOTATION_FORM_INIT, { params });
    return response.data;
  },

  async getCustomerList(params?: QuotationListQuery): Promise<CustomerQuotationListResponseData> {
    const response = await api.get<CustomerQuotationListResponseData>(API.CUSTOMER.QUOTATIONS, { params });
    return response.data;
  },

  // Backward-compatible list for existing pages.
  async getList(params?: QuotationListQuery): Promise<QuotationModel[]> {
    const list = await this.getCustomerList(params);
    return list.items.map(toQuotationModelFromSummary);
  },

  async getSummary(): Promise<CustomerQuotationSummaryResponseData> {
    const response = await api.get<CustomerQuotationSummaryResponseData>(API.CUSTOMER.QUOTATION_SUMMARY);
    return response.data;
  },

  async preview(request: QuotationRequest): Promise<QuotationPreviewResponseData> {
    const response = await api.post<QuotationPreviewResponseData>(API.QUOTATIONS.PREVIEW, request);
    return response.data;
  },

  async create(request: QuotationRequest): Promise<QuotationModel> {
    const response = await api.post<QuotationSubmitResponseData>(API.QUOTATIONS.CREATE, request);
    return toQuotationModelFromSubmit(response.data);
  },

  async saveDraft(request: QuotationRequest): Promise<QuotationModel> {
    const response = await api.post<QuotationSubmitResponseData>(API.QUOTATIONS.DRAFT, request);
    return toQuotationModelFromSubmit(response.data);
  },

  async submit(idOrRequest: string | QuotationRequest): Promise<void | QuotationModel> {
    if (typeof idOrRequest === "string") {
      await api.post<void>(withId(API.QUOTATIONS.SUBMIT_BY_ID, idOrRequest));
      return;
    }

    const response = await api.post<QuotationSubmitResponseData>(API.QUOTATIONS.SUBMIT, idOrRequest);
    return toQuotationModelFromSubmit(response.data);
  },

  async previewById(id: string): Promise<QuotationPreviewResponseData> {
    const response = await api.get<QuotationPreviewResponseData>(withId(API.QUOTATIONS.PREVIEW_BY_ID, id));
    return response.data;
  },

  async getDetail(id: string): Promise<QuotationModel> {
    const response = await api.get<QuotationDetailResponseData>(withId(API.QUOTATIONS.DETAIL, id));
    return toQuotationModelFromDetail(response.data);
  },

  async getRawDetail(id: string): Promise<QuotationDetailResponseData> {
    const response = await api.get<QuotationDetailResponseData>(withId(API.QUOTATIONS.DETAIL, id));
    return response.data;
  },

  async update(id: string, request: QuotationRequest): Promise<QuotationModel> {
    const response = await api.put<QuotationSubmitResponseData>(withId(API.QUOTATIONS.UPDATE, id), request);
    return toQuotationModelFromSubmit(response.data);
  },

  async getHistory(id: string): Promise<QuotationHistoryResponseData> {
    const response = await api.get<QuotationHistoryResponseData>(withId(API.QUOTATIONS.HISTORY, id));
    return response.data;
  },
};

