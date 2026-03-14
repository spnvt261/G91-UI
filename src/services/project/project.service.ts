import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type { ApiResponse } from "../../models/common/api.model";
import type {
  AssignWarehouseRequest,
  ProjectCreateRequest,
  ProjectListQuery,
  ProjectModel,
  ProjectUpdateRequest,
  UpdateProjectProgressRequest,
} from "../../models/project/project.model";

const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

export const projectService = {
  async create(request: ProjectCreateRequest): Promise<ProjectModel> {
    const response = await api.post<ApiResponse<ProjectModel>>(API.PROJECT.CREATE, request);
    return unwrap(response);
  },

  async getList(params?: ProjectListQuery): Promise<ProjectModel[]> {
    const response = await api.get<ApiResponse<ProjectModel[]>>(API.PROJECT.LIST, { params });
    return unwrap(response);
  },

  async getDetail(id: string): Promise<ProjectModel> {
    const response = await api.get<ApiResponse<ProjectModel>>(withId(API.PROJECT.DETAIL, id));
    return unwrap(response);
  },

  async update(id: string, request: ProjectUpdateRequest): Promise<ProjectModel> {
    const response = await api.put<ApiResponse<ProjectModel>>(withId(API.PROJECT.UPDATE, id), request);
    return unwrap(response);
  },

  async assignWarehouse(id: string, request: AssignWarehouseRequest): Promise<void> {
    await api.patch<ApiResponse<null>>(withId(API.PROJECT.ASSIGN_WAREHOUSE, id), request);
  },

  async updateProgress(id: string, request: UpdateProjectProgressRequest): Promise<void> {
    await api.patch<ApiResponse<null>>(withId(API.PROJECT.UPDATE_PROGRESS, id), request);
  },
};
