import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  CustomerCreateRequest,
  CustomerDetailModel,
  CustomerDisableRequest,
  CustomerDocumentModel,
  CustomerListQuery,
  CustomerListResponse,
  CustomerModel,
  CustomerStatusResponse,
  CustomerSummaryResponse,
  CustomerUpdateRequest,
} from "../../models/customer/customer.model";
import { extractList, extractPagination } from "../service.utils";

const asRecord = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {});
const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
const asBoolean = (value: unknown): boolean | undefined => (typeof value === "boolean" ? value : undefined);

const toNumber = (value: unknown): number | undefined => {
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

const toStatus = (value: unknown): CustomerModel["status"] => {
  if (value === "ACTIVE") {
    return "ACTIVE";
  }
  if (value === "INACTIVE") {
    return "INACTIVE";
  }
  return undefined;
};

const normalizeCustomer = (payload: unknown): CustomerModel => {
  const item = asRecord(payload);
  const companyName = asString(item.companyName) ?? "";

  return {
    id: asString(item.id) ?? "",
    customerCode: asString(item.customerCode),
    companyName,
    taxCode: asString(item.taxCode) ?? "",
    customerType: asString(item.customerType) ?? "",
    contactPerson: asString(item.contactPerson),
    email: asString(item.email),
    phone: asString(item.phone),
    address: asString(item.address),
    priceGroup: asString(item.priceGroup),
    creditLimit: toNumber(item.creditLimit),
    paymentTerms: asString(item.paymentTerms),
    currentDebt: toNumber(item.currentDebt) ?? toNumber(item.outstandingDebt),
    portalAccountLinked: asBoolean(item.portalAccountLinked),
    status: toStatus(item.status),
    createdAt: asString(item.createdAt),
    updatedAt: asString(item.updatedAt),
  };
};

const normalizeDocuments = (payload: unknown): CustomerDocumentModel[] =>
  (Array.isArray(payload) ? payload : []).map((item) => {
    const record = asRecord(item);
    return {
      type: asString(record.type),
      fileName: asString(record.fileName),
      fileUrl: asString(record.fileUrl),
      uploadedAt: asString(record.uploadedAt),
    };
  });

const normalizeCustomerDetail = (payload: unknown): CustomerDetailModel => {
  const root = asRecord(payload);
  const customer = normalizeCustomer(root.customer);
  const portalAccount = asRecord(root.portalAccount);
  const financial = asRecord(root.financial);
  const activity = asRecord(root.activity);

  return {
    customer: {
      ...customer,
      currentDebt: toNumber(financial.outstandingDebt) ?? customer.currentDebt,
      paymentTerms: asString(financial.paymentTerms) ?? customer.paymentTerms,
      creditLimit: toNumber(financial.creditLimit) ?? customer.creditLimit,
    },
    portalAccount:
      Object.keys(portalAccount).length > 0
        ? {
            userId: asString(portalAccount.userId),
            email: asString(portalAccount.email),
            status: asString(portalAccount.status),
          }
        : undefined,
    financial:
      Object.keys(financial).length > 0
        ? {
            creditLimit: toNumber(financial.creditLimit),
            paymentTerms: asString(financial.paymentTerms),
            totalInvoicedAmount: toNumber(financial.totalInvoicedAmount),
            totalPaymentsReceived: toNumber(financial.totalPaymentsReceived),
            totalAllocatedPayments: toNumber(financial.totalAllocatedPayments),
            outstandingDebt: toNumber(financial.outstandingDebt),
          }
        : undefined,
    activity:
      Object.keys(activity).length > 0
        ? {
            quotationCount: toNumber(activity.quotationCount),
            contractCount: toNumber(activity.contractCount),
            invoiceCount: toNumber(activity.invoiceCount),
            projectCount: toNumber(activity.projectCount),
            activeProjectCount: toNumber(activity.activeProjectCount),
            openContractCount: toNumber(activity.openContractCount),
            lastTransactionAt: asString(activity.lastTransactionAt),
          }
        : undefined,
    contactPersons: (Array.isArray(root.contactPersons) ? root.contactPersons : []).map((item) => {
      const record = asRecord(item);
      return {
        fullName: asString(record.fullName),
        phone: asString(record.phone),
        email: asString(record.email),
        primary: asBoolean(record.primary),
      };
    }),
    recentTransactions: (Array.isArray(root.recentTransactions) ? root.recentTransactions : []).map((item) => {
      const record = asRecord(item);
      return {
        type: asString(record.type),
        entityId: asString(record.entityId),
        referenceNo: asString(record.referenceNo),
        status: asString(record.status),
        amount: toNumber(record.amount),
        eventAt: asString(record.eventAt),
      };
    }),
    documents: normalizeDocuments(root.documents),
  };
};

const normalizeSummary = (payload: unknown): CustomerSummaryResponse => {
  const data = asRecord(payload);

  return {
    customerId: asString(data.customerId),
    customerCode: asString(data.customerCode),
    companyName: asString(data.companyName),
    status: toStatus(data.status),
    creditLimit: toNumber(data.creditLimit),
    paymentTerms: asString(data.paymentTerms),
    totalInvoicedAmount: toNumber(data.totalInvoicedAmount),
    totalPaymentsReceived: toNumber(data.totalPaymentsReceived),
    totalAllocatedPayments: toNumber(data.totalAllocatedPayments),
    outstandingDebt: toNumber(data.outstandingDebt),
    quotationCount: toNumber(data.quotationCount),
    contractCount: toNumber(data.contractCount),
    invoiceCount: toNumber(data.invoiceCount),
    projectCount: toNumber(data.projectCount),
    activeProjectCount: toNumber(data.activeProjectCount),
    openContractCount: toNumber(data.openContractCount),
    canDisable: asBoolean(data.canDisable),
    disableBlockers: Array.isArray(data.disableBlockers) ? data.disableBlockers.map((item) => String(item)) : [],
    lastTransactionAt: asString(data.lastTransactionAt),
  };
};

export const customerService = {
  async create(request: CustomerCreateRequest): Promise<CustomerModel> {
    const response = await api.post<unknown>(API.CUSTOMER.CREATE, request);
    const data = asRecord(response.data);
    const portalAccount = asRecord(data.portalAccount);

    return {
      id: asString(data.id) ?? "",
      customerCode: asString(data.customerCode),
      companyName: asString(data.companyName) ?? "",
      taxCode: "",
      customerType: "",
      status: toStatus(data.status),
      portalAccountLinked: Object.keys(portalAccount).length > 0,
    };
  },

  async getList(query?: CustomerListQuery): Promise<CustomerListResponse> {
    const params = {
      page: query?.page,
      pageSize: query?.pageSize,
      keyword: query?.keyword,
      customerCode: query?.customerCode,
      taxCode: query?.taxCode,
      customerType: query?.customerType,
      priceGroup: query?.priceGroup,
      status: query?.status,
      createdFrom: query?.createdFrom,
      createdTo: query?.createdTo,
      sortBy: query?.sortBy,
      sortDir: query?.sortDir,
    };

    const response = await api.get<unknown>(API.CUSTOMER.LIST, { params });
    const payload = response.data;
    const items = extractList<unknown>(payload).map(normalizeCustomer);
    const pagination = extractPagination(payload, {
      page: query?.page ?? 1,
      pageSize: query?.pageSize ?? 20,
      totalItems: items.length,
    });

    return {
      items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems: pagination.totalItems,
        totalPages: pagination.totalPages,
      },
    };
  },

  async getDetail(id: string): Promise<CustomerDetailModel> {
    const response = await api.get<unknown>(withId(API.CUSTOMER.DETAIL, id));
    return normalizeCustomerDetail(response.data);
  },

  async getSummary(id: string): Promise<CustomerSummaryResponse> {
    const response = await api.get<unknown>(withId(API.CUSTOMER.SUMMARY, id));
    return normalizeSummary(response.data);
  },

  async update(id: string, request: CustomerUpdateRequest): Promise<CustomerDetailModel> {
    const response = await api.put<unknown>(withId(API.CUSTOMER.UPDATE, id), request);
    return normalizeCustomerDetail(response.data);
  },

  async disable(id: string, request: CustomerDisableRequest): Promise<CustomerStatusResponse> {
    const response = await api.patch<unknown>(withId(API.CUSTOMER.DISABLE, id), request);
    const data = asRecord(response.data);

    return {
      id: asString(data.id) ?? id,
      customerCode: asString(data.customerCode),
      status: toStatus(data.status),
      reason: asString(data.reason),
      updatedAt: asString(data.updatedAt),
    };
  },
};
