import api from "../../apiConfig/axiosConfig";
import { API, withId, withPathParams } from "../../api/URL_const";
import type {
  AssignWarehouseRequest,
  ProjectArchiveRequest,
  ProjectCloseRequest,
  ProjectCreateRequest,
  ProjectDetailResponseData,
  ProjectFinancialSummaryModel,
  ProjectListQuery,
  ProjectListResponseData,
  ProjectMilestoneModel,
  ProjectModel,
  ProjectProgressResponse,
  ProjectUpdateRequest,
  UpdateProjectProgressRequest,
  WarehouseModel,
} from "../../models/project/project.model";
import { extractList, extractPagination } from "../service.utils";

const toProjectModel = (payload: ProjectModel): ProjectModel => ({
  ...payload,
  code: payload.projectCode ?? payload.code,
  projectCode: payload.projectCode ?? payload.code,
  warehouseId: payload.primaryWarehouseId ?? payload.warehouseId,
  warehouseName: payload.primaryWarehouseName ?? payload.warehouseName,
  primaryWarehouseId: payload.primaryWarehouseId ?? payload.warehouseId,
  primaryWarehouseName: payload.primaryWarehouseName ?? payload.warehouseName,
  progress: payload.progressPercent ?? payload.progress,
  progressPercent: payload.progressPercent ?? payload.progress,
  startedAt: payload.startDate ?? payload.startedAt,
  endedAt: payload.endDate ?? payload.endedAt,
});

const toProjectFinancialSummary = (payload: ProjectFinancialSummaryModel): ProjectFinancialSummaryModel => ({
  ...payload,
  breakdownByCategory: Array.isArray(payload.breakdownByCategory) ? payload.breakdownByCategory : [],
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
    code: request.code,
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
  code: request.code,
  customerId: request.customerId,
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

const toListParams = (params?: ProjectListQuery) => ({
  page: params?.page,
  pageSize: params?.pageSize ?? params?.size,
  keyword: params?.keyword,
  projectCode: params?.projectCode,
  projectName: params?.projectName,
  customerId: params?.customerId,
  status: params?.status,
  progressStatus: params?.progressStatus,
  warehouseId: params?.warehouseId,
  assignedManager: params?.assignedManager,
  archived: params?.archived,
  createdFrom: params?.createdFrom,
  createdTo: params?.createdTo,
  startFrom: params?.startFrom,
  startTo: params?.startTo,
  endFrom: params?.endFrom,
  endTo: params?.endTo,
  sortBy: params?.sortBy,
  sortDir: params?.sortDir,
});

export const projectService = {
  async create(request: ProjectCreateRequest): Promise<ProjectModel> {
    const response = await api.post<ProjectModel>(API.PROJECT.CREATE, toCreateRequest(request));
    return toProjectModel(response.data);
  },

  async getListPaged(params?: ProjectListQuery): Promise<ProjectListResponseData> {
    const response = await api.get<unknown>(API.PROJECT.LIST, { params: toListParams(params) });
    const payload = response.data;
    const items = extractList<ProjectModel>(payload).map(toProjectModel);
    const pagination = extractPagination(payload, {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? params?.size ?? 10,
      totalItems: items.length,
    });

    return {
      items,
      pagination,
    };
  },

  async getList(params?: ProjectListQuery): Promise<ProjectModel[]> {
    const response = await projectService.getListPaged(params);
    return response.items;
  },

  async getDetail(id: string): Promise<ProjectModel> {
    const response = await api.get<ProjectDetailResponseData | ProjectModel>(withId(API.PROJECT.DETAIL, id));
    const payload = response.data as ProjectDetailResponseData | ProjectModel;

    if ("project" in payload) {
      return toProjectModel(payload.project);
    }

    return toProjectModel(payload);
  },

  async getDetailCenter(id: string): Promise<ProjectDetailResponseData> {
    const response = await api.get<ProjectDetailResponseData>(withId(API.PROJECT.DETAIL, id));
    return {
      ...response.data,
      project: toProjectModel(response.data.project),
    };
  },

  async getFinancialSummary(id: string): Promise<ProjectFinancialSummaryModel> {
    const response = await api.get<ProjectFinancialSummaryModel>(withId(API.PROJECT.FINANCIAL_SUMMARY, id));
    return toProjectFinancialSummary(response.data);
  },

  async update(id: string, request: ProjectUpdateRequest): Promise<ProjectModel> {
    const response = await api.put<ProjectModel>(withId(API.PROJECT.UPDATE, id), toUpdateRequest(request));
    return toProjectModel(response.data);
  },

  async getWarehouses(): Promise<WarehouseModel[]> {
    const response = await api.get<unknown>(API.WAREHOUSES.LIST);
    return extractList<WarehouseModel>(response.data).map((warehouse) => ({
      ...warehouse,
      name: warehouse.name ?? warehouse.code ?? warehouse.id,
    }));
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

  async getMilestones(id: string): Promise<ProjectMilestoneModel[]> {
    const response = await api.get<unknown>(withId(API.PROJECT.MILESTONES, id));
    return extractList<ProjectMilestoneModel>(response.data);
  },

  async confirmMilestone(id: string, note?: string, milestoneId?: string): Promise<void> {
    let targetMilestoneId = milestoneId;

    if (!targetMilestoneId) {
      const milestones = await projectService.getMilestones(id);
      targetMilestoneId = milestones.find((item) => !item.confirmedAt && item.status !== "CONFIRMED")?.id ?? milestones[0]?.id;
    }

    if (!targetMilestoneId) {
      throw new Error("Không tìm thấy milestone để xác nhận.");
    }

    await api.post<void>(withPathParams(API.PROJECT.CONFIRM_MILESTONE, { id, milestoneId: targetMilestoneId }), {
      note: note || undefined,
    });
  },

  async archive(id: string, request: ProjectArchiveRequest = {}): Promise<void> {
    await api.patch<void>(withId(API.PROJECT.ARCHIVE, id), request);
  },

  async restore(id: string, note?: string): Promise<void> {
    await api.post<void>(withId(API.PROJECT.RESTORE, id), {
      note: note || undefined,
    });
  },

  async close(id: string, note?: string): Promise<void> {
    const payload: ProjectCloseRequest = {
      reason: note || "Closed from UI",
      note: note || undefined,
    };

    await api.post<void>(withId(API.PROJECT.CLOSE, id), payload);
  },

  async softDelete(id: string, note?: string): Promise<void> {
    await projectService.archive(id, {
      reason: note || "Archived from UI",
    });
  },
};
