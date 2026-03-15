import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  AssignWarehouseRequest,
  ProjectCreateRequest,
  ProjectListQuery,
  ProjectModel,
  ProjectUpdateRequest,
  UpdateProjectProgressRequest,
} from "../../models/project/project.model";

export const projectService = {
  async create(request: ProjectCreateRequest): Promise<ProjectModel> {
    const response = await api.post<ProjectModel>(API.PROJECT.CREATE, request);
    return response.data;
  },

  async getList(params?: ProjectListQuery): Promise<ProjectModel[]> {
    const response = await api.get<ProjectModel[]>(API.PROJECT.LIST, { params });
    return response.data;
  },

  async getDetail(id: string): Promise<ProjectModel> {
    const response = await api.get<ProjectModel>(withId(API.PROJECT.DETAIL, id));
    return response.data;
  },

  async update(id: string, request: ProjectUpdateRequest): Promise<ProjectModel> {
    const response = await api.put<ProjectModel>(withId(API.PROJECT.UPDATE, id), request);
    return response.data;
  },

  async assignWarehouse(id: string, request: AssignWarehouseRequest): Promise<void> {
    await api.patch<void>(withId(API.PROJECT.ASSIGN_WAREHOUSE, id), request);
  },

  async updateProgress(id: string, request: UpdateProjectProgressRequest): Promise<void> {
    await api.patch<void>(withId(API.PROJECT.UPDATE_PROGRESS, id), request);
  },
};
