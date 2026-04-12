import api from "../../apiConfig/axiosConfig";
import { API, withId, withPathParams } from "../../api/URL_const";
import type {
  ContractApprovalDecisionRequest,
  ContractApprovalRequest,
  ContractApprovalResponseData,
  ContractCancelRequest,
  ContractCreateRequest,
  ContractDocumentEmailRequest,
  ContractDocumentExportRequest,
  ContractDocumentGenerateRequest,
  ContractFromQuotationResponseData,
  ContractFormInitResponseData,
  ContractListQuery,
  ContractListResponseData,
  ContractModel,
  ContractSubmitRequest,
  ContractTrackingResponse,
  ContractUpdateRequest,
  CreateContractFromQuotationRequest,
} from "../../models/contract/contract.model";
import { extractList, unwrapApiResponse } from "../service.utils";

export interface ContractDocumentModel {
  id: string;
  name: string;
  status?: string;
  generatedAt?: string;
}

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord => (typeof value === "object" && value !== null ? (value as UnknownRecord) : {});
const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
const asBoolean = (value: unknown): boolean | undefined => (typeof value === "boolean" ? value : undefined);
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const toContractModelFromListItem = (item: ContractListResponseData["items"][number]): ContractModel => ({
  id: item.id,
  contractNumber: item.contractNumber,
  saleOrderNumber: item.saleOrderNumber,
  quotationId: item.quotationId ?? "",
  quotationNumber: item.quotationNumber,
  customerId: item.customerId,
  customerName: item.customerName,
  items: [],
  totalAmount: item.totalAmount,
  status: item.status,
  approvalStatus: item.approvalStatus,
  approvalTier: item.approvalTier,
  requiresApproval: item.requiresApproval,
  confidential: item.confidential,
  expectedDeliveryDate: item.expectedDeliveryDate,
  submittedAt: item.submittedAt,
  createdAt: item.createdAt,
});

const toContractModelFromDetail = (payload: unknown): ContractModel => {
  const root = asRecord(payload);
  const detail = asRecord(root.detail);
  const source = Object.keys(detail).length > 0 ? detail : root;
  const contract = asRecord(source.contract);
  const customer = asRecord(source.customer);
  const quotation = asRecord(source.quotation);
  const approvalRequest = asRecord(root.approvalRequest ?? source.approvalRequest);
  const insights = asRecord(root.insights);
  const insightList = asArray(insights.warnings ?? insights.reasons ?? insights.items ?? root.reviewInsights).map((item) => String(item));
  const documentList = asArray(source.documents).map((item) => {
    const document = asRecord(item);
    return {
      id: String(document.id ?? document.documentId ?? ""),
      name: asString(document.name ?? document.fileName),
      status: asString(document.status),
      generatedAt: asString(document.generatedAt ?? document.createdAt),
      lastExportedAt: asString(document.lastExportedAt),
    };
  });

  return {
    id: asString(contract.id) ?? "",
    contractNumber: asString(contract.contractNumber),
    saleOrderNumber: asString(contract.saleOrderNumber),
    quotationId: asString(contract.quotationId ?? quotation.id) ?? "",
    quotationNumber: asString(quotation.quotationNumber),
    customerId: asString(contract.customerId ?? customer.id) ?? "",
    customerName: asString(contract.customerName ?? customer.companyName),
    items: asArray(source.items).map((item) => {
      const contractItem = asRecord(item);
      return {
        productId: asString(contractItem.productId) ?? "",
        productCode: asString(contractItem.productCode),
        productName: asString(contractItem.productName),
        quantity: asNumber(contractItem.quantity) ?? 0,
        unitPrice: asNumber(contractItem.unitPrice) ?? 0,
        amount: asNumber(contractItem.amount ?? contractItem.totalPrice) ?? 0,
      };
    }),
    totalAmount: asNumber(contract.totalAmount) ?? 0,
    paymentTerms: asString(contract.paymentTerms),
    paymentOptionCode: asString(asRecord(contract.paymentOption).code),
    paymentOption: (() => {
      const paymentOption = asRecord(contract.paymentOption);
      return Object.keys(paymentOption).length > 0
        ? {
            code: asString(paymentOption.code) ?? "",
            name: asString(paymentOption.name) ?? "",
            description: asString(paymentOption.description),
          }
        : undefined;
    })(),
    deliveryAddress: asString(contract.deliveryAddress),
    deliveryTerms: asString(contract.deliveryTerms),
    note: asString(contract.note),
    confidential: asBoolean(contract.confidential),
    status: asString(contract.status) ?? "DRAFT",
    approvalStatus: asString(contract.approvalStatus),
    approvalTier: asString(contract.approvalTier),
    requiresApproval: asBoolean(contract.requiresApproval),
    depositPercentage: asNumber(contract.depositPercentage),
    depositAmount: asNumber(contract.depositAmount),
    creditLimitSnapshot: asNumber(contract.creditLimitSnapshot),
    currentDebtSnapshot: asNumber(contract.currentDebtSnapshot),
    confidentialityNote: asString(source.confidentialityNote),
    approvalRequest:
      Object.keys(approvalRequest).length > 0
        ? {
            requestedBy: asString(approvalRequest.requestedBy),
            requestedAt: asString(approvalRequest.requestedAt),
            reason: asString(approvalRequest.reason),
            comment: asString(approvalRequest.comment),
          }
        : undefined,
    reviewInsights: insightList.length > 0 ? insightList : undefined,
    documents: documentList.length > 0 ? documentList : undefined,
    createdAt: asString(contract.createdAt),
    submittedAt: asString(contract.submittedAt),
    approvedAt: asString(contract.approvedAt),
    cancelledAt: asString(contract.cancelledAt),
    expectedDeliveryDate: asString(contract.expectedDeliveryDate),
  };
};

const toCreateRequest = (request: Omit<ContractModel, "id">): ContractCreateRequest => ({
  customerId: request.customerId,
  quotationId: request.quotationId || undefined,
  paymentTerms: request.paymentTerms ?? "",
  paymentOptionCode: request.paymentOptionCode,
  deliveryAddress: request.deliveryAddress ?? "",
  deliveryTerms: request.deliveryTerms,
  note: request.note,
  expectedDeliveryDate: request.expectedDeliveryDate,
  confidential: request.confidential,
  items: request.items?.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    priceOverrideReason: item.priceOverrideReason,
  })),
});

const toUpdateRequest = (request: Omit<ContractModel, "id">): ContractUpdateRequest => ({
  ...toCreateRequest(request),
  quotationId: request.quotationId,
  changeReason: "Updated from UI",
});

const toDocumentModel = (item: Record<string, unknown>): ContractDocumentModel => ({
  id: String(item.id ?? item.documentId ?? ""),
  name: String(item.name ?? item.fileName ?? item.documentName ?? item.id ?? item.documentId ?? "Contract document"),
  status: typeof item.status === "string" ? item.status : undefined,
  generatedAt: typeof item.generatedAt === "string" ? item.generatedAt : undefined,
});

export const contractService = {
  async getFormInit(params?: { customerId?: string; quotationId?: string }): Promise<ContractFormInitResponseData> {
    const response = await api.get<ContractFormInitResponseData>(API.CONTRACTS.FORM_INIT, { params });
    return response.data;
  },

  async createFromQuotation(
    quotationId: string,
    request: CreateContractFromQuotationRequest,
  ): Promise<ContractFromQuotationResponseData> {
    const response = await api.post<ContractFromQuotationResponseData>(
      withPathParams(API.CONTRACTS.FROM_QUOTATION, { quotationId }),
      request,
    );
    return response.data;
  },

  async create(request: Omit<ContractModel, "id"> | ContractCreateRequest): Promise<ContractModel> {
    const payload = "status" in request ? toCreateRequest(request) : request;
    const response = await api.post<unknown>(API.CONTRACTS.CREATE, payload);
    return toContractModelFromDetail(unwrapApiResponse(response.data));
  },

  async update(id: string, request: Omit<ContractModel, "id"> | ContractUpdateRequest): Promise<ContractModel> {
    const payload = "changeReason" in request ? request : toUpdateRequest(request);
    const response = await api.put<unknown>(withId(API.CONTRACTS.UPDATE, id), payload);
    return toContractModelFromDetail(unwrapApiResponse(response.data));
  },

  async getList(params?: ContractListQuery): Promise<ContractModel[]> {
    const response = await api.get<unknown>(API.CONTRACTS.LIST, { params });
    return extractList<ContractListResponseData["items"][number]>(response.data).map(toContractModelFromListItem);
  },

  async getPendingApprovals(params?: Omit<ContractListQuery, "status">): Promise<ContractModel[]> {
    const response = await api.get<unknown>(API.CONTRACTS.APPROVALS_PENDING, { params });
    return extractList<ContractListResponseData["items"][number]>(response.data).map(toContractModelFromListItem);
  },

  async getDetail(id: string): Promise<ContractModel> {
    const response = await api.get<unknown>(withId(API.CONTRACTS.DETAIL, id));
    return toContractModelFromDetail(unwrapApiResponse(response.data));
  },

  async getApprovalReview(id: string): Promise<ContractModel> {
    const response = await api.get<unknown>(withId(API.CONTRACTS.APPROVAL_REVIEW, id));
    return toContractModelFromDetail(unwrapApiResponse(response.data));
  },

  async approve(id: string, request: ContractApprovalRequest | ContractApprovalDecisionRequest): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.APPROVE, id), request);
    return response.data;
  },

  async customerApprove(id: string, request: ContractApprovalDecisionRequest = {}): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.CUSTOMER_APPROVE, id), request);
    return response.data;
  },

  async customerReject(id: string, request: ContractApprovalDecisionRequest = {}): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.CUSTOMER_REJECT, id), request);
    return response.data;
  },

  async accountantReject(id: string, request: ContractApprovalDecisionRequest = {}): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.ACCOUNTANT_REJECT, id), request);
    return response.data;
  },

  async requestModification(id: string, request: ContractApprovalRequest | ContractApprovalDecisionRequest): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.REQUEST_MODIFICATION, id), request);
    return response.data;
  },

  async submit(id: string, request?: ContractSubmitRequest): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.SUBMIT, id), request ?? {});
    return response.data;
  },

  async reject(id: string, request: ContractApprovalRequest | ContractApprovalDecisionRequest): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.REJECT, id), request);
    return response.data;
  },

  async cancel(id: string, request: ContractCancelRequest): Promise<ContractApprovalResponseData> {
    const response = await api.post<ContractApprovalResponseData>(withId(API.CONTRACTS.CANCEL, id), request);
    return response.data;
  },

  async getDocuments(id: string): Promise<ContractDocumentModel[]> {
    const response = await api.get<unknown>(withId(API.CONTRACTS.DOCUMENTS, id));
    return extractList<Record<string, unknown>>(response.data).map(toDocumentModel);
  },

  async generateDocuments(id: string, request: ContractDocumentGenerateRequest = {}): Promise<ContractDocumentModel[]> {
    const response = await api.post<unknown>(withId(API.CONTRACTS.DOCUMENTS_GENERATE, id), request);
    return extractList<Record<string, unknown>>(response.data).map(toDocumentModel);
  },

  async exportDocument(id: string, documentId: string, request: ContractDocumentExportRequest = {}): Promise<Blob> {
    const response = await api.post<Blob>(withPathParams(API.CONTRACTS.DOCUMENT_EXPORT, { id, documentId }), request, {
      responseType: "blob",
    });
    return response.data;
  },

  async emailDocument(id: string, documentId: string, request: ContractDocumentEmailRequest): Promise<void> {
    await api.post<void>(withPathParams(API.CONTRACTS.DOCUMENT_EMAIL, { id, documentId }), request);
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
