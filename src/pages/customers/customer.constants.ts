import type { CustomerModel } from "../../models/customer/customer.model";

export const CUSTOMER_TYPE_OPTIONS = [
  { label: "Khách lẻ", value: "RETAIL" },
  { label: "Nhà thầu", value: "CONTRACTOR" },
  { label: "Nhà phân phối", value: "DISTRIBUTOR" },
];

const CUSTOMER_TYPE_LABEL_MAP: Record<string, string> = {
  RETAIL: "Khách lẻ",
  CONTRACTOR: "Nhà thầu",
  DISTRIBUTOR: "Nhà phân phối",
};

export const CUSTOMER_STATUS_OPTIONS: Array<{ label: string; value: NonNullable<CustomerModel["status"]> }> = [
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Ngừng hoạt động", value: "INACTIVE" },
];

export const CUSTOMER_STATUS_TEXT: Record<NonNullable<CustomerModel["status"]>, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
};

export const getCustomerTypeLabel = (value?: string): string => {
  if (!value) {
    return "Chưa phân loại";
  }

  return CUSTOMER_TYPE_LABEL_MAP[value] ?? `Loại khác (${value})`;
};
