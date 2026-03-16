import api from "../../apiConfig/axiosConfig";
import { API, withId, withPathParams } from "../../api/URL_const";
import type {
  AssignWarehouseRequest,
  ProjectCreateRequest,
  ProjectDetailResponseData,
  ProjectListQuery,
  ProjectListResponseData,
  ProjectModel,
  ProjectProgressResponse,
  ProjectUpdateRequest,
  UpdateProjectProgressRequest,
} from "../../models/project/project.model";

const toProjectModel = (payload: ProjectModel): ProjectModel => ({
  ...payload,
  code: payload.projectCode ?? payload.code,
  projectCode: payload.projectCode ?? payload.code,
  warehouseId: payload.primaryWarehouseId ?? payload.warehouseId,
  progress: payload.progressPercent ?? payload.progress,
  progressPercent: payload.progressPercent ?? payload.progress,
  startedAt: payload.startDate ?? payload.startedAt,
  endedAt: payload.endDate ?? payload.endedAt,
});

const todayDate = () => new Date().toISOString().slice(0, 10);

const buildDefaultMilestones = (budget: number, endDate: string) => {
  const baseAmount = Math.max(0, budget);
  return [
    { name: "Milestone 1", milestoneType: "INITIAL", completionPercent: 30, amount: baseAmount * 0.3, dueDate: endDate },
    { name: "Milestone 2", milestoneType: "MIDDLE", completionPercent: 60, amount: baseAmount * 0.3, dueDate: endDate },
    { name: "Milestone 3", milestoneType: "FINAL", completionPercent: 100, amount: baseAmount * 0.4, dueDate: endDate },
  ];
};

const toCreateRequest = (request: ProjectCreateRequest) => {
  const startDate = request.startDate ?? todayDate();
  const endDate = request.endDate ?? startDate;
  const budget = request.budget ?? 1;

  return {
    customerId: request.customerId,
    name: request.name,
    location: request.location ?? "TBD",
    scope: request.scope,
    startDate,
    endDate,
    budget,
    assignedProjectManager: request.assignedProjectManager ?? "TBD",
    primaryWarehouseId: request.primaryWarehouseId ?? request.warehouseId,
    backupWarehouseId: request.backupWarehouseId,
    linkedContractId: request.linkedContractId,
    linkedOrderReference: request.linkedOrderReference,
    status: request.status,
    paymentMilestones: request.paymentMilestones ?? buildDefaultMilestones(budget, endDate),
  };
};

const toUpdateRequest = (request: ProjectUpdateRequest) => ({
  name: request.name,
  location: request.location,
  scope: request.scope,
  startDate: request.startDate,
  endDate: request.endDate,
  budget: request.budget,
  assignedProjectManager: request.assignedProjectManager,
  primaryWarehouseId: request.primaryWarehouseId ?? request.warehouseId,
  backupWarehouseId: request.backupWarehouseId,
  linkedContractId: request.linkedContractId,
  linkedOrderReference: request.linkedOrderReference,
  status: request.status,
  actualSpend: request.actualSpend,
  commitments: request.commitments,
  paymentsReceived: request.paymentsReceived,
  paymentsDue: request.paymentsDue,
  outstandingBalance: request.outstandingBalance,
  openOrderCount: request.openOrderCount,
  unresolvedIssueCount: request.unresolvedIssueCount,
  customerSignoffCompleted: request.customerSignoffCompleted,
  paymentMilestones: request.paymentMilestones,
  changeReason: request.changeReason ?? "Updated from UI",
});

export const projectService = {
  async create(request: ProjectCreateRequest): Promise<ProjectModel> {
    const response = await api.post<ProjectModel>(API.PROJECT.CREATE, toCreateRequest(request));
    return toProjectModel(response.data);
  },

  async getList(params?: ProjectListQuery): Promise<ProjectModel[]> {
    const normalizedParams = {
      ...params,
      pageSize: params?.pageSize ?? params?.size,
      projectName: params?.projectName ?? params?.keyword,
    };
    const response = await api.get<ProjectListResponseData>(API.PROJECT.LIST, { params: normalizedParams });
    return (response.data.items ?? []).map(toProjectModel);
  },

  async getDetail(id: string): Promise<ProjectModel> {
    const response = await api.get<ProjectDetailResponseData>(withId(API.PROJECT.DETAIL, id));
    return toProjectModel(response.data.project);
  },

  async update(id: string, request: ProjectUpdateRequest): Promise<ProjectModel> {
    const response = await api.put<ProjectModel>(withId(API.PROJECT.UPDATE, id), toUpdateRequest(request));
    return toProjectModel(response.data);
  },

  async assignWarehouse(id: string, request: AssignWarehouseRequest): Promise<void> {
    await api.post<void>(withId(API.PROJECT.ASSIGN_WAREHOUSE, id), {
      primaryWarehouseId: request.primaryWarehouseId ?? request.warehouseId,
      backupWarehouseId: request.backupWarehouseId,
      assignmentReason: request.assignmentReason,
    });
  },

  async updateProgress(id: string, request: UpdateProjectProgressRequest, progressUpdateId?: string): Promise<ProjectProgressResponse> {
    const payload = {
      progressPercent: request.progressPercent ?? request.progress ?? 0,
      progressStatus: request.progressStatus,
      phase: request.phase,
      notes: request.notes ?? request.note,
      changeReason: request.changeReason,
      evidenceDocuments: request.evidenceDocuments,
    };

    if (progressUpdateId) {
      const response = await api.put<ProjectProgressResponse>(
        withPathParams(API.PROJECT.UPDATE_PROGRESS, { id, progressUpdateId }),
        payload,
      );
      return response.data;
    }

    const response = await api.post<ProjectProgressResponse>(withId(API.PROJECT.ADD_PROGRESS, id), payload);
    return response.data;
  },
};
