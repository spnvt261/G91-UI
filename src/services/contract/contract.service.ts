import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type { ApiResponse } from "../../models/common/api.model";
import type {
  ContractApprovalRequest,
  ContractListQuery,
  ContractModel,
  ContractTrackingResponse,
} from "../../models/contract/contract.model";

const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

export const contractService = {
  async create(request: Omit<ContractModel, "id">): Promise<ContractModel> {
    const response = await api.post<ApiResponse<ContractModel>>(API.CONTRACT.CREATE, request);
    return unwrap(response);
  },

  async update(id: string, request: Omit<ContractModel, "id">): Promise<ContractModel> {
    const response = await api.put<ApiResponse<ContractModel>>(withId(API.CONTRACT.UPDATE, id), request);
    return unwrap(response);
  },

  async getList(params?: ContractListQuery): Promise<ContractModel[]> {
    const response = await api.get<ApiResponse<ContractModel[]>>(API.CONTRACT.LIST, { params });
    return unwrap(response);
  },

  async getDetail(id: string): Promise<ContractModel> {
    const response = await api.get<ApiResponse<ContractModel>>(withId(API.CONTRACT.DETAIL, id));
    return unwrap(response);
  },

  async approve(id: string, request: ContractApprovalRequest): Promise<void> {
    await api.post<ApiResponse<null>>(withId(API.CONTRACT.APPROVE, id), request);
  },

  async submit(id: string): Promise<void> {
    await api.post<ApiResponse<null>>(withId(API.CONTRACT.SUBMIT, id));
  },

  async reject(id: string, request: ContractApprovalRequest): Promise<void> {
    await api.post<ApiResponse<null>>(withId(API.CONTRACT.REJECT, id), request);
  },

  async track(id: string): Promise<ContractTrackingResponse> {
    const response = await api.get<ApiResponse<ContractTrackingResponse>>(withId(API.CONTRACT.TRACK, id));
    return unwrap(response);
  },
};
