import type { TagProps } from "antd";

export type InventoryHealth = "HEALTHY" | "LOW_STOCK" | "HIGH_RESERVED" | "OUT_OF_STOCK";

export const formatNumber = (value: number | undefined | null) => {
  const normalized = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN").format(normalized);
};

export const formatPercent = (value: number | undefined | null, maximumFractionDigits = 1) => {
  const normalized = Number(value ?? 0) * 100;
  return `${normalized.toLocaleString("vi-VN", { maximumFractionDigits })}%`;
};

export const getInventoryHealth = (availableQty: number, reservedQty: number): InventoryHealth => {
  if (availableQty <= 0) {
    return "OUT_OF_STOCK";
  }

  if (availableQty <= 10) {
    return "LOW_STOCK";
  }

  if (reservedQty > 0 && reservedQty >= availableQty * 0.6) {
    return "HIGH_RESERVED";
  }

  return "HEALTHY";
};

export const getInventoryHealthMeta = (
  health: InventoryHealth,
): {
  color: TagProps["color"];
  label: string;
  description: string;
} => {
  switch (health) {
    case "OUT_OF_STOCK":
      return {
        color: "red",
        label: "Hết hàng",
        description: "Cần nhập bổ sung ngay để tránh gián đoạn giao hàng.",
      };
    case "LOW_STOCK":
      return {
        color: "gold",
        label: "Tồn thấp",
        description: "Mức tồn kho thấp, nên theo dõi kế hoạch bổ sung.",
      };
    case "HIGH_RESERVED":
      return {
        color: "orange",
        label: "Giữ chỗ cao",
        description: "Số lượng giữ chỗ chiếm tỷ lệ cao so với tồn khả dụng.",
      };
    case "HEALTHY":
    default:
      return {
        color: "green",
        label: "Ổn định",
        description: "Tồn kho đang ở mức an toàn.",
      };
  }
};

export const normalizeText = (value: string) => value.trim().toLowerCase();
