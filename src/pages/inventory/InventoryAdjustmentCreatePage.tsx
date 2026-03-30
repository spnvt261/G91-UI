import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Breadcrumb, Form, Input, InputNumber, Space } from "antd";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { inventoryService } from "../../services/inventory/inventory.service";
import { productService } from "../../services/product/product.service";
import { getErrorMessage } from "../shared/page.utils";
import InventoryTransactionForm from "./components/InventoryTransactionForm";
import { getInventoryProductLabel, toInventoryProductOptions, type InventoryProductOption } from "./inventoryForm.utils";

interface InventoryAdjustmentFormValues {
  productId: string;
  adjustmentQuantity: number;
  reason: string;
  note?: string;
}

const InventoryAdjustmentCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [form] = Form.useForm<InventoryAdjustmentFormValues>();

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
  const watchAdjustmentQty = Form.useWatch("adjustmentQuantity", form);
  const watchReason = Form.useWatch("reason", form);

  const adjustmentDirection = useMemo(() => {
    if (watchAdjustmentQty == null || watchAdjustmentQty === 0) {
      return "Chưa xác định";
    }

    return watchAdjustmentQty > 0 ? "Tăng tồn kho" : "Giảm tồn kho";
  }, [watchAdjustmentQty]);

  const handleSubmit = async (values: InventoryAdjustmentFormValues) => {
    try {
      setSaving(true);
      await inventoryService.createAdjustment({
        productId: values.productId,
        adjustmentQuantity: Number(values.adjustmentQuantity),
        reason: values.reason.trim(),
        note: values.note?.trim() || undefined,
      });
      notify("Đã tạo phiếu điều chỉnh kho thành công.", "success");
      navigate(ROUTE_URL.INVENTORY_STATUS);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tạo phiếu điều chỉnh kho."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Tạo phiếu điều chỉnh tồn kho"
          subtitle="Kiểm soát thay đổi tồn kho có chủ đích với lý do rõ ràng và dấu vết nghiệp vụ đầy đủ."
          breadcrumb={
            <Breadcrumb
              items={[
                { title: "Trang chủ" },
                { title: <span onClick={() => navigate(ROUTE_URL.INVENTORY_STATUS)}>Kho vận</span> },
                { title: "Điều chỉnh tồn kho" },
              ]}
            />
          }
        />
      }
      body={
        <InventoryTransactionForm<InventoryAdjustmentFormValues>
          form={form}
          productOptions={productOptions}
          loadingProducts={loadingProducts}
          productLoadError={productLoadError}
          saving={saving}
          submitLabel="Tạo phiếu điều chỉnh"
          onSubmit={(values) => void handleSubmit(values)}
          onBack={() => navigate(ROUTE_URL.INVENTORY_STATUS)}
          sectionTwoTitle="Điều chỉnh số lượng"
          sectionThreeTitle="Lý do điều chỉnh"
          sectionFourTitle="Ghi chú"
          sectionTwo={
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Form.Item
                name="adjustmentQuantity"
                label="Số lượng điều chỉnh"
                extra="Nhập số dương để tăng tồn kho, số âm để giảm tồn kho."
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng điều chỉnh." },
                  {
                    validator: (_, value: number | undefined) =>
                      value == null || value === 0
                        ? Promise.reject(new Error("Số lượng điều chỉnh phải khác 0."))
                        : Promise.resolve(),
                  },
                ]}
              >
                <InputNumber className="w-full" precision={0} placeholder="Ví dụ: 10 hoặc -5" />
              </Form.Item>
            </Space>
          }
          sectionThree={
            <Form.Item
              name="reason"
              label="Lý do điều chỉnh"
              rules={[
                { required: true, message: "Vui lòng nhập lý do điều chỉnh." },
                { min: 5, message: "Lý do điều chỉnh cần tối thiểu 5 ký tự." },
              ]}
            >
              <Input placeholder="Ví dụ: Kiểm kê lệch, bù hao hụt, cập nhật sai số trước đó..." />
            </Form.Item>
          }
          sectionFour={
            <Form.Item name="note" label="Ghi chú bổ sung">
              <Input.TextArea rows={4} maxLength={500} showCount placeholder="Thông tin đối soát, mã biên bản kiểm kê hoặc lưu ý nội bộ." />
            </Form.Item>
          }
          helperAlert={
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message="Nguyên tắc điều chỉnh tồn kho"
              description="Số dương: tăng tồn kho. Số âm: giảm tồn kho. Vui lòng nhập đúng theo kết quả kiểm kê hoặc quyết định điều chỉnh đã duyệt."
            />
          }
          summaryTitle="Tóm tắt điều chỉnh"
          summaryItems={[
            { key: "product", label: "Sản phẩm", value: getInventoryProductLabel(productOptions, watchProductId) },
            { key: "quantity", label: "Số lượng điều chỉnh", value: watchAdjustmentQty != null ? `${watchAdjustmentQty}` : "Chưa nhập" },
            { key: "direction", label: "Chiều điều chỉnh", value: adjustmentDirection },
            { key: "reason", label: "Lý do", value: watchReason || "Chưa cập nhật" },
          ]}
        />
      }
    />
  );
};

export default InventoryAdjustmentCreatePage;
