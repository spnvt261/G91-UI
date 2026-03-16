import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  CustomerQuotationListQuery,
  CustomerQuotationListResponseData,
  CustomerQuotationSummaryResponseData,
  QuotationDetailResponseData,
  QuotationFormInitQuery,
  QuotationFormInitResponseData,
  QuotationHistoryResponseData,
  QuotationModel,
  QuotationPreviewByIdResponseData,
  QuotationSaveResponseData,
  QuotationPreviewResponseData,
  QuotationRequest,
  QuotationSubmitActionRequest,
  QuotationSubmitResponseData,
} from "../../models/quotation/quotation.model";
import { extractList } from "../service.utils";

const toQuotationItems = (items: QuotationDetailResponseData["items"]): QuotationModel["items"] =>
  items.map((item) => ({
    ...item,
    amount: item.amount ?? item.totalPrice,
  }));

const toQuotationModelFromSummary = (item: CustomerQuotationListResponseData["items"][number]): QuotationModel => ({
  id: item.id,
  quotationNumber: item.quotationNumber,
  items: [],
  totalAmount: item.totalAmount,
  status: item.status,
  validUntil: item.validUntil,
  createdAt: item.createdAt,
});

const toQuotationModelFromDetail = (detail: QuotationDetailResponseData): QuotationModel => ({
  id: detail.quotation.id,
  quotationNumber: detail.quotation.quotationNumber,
  customerId: detail.customer?.id,
  customerName: detail.customer?.companyName,
  projectId: detail.project?.id,
  projectName: detail.project?.name,
  items: toQuotationItems(detail.items),
  totalAmount: detail.quotation.totalAmount,
  status: detail.quotation.status,
  validUntil: detail.quotation.validUntil,
  createdAt: detail.quotation.createdAt,
  deliveryRequirements: detail.deliveryRequirements,
  promotionCode: detail.pricing?.promotionCode,
  actions: detail.actions,
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

const toQuotationModelFromSave = (payload: QuotationSaveResponseData): QuotationModel => ({
  id: payload.quotation.id,
  quotationNumber: payload.quotation.quotationNumber,
  customerId: payload.quotation.customerId,
  projectId: payload.quotation.projectId,
  items: payload.items.map((item) => ({
    ...item,
    amount: item.amount ?? item.totalPrice,
  })),
  totalAmount: payload.quotation.totalAmount,
  status: payload.quotation.status,
  validUntil: payload.quotation.validUntil,
  createdAt: payload.quotation.createdAt,
  deliveryRequirements: payload.metadata?.deliveryRequirements,
  promotionCode: payload.metadata?.promotionCode,
});

export const quotationService = {
  async getFormInit(params?: QuotationFormInitQuery): Promise<QuotationFormInitResponseData> {
    const response = await api.get<QuotationFormInitResponseData>(API.CUSTOMER.QUOTATION_FORM_INIT, { params });
    return response.data;
  },

  async getCustomerList(params?: CustomerQuotationListQuery): Promise<CustomerQuotationListResponseData> {
    const response = await api.get<unknown>(API.QUOTATIONS.LIST, { params });
    const data = response.data as Partial<CustomerQuotationListResponseData> | undefined;

    return {
      items: extractList<CustomerQuotationListResponseData["items"][number]>(data),
      pagination: data?.pagination ?? {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 0,
        totalItems: 0,
        totalPages: 0,
      },
      filters: data?.filters,
    };
  },

  // Backward-compatible list for existing pages.
  async getList(params?: CustomerQuotationListQuery): Promise<QuotationModel[]> {
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
    const response = await api.post<QuotationSaveResponseData>(API.QUOTATIONS.DRAFT, request);
    return toQuotationModelFromSave(response.data);
  },

  async submit(idOrRequest: string | QuotationSubmitActionRequest): Promise<void | QuotationModel> {
    if (typeof idOrRequest === "string") {
      await api.post<void>(withId(API.QUOTATIONS.SUBMIT_BY_ID, idOrRequest));
      return;
    }

    const response = await api.post<QuotationSubmitResponseData>(API.QUOTATIONS.SUBMIT, idOrRequest);
    return toQuotationModelFromSubmit(response.data);
  },

  async previewById(id: string): Promise<QuotationPreviewByIdResponseData> {
    const response = await api.get<QuotationPreviewByIdResponseData>(withId(API.QUOTATIONS.PREVIEW_BY_ID, id));
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
    const response = await api.put<QuotationSaveResponseData>(withId(API.QUOTATIONS.UPDATE, id), request);
    return toQuotationModelFromSave(response.data);
  },

  async getHistory(id: string): Promise<QuotationHistoryResponseData> {
    const response = await api.get<QuotationHistoryResponseData>(withId(API.QUOTATIONS.HISTORY, id));
    return response.data;
  },
};

