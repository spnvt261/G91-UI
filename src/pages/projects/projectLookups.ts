import type { CustomerModel } from "../../models/customer/customer.model";
import type { ProjectModel, WarehouseModel } from "../../models/project/project.model";

export type ProjectSelectOption = {
  label: string;
  value: string;
};

type ProjectWarehouseShape = ProjectModel & {
  primaryWarehouseName?: string;
  backupWarehouseName?: string;
};

const compareByLabel = (left: ProjectSelectOption, right: ProjectSelectOption) =>
  left.label.localeCompare(right.label, "vi");

const toReadableWarehouseLabel = (warehouseId: string, warehouseName?: string) => {
  const normalizedName = warehouseName?.trim();
  if (!normalizedName || normalizedName === warehouseId) {
    return "Kho chua co ten";
  }
  return normalizedName;
};

export const buildCustomerOptions = (customers: CustomerModel[]): ProjectSelectOption[] => {
  return customers
    .map((customer) => {
      const companyName = customer.companyName?.trim();
      const contactPerson = customer.contactPerson?.trim();
      const customerCode = customer.customerCode?.trim();
      const baseLabel = companyName || contactPerson || customerCode || customer.id;

      return {
        value: customer.id,
        label: customerCode ? `${baseLabel} (${customerCode})` : baseLabel,
      };
    })
    .sort(compareByLabel);
};

type WarehouseCandidate = {
  id?: string;
  name?: string;
};

export const buildWarehouseOptions = (
  projects: ProjectModel[] = [],
  additionalWarehouses: WarehouseCandidate[] = [],
): ProjectSelectOption[] => {
  const warehouseMap = new Map<string, string>();

  const upsertWarehouse = (id?: string, name?: string) => {
    const normalizedId = id?.trim();
    if (!normalizedId) {
      return;
    }

    const normalizedName = name?.trim();
    const currentLabel = warehouseMap.get(normalizedId);
    if (!currentLabel || currentLabel === normalizedId) {
      warehouseMap.set(normalizedId, normalizedName || normalizedId);
    }
  };

  projects.forEach((project) => {
    const warehouseProject = project as ProjectWarehouseShape;
    upsertWarehouse(warehouseProject.primaryWarehouseId ?? warehouseProject.warehouseId, warehouseProject.primaryWarehouseName);
    upsertWarehouse(warehouseProject.backupWarehouseId, warehouseProject.backupWarehouseName);
  });

  additionalWarehouses.forEach((warehouse) => {
    upsertWarehouse(warehouse.id, warehouse.name);
  });

  return Array.from(warehouseMap.entries())
    .map(([id, name]) => ({
      value: id,
      label: toReadableWarehouseLabel(id, name),
    }))
    .sort(compareByLabel);
};

export const buildWarehouseOptionsFromApi = (warehouses: WarehouseModel[]): ProjectSelectOption[] => {
  return warehouses
    .map((warehouse) => ({
      value: warehouse.id,
      label: toReadableWarehouseLabel(warehouse.id, warehouse.name),
    }))
    .sort(compareByLabel);
};

export const findWarehouseLabel = (warehouseId: string | undefined, options: ProjectSelectOption[]): string | undefined => {
  if (!warehouseId) {
    return undefined;
  }

  return options.find((option) => option.value === warehouseId)?.label;
};
