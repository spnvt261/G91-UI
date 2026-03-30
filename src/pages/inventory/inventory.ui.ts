import type { BadgeProps, TagProps } from "antd";
import dayjs from "dayjs";
import type { InventoryTransactionType } from "../../models/inventory/inventory.model";

export type InventoryStockLevel = "OUT_OF_STOCK" | "LOW_STOCK" | "SAFE_STOCK" | "HIGH_STOCK";

interface InventoryStockMeta {
  label: string;
  tagColor: TagProps["color"];
  badgeStatus: BadgeProps["status"];
}

interface TransactionMeta {
  label: string;
  tagColor: TagProps["color"];
  badgeStatus: BadgeProps["status"];
}

const STOCK_META: Record<InventoryStockLevel, InventoryStockMeta> = {
  OUT_OF_STOCK: {
    label: "Hết hàng",
    tagColor: "error",
    badgeStatus: "error",
  },
  LOW_STOCK: {
    label: "Sắp hết hàng",
    tagColor: "warning",
    badgeStatus: "warning",
  },
  SAFE_STOCK: {
    label: "Tồn kho an toàn",
    tagColor: "success",
    badgeStatus: "success",
  },
  HIGH_STOCK: {
    label: "Tồn kho cao",
    tagColor: "processing",
    badgeStatus: "processing",
  },
};

const TRANSACTION_META: Record<InventoryTransactionType, TransactionMeta> = {
  RECEIPT: {
    label: "Nhập kho",
    tagColor: "success",
    badgeStatus: "success",
  },
  ISSUE: {
    label: "Xuất kho",
    tagColor: "volcano",
    badgeStatus: "error",
  },
  ADJUSTMENT: {
    label: "Điều chỉnh",
    tagColor: "processing",
    badgeStatus: "processing",
  },
};

export const INVENTORY_TRANSACTION_OPTIONS: Array<{ label: string; value: InventoryTransactionType }> = [
  { label: TRANSACTION_META.RECEIPT.label, value: "RECEIPT" },
  { label: TRANSACTION_META.ISSUE.label, value: "ISSUE" },
  { label: TRANSACTION_META.ADJUSTMENT.label, value: "ADJUSTMENT" },
];

export const getInventoryStockLevel = (onHandQuantity: number): InventoryStockLevel => {
  if (onHandQuantity <= 0) {
    return "OUT_OF_STOCK";
  }

  if (onHandQuantity <= 10) {
    return "LOW_STOCK";
  }

  if (onHandQuantity >= 100) {
    return "HIGH_STOCK";
  }

  return "SAFE_STOCK";
};

export const getInventoryStockMeta = (level: InventoryStockLevel): InventoryStockMeta => STOCK_META[level];

export const getInventoryTransactionMeta = (type: InventoryTransactionType): TransactionMeta => TRANSACTION_META[type];

export const formatInventoryDateTime = (value?: string, fallback = "Chưa cập nhật") => {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return fallback;
  }

  return parsed.format("DD/MM/YYYY HH:mm");
};
