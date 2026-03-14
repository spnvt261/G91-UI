export type ProjectStatus = "NEW" | "IN_PROGRESS" | "ON_HOLD" | "DONE";

export interface ProjectModel {
  id: string;
  code?: string;
  name: string;
  customerId: string;
  warehouseId?: string;
  progress?: number;
  status: ProjectStatus;
  startedAt?: string;
  endedAt?: string;
}

export interface ProjectListQuery {
  page?: number;
  size?: number;
  keyword?: string;
  status?: ProjectStatus;
}

export type ProjectCreateRequest = Omit<ProjectModel, "id">;
export type ProjectUpdateRequest = Omit<ProjectModel, "id">;

export interface AssignWarehouseRequest {
  warehouseId: string;
}

export interface UpdateProjectProgressRequest {
  progress: number;
  note?: string;
}
