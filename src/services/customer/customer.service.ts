import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  CustomerCreateRequest,
  CustomerListQuery,
  CustomerModel,
  CustomerUpdateRequest,
} from "../../models/customer/customer.model";
import { extractList } from "../service.utils";

const normalizeCustomer = (payload: unknown): CustomerModel => {
  const item = (payload ?? {}) as Record<string, unknown>;
  const fullName = String(item.fullName ?? item.companyName ?? item.contactPerson ?? "").trim();
  const contactPerson = typeof item.contactPerson === "string" ? item.contactPerson : undefined;

  return {
    id: String(item.id ?? ""),
    fullName,
    companyName: typeof item.companyName === "string" ? item.companyName : undefined,
    customerType: typeof item.customerType === "string" ? item.customerType : undefined,
    contactPerson,
    email: typeof item.email === "string" ? item.email : undefined,
    phone: typeof item.phone === "string" ? item.phone : undefined,
    address: typeof item.address === "string" ? item.address : undefined,
    creditLimit: typeof item.creditLimit === "number" ? item.creditLimit : undefined,
    currentDebt: typeof item.currentDebt === "number" ? item.currentDebt : undefined,
    status: item.status === "ACTIVE" || item.status === "INACTIVE" ? item.status : undefined,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
  };
};

const unwrapCustomerPayload = (payload: unknown): unknown => {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const data = payload as Record<string, unknown>;
  return data.customer ?? data;
};

const toUpdatePayload = (customer: CustomerModel, status: "ACTIVE" | "INACTIVE"): CustomerUpdateRequest => ({
  fullName: customer.fullName,
  companyName: customer.companyName,
  customerType: customer.customerType,
  contactPerson: customer.contactPerson,
  email: customer.email,
  phone: customer.phone,
  address: customer.address,
  creditLimit: customer.creditLimit,
  currentDebt: customer.currentDebt,
  status,
});

export const customerService = {
  async create(request: CustomerCreateRequest): Promise<CustomerModel> {
    const response = await api.post<unknown>(API.CUSTOMER.CREATE, request);
    return normalizeCustomer(unwrapCustomerPayload(response.data));
  },

  async getList(params?: CustomerListQuery): Promise<CustomerModel[]> {
    const response = await api.get<unknown>(API.CUSTOMER.LIST, { params });
    return extractList<unknown>(response.data).map(normalizeCustomer);
  },

  async getDetail(id: string): Promise<CustomerModel> {
    const response = await api.get<unknown>(withId(API.CUSTOMER.DETAIL, id));
    return normalizeCustomer(unwrapCustomerPayload(response.data));
  },

  async update(id: string, request: CustomerUpdateRequest): Promise<CustomerModel> {
    const response = await api.put<unknown>(withId(API.CUSTOMER.UPDATE, id), request);
    return normalizeCustomer(unwrapCustomerPayload(response.data));
  },

  async disable(id: string): Promise<CustomerModel> {
    const current = await customerService.getDetail(id);
    const response = await api.put<unknown>(withId(API.CUSTOMER.UPDATE, id), toUpdatePayload(current, "INACTIVE"));
    return normalizeCustomer(unwrapCustomerPayload(response.data));
  },
};
