import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  CustomerCreateRequest,
  CustomerDisableRequest,
  CustomerListQuery,
  CustomerListResponse,
  CustomerModel,
  CustomerStatusResponse,
  CustomerUpdateRequest,
} from "../../models/customer/customer.model";
import { extractList } from "../service.utils";

interface CustomerApiModel {
  id?: unknown;
  customerCode?: unknown;
  companyName?: unknown;
  fullName?: unknown;
  taxCode?: unknown;
  customerType?: unknown;
  contactPerson?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
  priceGroup?: unknown;
  creditLimit?: unknown;
  currentDebt?: unknown;
  outstandingDebt?: unknown;
  paymentTerms?: unknown;
  status?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface CustomerApiListResponse {
  items?: CustomerApiModel[];
  content?: CustomerApiModel[];
  pagination?: {
    page?: number;
    pageSize?: number;
    size?: number;
    totalItems?: number;
    totalPages?: number;
  };
  page?: number;
  pageSize?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

const asRecord = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {});

const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

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

const toStatus = (value: unknown): CustomerModel["status"] => (value === "INACTIVE" ? "INACTIVE" : value === "ACTIVE" ? "ACTIVE" : undefined);

const toPositiveNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const unwrapData = (payload: unknown): unknown => {
  const record = asRecord(payload);
  if ("data" in record) {
    return unwrapData(record.data);
  }

  return payload;
};

const normalizeCustomer = (payload: unknown): CustomerModel => {
  const item = payload as CustomerApiModel;

  const companyName = asString(item.companyName) ?? asString(item.fullName) ?? "";
  const taxCode = asString(item.taxCode) ?? "";
  const customerType = asString(item.customerType) ?? "";

  return {
    id: asString(item.id) ?? "",
    customerCode: asString(item.customerCode),
    companyName,
    taxCode,
    customerType,
    contactPerson: asString(item.contactPerson),
    email: asString(item.email),
    phone: asString(item.phone),
    address: asString(item.address),
    priceGroup: asString(item.priceGroup),
    creditLimit: toNumber(item.creditLimit),
    currentDebt: toNumber(item.currentDebt) ?? toNumber(item.outstandingDebt),
    paymentTerms: asString(item.paymentTerms),
    status: toStatus(item.status),
    createdAt: asString(item.createdAt),
    updatedAt: asString(item.updatedAt),
  };
};

const normalizeCustomerDetail = (payload: unknown): CustomerModel => {
  const data = asRecord(payload);
  const customerPayload = "customer" in data ? data.customer : payload;
  const financial = asRecord(data.financial);

  const customer = normalizeCustomer(customerPayload);
  const debtFromFinancial = toNumber(financial.currentDebt) ?? toNumber(financial.outstandingDebt);

  return {
    ...customer,
    currentDebt: debtFromFinancial ?? customer.currentDebt,
  };
};

const toPagination = (payload: unknown, query: CustomerListQuery | undefined, totalItemsFromList: number): CustomerListResponse["pagination"] => {
  const data = payload as CustomerApiListResponse;
  const pagination = asRecord(data.pagination);

  const page = toPositiveNumber(pagination.page ?? data.page ?? query?.page, 1);
  const pageSize = toPositiveNumber(pagination.pageSize ?? pagination.size ?? data.pageSize ?? data.size ?? query?.pageSize, 20);
  const totalItems = toPositiveNumber(pagination.totalItems ?? data.totalElements ?? totalItemsFromList, totalItemsFromList);
  const totalPages = toPositiveNumber(pagination.totalPages ?? data.totalPages ?? Math.ceil(totalItems / pageSize), 1);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
  };
};

export const customerService = {
  async create(request: CustomerCreateRequest): Promise<CustomerModel> {
    const response = await api.post<unknown>(API.CUSTOMER.CREATE, request);
    const payload = unwrapData(response.data);
    return normalizeCustomer(payload);
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
    const payload = unwrapData(response.data);
    const items = extractList<CustomerApiModel>(payload).map(normalizeCustomer);

    return {
      items,
      pagination: toPagination(payload, query, items.length),
    };
  },

  async getDetail(id: string): Promise<CustomerModel> {
    const response = await api.get<unknown>(withId(API.CUSTOMER.DETAIL, id));
    return normalizeCustomerDetail(unwrapData(response.data));
  },

  async update(id: string, request: CustomerUpdateRequest): Promise<CustomerModel> {
    const response = await api.put<unknown>(withId(API.CUSTOMER.UPDATE, id), request);
    return normalizeCustomerDetail(unwrapData(response.data));
  },

  async disable(id: string, request: CustomerDisableRequest): Promise<CustomerStatusResponse> {
    const response = await api.patch<unknown>(withId(API.CUSTOMER.DISABLE, id), request);
    const data = asRecord(unwrapData(response.data));

    return {
      id: asString(data.id) ?? id,
      customerCode: asString(data.customerCode),
      status: toStatus(data.status),
      reason: asString(data.reason),
      updatedAt: asString(data.updatedAt),
    };
  },
};
