import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  ContractApprovalRequest,
  ContractFromQuotationResponseData,
  ContractListQuery,
  ContractModel,
  ContractTrackingResponse,
  CreateContractFromQuotationRequest,
} from "../../models/contract/contract.model";

const toContractModel = (payload: ContractFromQuotationResponseData): ContractModel => ({
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
    return toContractModel(response);
  },

  async update(id: string, request: Omit<ContractModel, "id">): Promise<ContractModel> {
    const response = await api.put<ContractModel>(withId(API.CONTRACTS.UPDATE, id), request);
    return response.data;
  },

  async getList(params?: ContractListQuery): Promise<ContractModel[]> {
    const response = await api.get<ContractModel[]>(API.CONTRACTS.LIST, { params });
    return response.data;
  },

  async getDetail(id: string): Promise<ContractModel> {
    const response = await api.get<ContractModel>(withId(API.CONTRACTS.DETAIL, id));
    return response.data;
  },

  async approve(id: string, request: ContractApprovalRequest): Promise<void> {
    await api.post<void>(withId(API.CONTRACTS.APPROVE, id), request);
  },

  async submit(id: string): Promise<void> {
    await api.post<void>(withId(API.CONTRACTS.SUBMIT, id));
  },

  async reject(id: string, request: ContractApprovalRequest): Promise<void> {
    await api.post<void>(withId(API.CONTRACTS.REJECT, id), request);
  },

  async track(id: string): Promise<ContractTrackingResponse> {
    const response = await api.get<ContractTrackingResponse>(withId(API.CONTRACTS.TRACK, id));
    return response.data;
  },
};
