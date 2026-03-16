import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  ContractApprovalResponseData,
  ContractApprovalRequest,
  ContractCancelRequest,
  ContractCreateRequest,
  ContractDetailResponseData,
  ContractFromQuotationResponseData,
  ContractListQuery,
  ContractListResponseData,
  ContractModel,
  ContractSubmitRequest,
  ContractTrackingResponse,
  ContractUpdateRequest,
  CreateContractFromQuotationRequest,
} from "../../models/contract/contract.model";
import { extractList } from "../service.utils";

const toContractModelFromListItem = (item: ContractListResponseData["items"][number]): ContractModel => ({
  id: item.id,
  contractNumber: item.contractNumber,
  quotationId: "",
  customerId: item.customerId,
  customerName: item.customerName,
  items: [],
  totalAmount: item.totalAmount,
  status: item.status,
  approvalStatus: item.approvalStatus,
  expectedDeliveryDate: item.expectedDeliveryDate,
  createdAt: item.createdAt,
});

const toContractModelFromDetail = (payload: ContractDetailResponseData): ContractModel => ({
  id: payload.contract.id,
  contractNumber: payload.contract.contractNumber,
  quotationId: payload.contract.quotationId ?? payload.quotation?.id ?? "",
  customerId: payload.contract.customerId ?? payload.customer?.id ?? "",
  customerName: payload.contract.customerName ?? payload.customer?.companyName,
  items: (payload.items ?? []).map((item) => ({
    productId: item.productId,
    productCode: item.productCode,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: item.amount ?? item.totalPrice,
  })),
  totalAmount: payload.contract.totalAmount,
  paymentTerms: payload.contract.paymentTerms,
  deliveryAddress: payload.contract.deliveryAddress,
  deliveryTerms: payload.contract.deliveryTerms,
  status: payload.contract.status,
  approvalStatus: payload.contract.approvalStatus,
  createdAt: payload.contract.createdAt,
  expectedDeliveryDate: payload.contract.expectedDeliveryDate,
});

const toCreateRequest = (request: Omit<ContractModel, "id">): ContractCreateRequest => ({
  customerId: request.customerId,
  quotationId: request.quotationId || undefined,
  paymentTerms: request.paymentTerms ?? "",
  deliveryAddress: request.deliveryAddress ?? "",
  deliveryTerms: request.deliveryTerms,
  expectedDeliveryDate: request.expectedDeliveryDate,
  items: request.items?.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  })),
});

const toUpdateRequest = (request: Omit<ContractModel, "id">): ContractUpdateRequest => ({
  ...toCreateRequest(request),
  changeReason: "Updated from UI",
});

export const contractService = {
  async createFromQuotation(
    quotationId: string,
    request: CreateContractFromQuotationRequest,
  ): Promise<ContractFromQuotationResponseData> {
    const response = await api.post<ContractFromQuotationResponseData>(withId(API.CONTRACTS.FROM_QUOTATION, quotationId), request);
    return response.data;
  },

  // Backward-compatible wrapper used by existing pages.
  async create(request: Omit<ContractModel, "id"> | ContractCreateRequest): Promise<ContractModel> {
    const payload = "status" in request ? toCreateRequest(request) : request;
    const response = await api.post<ContractDetailResponseData>(API.CONTRACTS.CREATE, payload);
    return toContractModelFromDetail(response.data);
  },

  async update(id: string, request: Omit<ContractModel, "id"> | ContractUpdateRequest): Promise<ContractModel> {
    const payload = "changeReason" in request ? request : toUpdateRequest(request);
    const response = await api.put<ContractDetailResponseData>(withId(API.CONTRACTS.UPDATE, id), payload);
    return toContractModelFromDetail(response.data);
  },

  async getList(params?: ContractListQuery): Promise<ContractModel[]> {
    const response = await api.get<unknown>(API.CONTRACTS.LIST, { params });
    return extractList<ContractListResponseData["items"][number]>(response.data).map(toContractModelFromListItem);
  },

  async getDetail(id: string): Promise<ContractModel> {
    const response = await api.get<ContractDetailResponseData>(withId(API.CONTRACTS.DETAIL, id));
    return toContractModelFromDetail(response.data);
  },

  async approve(id: string, request: ContractApprovalRequest): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.APPROVE, id), request);
    return response.data;
  },

  async requestModification(id: string, request: ContractApprovalRequest): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.REQUEST_MODIFICATION, id), request);
    return response.data;
  },

  async submit(id: string, request?: ContractSubmitRequest): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.SUBMIT, id), request ?? {});
    return response.data;
  },

  async reject(id: string, request: ContractApprovalRequest): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.REJECT, id), request);
    return response.data;
  },

  async cancel(id: string, request: ContractCancelRequest): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.CANCEL, id), request);
    return response.data;
  },

  async track(id: string): Promise<ContractTrackingResponse> {
    const response = await api.get<{
      contractId: string;
      currentStatus: string;
      events: Array<{
        title?: string;
        eventStatus?: string;
        eventType?: string;
        note?: string;
        trackingNumber?: string;
        actualAt?: string;
        expectedAt?: string;
      }>;
    }>(withId(API.CONTRACTS.TRACK, id));

    return {
      contractId: response.data.contractId,
      currentStatus: response.data.currentStatus,
      timeline: (response.data.events ?? []).map((event) => ({
        status: event.eventStatus ?? event.eventType ?? "UNKNOWN",
        at: event.actualAt ?? event.expectedAt ?? "",
        title: event.title,
        note: event.note,
        trackingNumber: event.trackingNumber,
      })),
    };
  },
};
