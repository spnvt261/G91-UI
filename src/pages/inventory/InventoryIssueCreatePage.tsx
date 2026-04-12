import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, Form, Input, InputNumber, Select, Space, Typography } from "antd";
import type { ProjectModel } from "../../models/project/project.model";
import type { SaleOrderModel } from "../../models/sale-order/sale-order.model";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { inventoryService } from "../../services/inventory/inventory.service";
import { productService } from "../../services/product/product.service";
import { projectService } from "../../services/project/project.service";
import { saleOrderService } from "../../services/sale-order/sale-order.service";
import { getErrorMessage } from "../shared/page.utils";
import InventoryTransactionForm from "./components/InventoryTransactionForm";
import {
  getInventoryProductLabel,
  toInventoryProductOptions,
  type InventoryProductOption,
} from "./inventoryForm.utils";

interface InventoryIssueFormValues {
  productId: string;
  quantity: number;
  relatedOrderId?: string;
  relatedProjectId?: string;
  reason?: string;
  note?: string;
}

interface LinkOption {
  label: string;
  value: string;
}

const toSaleOrderOption = (order: SaleOrderModel): LinkOption => {
  const orderCode = order.saleOrderNumber || order.contractNumber || order.id;
  const customerName = order.customerName || "Khách hàng";
  const projectName = order.projectName ? ` | ${order.projectName}` : "";

  return {
    value: order.id,
    label: `${orderCode} | ${customerName}${projectName}`,
  };
};

const toProjectOption = (project: ProjectModel): LinkOption => {
  const projectCode = project.projectCode || project.code || project.id;
  const customerName = project.customerName ? ` | ${project.customerName}` : "";

  return {
    value: project.id,
    label: `${projectCode} | ${project.name}${customerName}`,
  };
};

const getOptionLabel = (options: LinkOption[], value?: string) =>
  options.find((option) => option.value === value)?.label ?? value;

const InventoryIssueCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [form] = Form.useForm<InventoryIssueFormValues>();

  const [saving, setSaving] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);
  const [saleOrderLoadError, setSaleOrderLoadError] = useState<string | null>(
    null,
  );
  const [projectLoadError, setProjectLoadError] = useState<string | null>(null);
  const [productOptions, setProductOptions] = useState<InventoryProductOption[]>([]);
  const [saleOrderOptions, setSaleOrderOptions] = useState<LinkOption[]>([]);
  const [projectOptions, setProjectOptions] = useState<LinkOption[]>([]);

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingProducts(true);
      setLoadingLinks(true);
      setProductLoadError(null);
      setSaleOrderLoadError(null);
      setProjectLoadError(null);

      const [productResult, saleOrderResult, projectResult] =
        await Promise.allSettled([
          productService.getList({
            page: 1,
            pageSize: 1000,
            sortBy: "productCode",
            sortDir: "asc",
          }),
          saleOrderService.getList({
            page: 1,
            pageSize: 500,
            sortBy: "orderDate",
            sortDir: "desc",
          }),
          projectService.getList({
            page: 1,
            pageSize: 500,
            sortBy: "createdAt",
            sortDir: "desc",
          }),
        ]);

      if (productResult.status === "fulfilled") {
        setProductOptions(toInventoryProductOptions(productResult.value.items));
      } else {
        setProductOptions([]);
        setProductLoadError(
          getErrorMessage(
            productResult.reason,
            "Không thể tải danh sách sản phẩm.",
          ),
        );
      }

      if (saleOrderResult.status === "fulfilled") {
        setSaleOrderOptions(saleOrderResult.value.items.map(toSaleOrderOption));
      } else {
        setSaleOrderOptions([]);
        setSaleOrderLoadError(
          getErrorMessage(
            saleOrderResult.reason,
            "Không thể tải danh sách đơn hàng.",
          ),
        );
      }

      if (projectResult.status === "fulfilled") {
        setProjectOptions(projectResult.value.map(toProjectOption));
      } else {
        setProjectOptions([]);
        setProjectLoadError(
          getErrorMessage(projectResult.reason, "Không thể tải danh sách dự án."),
        );
      }

      setLoadingProducts(false);
      setLoadingLinks(false);
    };

    void loadOptions();
  }, []);

  const watchProductId = Form.useWatch("productId", form);
  const watchQuantity = Form.useWatch("quantity", form);
  const watchOrderId = Form.useWatch("relatedOrderId", form);
  const watchProjectId = Form.useWatch("relatedProjectId", form);

  const handleSubmit = async (values: InventoryIssueFormValues) => {
    try {
      setSaving(true);
      await inventoryService.createIssue({
        productId: values.productId,
        quantity: Number(values.quantity),
        relatedOrderId: values.relatedOrderId?.trim() || undefined,
        relatedProjectId: values.relatedProjectId?.trim() || undefined,
        reason: values.reason?.trim() || undefined,
        note: values.note?.trim() || undefined,
      });
      notify("Đã tạo phiếu xuất kho thành công.", "success");
      navigate(ROUTE_URL.INVENTORY_STATUS);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tạo phiếu xuất kho."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Tạo phiếu xuất kho"
          subtitle="Ghi nhận xuất kho theo đơn hàng hoặc dự án để dữ liệu vận hành được kiểm soát tốt hơn."
          breadcrumb={
            <Breadcrumb
              items={[
                { title: "Trang chủ" },
                {
                  title: (
                    <span onClick={() => navigate(ROUTE_URL.INVENTORY_STATUS)}>
                      Kho vận
                    </span>
                  ),
                },
                { title: "Phiếu xuất kho" },
              ]}
            />
          }
        />
      }
      body={
        <InventoryTransactionForm<InventoryIssueFormValues>
          form={form}
          productOptions={productOptions}
          loadingProducts={loadingProducts}
          productLoadError={productLoadError}
          saving={saving}
          submitLabel="Tạo phiếu xuất"
          onSubmit={(values) => void handleSubmit(values)}
          onBack={() => navigate(ROUTE_URL.INVENTORY_STATUS)}
          sectionTwoTitle="Thông tin xuất kho"
          sectionThreeTitle="Liên kết đơn hàng / dự án"
          sectionFourTitle="Lý do và ghi chú"
          sectionTwo={
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Form.Item
                name="quantity"
                label="Số lượng xuất"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số lượng xuất kho.",
                  },
                  {
                    validator: (_, value: number | undefined) =>
                      value == null || value <= 0
                        ? Promise.reject(
                            new Error("Số lượng xuất phải lớn hơn 0."),
                          )
                        : Promise.resolve(),
                  },
                ]}
              >
                <InputNumber
                  className="w-full"
                  min={1}
                  precision={0}
                  placeholder="Nhập số lượng xuất kho"
                />
              </Form.Item>
            </Space>
          }
          sectionThree={
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Typography.Text type="secondary">
                Chọn một đơn hàng hoặc một dự án liên quan. Bạn vẫn có thể để
                trống nếu phiếu xuất kho không gắn trực tiếp với đối tượng cụ
                thể.
              </Typography.Text>
              <Form.Item name="relatedOrderId" label="Đơn hàng liên quan">
                {saleOrderLoadError ? (
                  <Typography.Text type="danger">
                    {saleOrderLoadError}
                  </Typography.Text>
                ) : null}
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  placeholder="Chọn đơn hàng liên quan"
                  options={saleOrderOptions}
                  loading={loadingLinks}
                  disabled={Boolean(saleOrderLoadError)}
                  onChange={(value) => {
                    if (value) {
                      form.setFieldsValue({ relatedProjectId: undefined });
                    }
                  }}
                  notFoundContent={
                    loadingLinks
                      ? "Đang tải đơn hàng..."
                      : "Không tìm thấy đơn hàng phù hợp"
                  }
                />
              </Form.Item>
              <Form.Item name="relatedProjectId" label="Dự án liên quan">
                {projectLoadError ? (
                  <Typography.Text type="danger">
                    {projectLoadError}
                  </Typography.Text>
                ) : null}
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="label"
                  placeholder="Chọn dự án liên quan"
                  options={projectOptions}
                  loading={loadingLinks}
                  disabled={Boolean(projectLoadError)}
                  onChange={(value) => {
                    if (value) {
                      form.setFieldsValue({ relatedOrderId: undefined });
                    }
                  }}
                  notFoundContent={
                    loadingLinks
                      ? "Đang tải dự án..."
                      : "Không tìm thấy dự án phù hợp"
                  }
                />
              </Form.Item>
            </Space>
          }
          sectionFour={
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Form.Item name="reason" label="Lý do xuất kho">
                <Input placeholder="Ví dụ: Xuất theo đơn hàng đã duyệt" />
              </Form.Item>
              <Form.Item
                name="note"
                label="Ghi chú"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập ghi chú.",
                  },
                ]}
              >
                <Input.TextArea
                  rows={4}
                  maxLength={500}
                  showCount
                  placeholder="Thông tin bổ sung cho bộ phận kho, kế toán hoặc vận chuyển."
                />
              </Form.Item>
            </Space>
          }
          summaryTitle="Tóm tắt phiếu xuất"
          summaryItems={[
            {
              key: "product",
              label: "Sản phẩm",
              value: getInventoryProductLabel(productOptions, watchProductId),
            },
            {
              key: "quantity",
              label: "Số lượng xuất",
              value: watchQuantity != null ? `${watchQuantity}` : "Chưa nhập",
            },
            {
              key: "order",
              label: "Đơn hàng liên kết",
              value:
                getOptionLabel(saleOrderOptions, watchOrderId) ||
                "Không liên kết",
            },
            {
              key: "project",
              label: "Dự án liên kết",
              value:
                getOptionLabel(projectOptions, watchProjectId) ||
                "Không liên kết",
            },
          ]}
        />
      }
    />
  );
};

export default InventoryIssueCreatePage;
