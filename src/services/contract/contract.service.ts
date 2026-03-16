import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  ContractApprovalRequest,
  ContractDetailResponseData,
  ContractFromQuotationResponseData,
  ContractListQuery,
  ContractListResponseData,
  ContractModel,
  ContractTrackingResponse,
  ContractUpdateRequest,
  CreateContractFromQuotationRequest,
} from "../../models/contract/contract.model";

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

const toContractModelFromCreate = (payload: ContractFromQuotationResponseData): ContractModel => ({
  id: payload.contract.id,
  contractNumber: payload.contract.contractNumber,
  quotationId: payload.contract.quotationId,
  customerId: payload.contract.customerId,
  items: [],
  totalAmount: payload.contract.totalAmount,
  paymentTerms: payload.contract.paymentTerms,
  deliveryAddress: payload.contract.deliveryAddress,
  status: payload.contract.status,
  createdAt: payload.contract.createdAt,
});

const toUpdateRequest = (request: Omit<ContractModel, "id">): ContractUpdateRequest => ({
  customerId: request.customerId,
  quotationId: request.quotationId || undefined,
  paymentTerms: request.paymentTerms ?? "",
  deliveryAddress: request.deliveryAddress ?? "",
  deliveryTerms: request.deliveryTerms,
  items: request.items?.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  })),
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
  async create(request: Omit<ContractModel, "id">): Promise<ContractModel> {
    const response = await this.createFromQuotation(request.quotationId, {
      paymentTerms: request.paymentTerms ?? "",
      deliveryAddress: request.deliveryAddress ?? "",
    });
    return toContractModelFromCreate(response);
  },

  async update(id: string, request: Omit<ContractModel, "id"> | ContractUpdateRequest): Promise<ContractModel> {
    const payload = "changeReason" in request ? request : toUpdateRequest(request);
    const response = await api.put<ContractDetailResponseData>(withId(API.CONTRACTS.UPDATE, id), payload);
    return toContractModelFromDetail(response.data);
  },

  async getList(params?: ContractListQuery): Promise<ContractModel[]> {
    const response = await api.get<ContractListResponseData>(API.CONTRACTS.LIST, { params });
    return (response.data.items ?? []).map(toContractModelFromListItem);
  },

  async getDetail(id: string): Promise<ContractModel> {
    const response = await api.get<ContractDetailResponseData>(withId(API.CONTRACTS.DETAIL, id));
    return toContractModelFromDetail(response.data);
  },

  async approve(id: string, request: ContractApprovalRequest): Promise<void> {
    await api.post<void>(withId(API.CONTRACTS.APPROVE, id), request);
  },

  async requestModification(id: string, request: ContractApprovalRequest): Promise<void> {
    await api.post<void>(withId(API.CONTRACTS.REQUEST_MODIFICATION, id), request);
  },

  async submit(id: string, request?: { scheduledSubmissionAt?: string; submissionNote?: string }): Promise<void> {
    await api.post<void>(withId(API.CONTRACTS.SUBMIT, id), request ?? {});
  },

  async reject(id: string, request: ContractApprovalRequest): Promise<void> {
    await api.post<void>(withId(API.CONTRACTS.REJECT, id), request);
  },

  async track(id: string): Promise<ContractTrackingResponse> {
    const response = await api.get<{
      contractId: string;
      currentStatus: string;
      events: Array<{
        eventStatus?: string;
        eventType?: string;
        note?: string;
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
        note: event.note,
      })),
    };
  },
};
