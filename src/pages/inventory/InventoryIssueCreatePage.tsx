import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, Form, Input, InputNumber, Space, Typography } from "antd";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { inventoryService } from "../../services/inventory/inventory.service";
import { productService } from "../../services/product/product.service";
import { getErrorMessage } from "../shared/page.utils";
import InventoryTransactionForm from "./components/InventoryTransactionForm";
import { getInventoryProductLabel, toInventoryProductOptions, type InventoryProductOption } from "./inventoryForm.utils";

interface InventoryIssueFormValues {
  productId: string;
  quantity: number;
  relatedOrderId?: string;
  relatedProjectId?: string;
  reason?: string;
  note?: string;
}

const InventoryIssueCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [form] = Form.useForm<InventoryIssueFormValues>();

  const [saving, setSaving] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);
  const [productOptions, setProductOptions] = useState<InventoryProductOption[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductLoadError(null);
        const response = await productService.getList({ page: 1, pageSize: 1000, sortBy: "productCode", sortDir: "asc" });
        setProductOptions(toInventoryProductOptions(response.items));
      } catch (error) {
        setProductOptions([]);
        setProductLoadError(getErrorMessage(error, "Không thể tải danh sách sản phẩm."));
      } finally {
        setLoadingProducts(false);
      }
    };

    void loadProducts();
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
          subtitle="Ghi nhận xuất kho theo đơn hàng hoặc dự án để đảm bảo dữ liệu vận hành được kiểm soát."
          breadcrumb={
            <Breadcrumb
              items={[
                { title: "Trang chủ" },
                { title: <span onClick={() => navigate(ROUTE_URL.INVENTORY_STATUS)}>Kho vận</span> },
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
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Form.Item
                name="quantity"
                label="Số lượng xuất"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng xuất kho." },
                  {
                    validator: (_, value: number | undefined) =>
                      value == null || value <= 0 ? Promise.reject(new Error("Số lượng xuất phải lớn hơn 0.")) : Promise.resolve(),
                  },
                ]}
              >
                <InputNumber className="w-full" min={1} precision={0} placeholder="Nhập số lượng xuất kho" />
              </Form.Item>
            </Space>
          }
          sectionThree={
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Typography.Text type="secondary">
                Bạn có thể để trống nếu xuất kho không gắn trực tiếp với đơn hàng hoặc dự án cụ thể.
              </Typography.Text>
              <Form.Item name="relatedOrderId" label="Mã đơn hàng liên quan">
                <Input placeholder="Ví dụ: SO-2026-0012" />
              </Form.Item>
              <Form.Item name="relatedProjectId" label="Mã dự án liên quan">
                <Input placeholder="Ví dụ: PRJ-001" />
              </Form.Item>
            </Space>
          }
          sectionFour={
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Form.Item name="reason" label="Lý do xuất kho">
                <Input placeholder="Ví dụ: Xuất theo đơn hàng đã duyệt" />
              </Form.Item>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={4} maxLength={500} showCount placeholder="Thông tin bổ sung cho bộ phận kho, kế toán hoặc vận chuyển." />
              </Form.Item>
            </Space>
          }
          summaryTitle="Tóm tắt phiếu xuất"
          summaryItems={[
            { key: "product", label: "Sản phẩm", value: getInventoryProductLabel(productOptions, watchProductId) },
            { key: "quantity", label: "Số lượng xuất", value: watchQuantity != null ? `${watchQuantity}` : "Chưa nhập" },
            { key: "order", label: "Đơn hàng liên kết", value: watchOrderId || "Không liên kết" },
            { key: "project", label: "Dự án liên kết", value: watchProjectId || "Không liên kết" },
          ]}
        />
      }
    />
  );
};

export default InventoryIssueCreatePage;
