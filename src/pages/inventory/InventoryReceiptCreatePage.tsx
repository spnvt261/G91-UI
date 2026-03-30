import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, DatePicker, Form, Input, InputNumber, Space } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { inventoryService } from "../../services/inventory/inventory.service";
import { productService } from "../../services/product/product.service";
import { getErrorMessage } from "../shared/page.utils";
import InventoryTransactionForm from "./components/InventoryTransactionForm";
import { getInventoryProductLabel, toInventoryProductOptions, type InventoryProductOption } from "./inventoryForm.utils";

interface InventoryReceiptFormValues {
  productId: string;
  quantity: number;
  receiptDate: Dayjs;
  supplierName?: string;
  reason?: string;
  note?: string;
}

const InventoryReceiptCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [form] = Form.useForm<InventoryReceiptFormValues>();

  const [saving, setSaving] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);
  const [productOptions, setProductOptions] = useState<InventoryProductOption[]>([]);

  useEffect(() => {
    form.setFieldsValue({ receiptDate: dayjs() });
  }, [form]);

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
  const watchReceiptDate = Form.useWatch("receiptDate", form);
  const watchSupplierName = Form.useWatch("supplierName", form);

  const handleSubmit = async (values: InventoryReceiptFormValues) => {
    try {
      setSaving(true);
      await inventoryService.createReceipt({
        productId: values.productId,
        quantity: Number(values.quantity),
        receiptDate: values.receiptDate.format("YYYY-MM-DD"),
        supplierName: values.supplierName?.trim() || undefined,
        reason: values.reason?.trim() || undefined,
        note: values.note?.trim() || undefined,
      });
      notify("Đã tạo phiếu nhập kho thành công.", "success");
      navigate(ROUTE_URL.INVENTORY_STATUS);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tạo phiếu nhập kho."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Tạo phiếu nhập kho"
          subtitle="Ghi nhận chính xác lượng hàng nhập và nguồn nhập để đồng bộ tồn kho theo thời gian thực."
          breadcrumb={
            <Breadcrumb
              items={[
                { title: "Trang chủ" },
                { title: <span onClick={() => navigate(ROUTE_URL.INVENTORY_STATUS)}>Kho vận</span> },
                { title: "Phiếu nhập kho" },
              ]}
            />
          }
        />
      }
      body={
        <InventoryTransactionForm<InventoryReceiptFormValues>
          form={form}
          productOptions={productOptions}
          loadingProducts={loadingProducts}
          productLoadError={productLoadError}
          saving={saving}
          submitLabel="Tạo phiếu nhập"
          onSubmit={(values) => void handleSubmit(values)}
          onBack={() => navigate(ROUTE_URL.INVENTORY_STATUS)}
          sectionTwoTitle="Thông tin nhập kho"
          sectionThreeTitle="Nguồn nhập / nhà cung cấp"
          sectionFourTitle="Lý do và ghi chú"
          sectionTwo={
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Form.Item
                name="quantity"
                label="Số lượng nhập"
                rules={[
                  { required: true, message: "Vui lòng nhập số lượng." },
                  { validator: (_, value: number | undefined) => (value == null || value <= 0 ? Promise.reject(new Error("Số lượng phải lớn hơn 0.")) : Promise.resolve()) },
                ]}
              >
                <InputNumber className="w-full" min={1} precision={0} placeholder="Nhập số lượng hàng nhập kho" />
              </Form.Item>
              <Form.Item name="receiptDate" label="Ngày nhập kho" rules={[{ required: true, message: "Vui lòng chọn ngày nhập kho." }]}>
                <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày nhập kho" />
              </Form.Item>
            </Space>
          }
          sectionThree={
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Form.Item name="supplierName" label="Nhà cung cấp">
                <Input placeholder="Nhập tên nhà cung cấp hoặc đơn vị giao hàng" />
              </Form.Item>
            </Space>
          }
          sectionFour={
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Form.Item name="reason" label="Lý do nhập kho">
                <Input placeholder="Ví dụ: Nhập bổ sung tồn kho, nhập theo PO..." />
              </Form.Item>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={4} maxLength={500} showCount placeholder="Thông tin thêm cho kế toán hoặc bộ phận kho vận." />
              </Form.Item>
            </Space>
          }
          summaryTitle="Tóm tắt phiếu nhập"
          summaryItems={[
            { key: "product", label: "Sản phẩm", value: getInventoryProductLabel(productOptions, watchProductId) },
            { key: "quantity", label: "Số lượng", value: watchQuantity != null ? `${watchQuantity}` : "Chưa nhập" },
            {
              key: "date",
              label: "Ngày nhập",
              value: watchReceiptDate ? watchReceiptDate.format("DD/MM/YYYY") : "Chưa chọn",
            },
            { key: "supplier", label: "Nhà cung cấp", value: watchSupplierName || "Chưa cập nhật" },
          ]}
        />
      }
    />
  );
};

export default InventoryReceiptCreatePage;
