import { Alert, Button, Card, Col, DatePicker, Form, Input, InputNumber, Row, Space, Switch, Typography } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ContractModel, ContractUpdateRequest } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getErrorMessage } from "../shared/page.utils";
import ContractActionBar from "./components/ContractActionBar";
import ContractInfoCard from "./components/ContractInfoCard";
import ContractStatusTag from "./components/ContractStatusTag";
import { formatContractCurrency, formatContractDate, getContractDisplayNumber } from "./contract.ui";

interface ContractEditFormValues {
  paymentTerms: string;
  deliveryAddress: string;
  deliveryTerms?: string;
  expectedDeliveryDate?: Dayjs;
  confidential: boolean;
  quantity: number;
  unitPrice: number;
  note?: string;
  changeReason: string;
}

const disablePastDatePreservingSelected = (selectedDate?: Dayjs) => (current: Dayjs) =>
  current.isBefore(dayjs().startOf("day"), "day") && !selectedDate?.isSame(current, "day");

const ContractEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotify();
  const [form] = Form.useForm<ContractEditFormValues>();

  const [contract, setContract] = useState<ContractModel | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const watchedExpectedDeliveryDate = Form.useWatch("expectedDeliveryDate", form);

  const firstItem = contract?.items[0];
  const hasMultipleItems = (contract?.items.length ?? 0) > 1;

  const loadContract = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setPageLoading(true);
      setLoadError(null);
      const detail = await contractService.getDetail(id);
      setContract(detail);

      form.setFieldsValue({
        paymentTerms: detail.paymentTerms ?? "",
        deliveryAddress: detail.deliveryAddress ?? "",
        deliveryTerms: detail.deliveryTerms ?? "",
        expectedDeliveryDate: detail.expectedDeliveryDate ? dayjs(detail.expectedDeliveryDate) : undefined,
        confidential: Boolean(detail.confidential),
        quantity: detail.items[0]?.quantity ?? 1,
        unitPrice: detail.items[0]?.unitPrice ?? 0,
        note: detail.note ?? "",
        changeReason: "Cập nhật điều khoản hợp đồng từ màn hình chỉnh sửa",
      });
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải dữ liệu hợp đồng để chỉnh sửa.");
      setLoadError(message);
      notify(message, "error");
    } finally {
      setPageLoading(false);
    }
  }, [form, id, notify]);

  useEffect(() => {
    void loadContract();
  }, [loadContract]);

  const handleSave = async (values: ContractEditFormValues) => {
    if (!id || !contract) {
      return;
    }

    if (!contract.quotationId.trim()) {
      notify("Không thể lưu vì hợp đồng thiếu thông tin báo giá tham chiếu.", "error");
      return;
    }

    const payload: ContractUpdateRequest = {
      quotationId: contract.quotationId.trim(),
      customerId: contract.customerId,
      paymentTerms: values.paymentTerms.trim(),
      deliveryAddress: values.deliveryAddress.trim(),
      deliveryTerms: values.deliveryTerms?.trim() || undefined,
      note: values.note?.trim() || undefined,
      expectedDeliveryDate: values.expectedDeliveryDate ? values.expectedDeliveryDate.format("YYYY-MM-DD") : undefined,
      confidential: values.confidential,
      changeReason: values.changeReason.trim(),
      items: firstItem
        ? [
          {
            productId: firstItem.productId,
            quantity: Number(values.quantity),
            unitPrice: Number(values.unitPrice),
          },
        ]
        : undefined,
    };

    try {
      setSaving(true);
      await contractService.update(id, payload);
      notify("Đã lưu thay đổi hợp đồng thành công.", "success");
      navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", id));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể lưu thay đổi hợp đồng."), "error");
    } finally {
      setSaving(false);
    }
  };

  const validateExpectedDeliveryDate = (_: unknown, value: Dayjs | undefined) => {
    if (!value || !value.isBefore(dayjs().startOf("day"), "day")) {
      return Promise.resolve();
    }

    const originalExpectedDeliveryDate = contract?.expectedDeliveryDate ? dayjs(contract.expectedDeliveryDate) : null;
    if (originalExpectedDeliveryDate?.isValid() && value.isSame(originalExpectedDeliveryDate, "day")) {
      return Promise.resolve();
    }

    return Promise.reject(new Error("Ngày giao dự kiến không được là ngày trong quá khứ."));
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Chỉnh sửa hợp đồng"
          subtitle="Chỉ các trường nghiệp vụ được hỗ trợ mới có thể chỉnh sửa. Thông tin tham chiếu bên dưới là dạng chỉ đọc."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Hợp đồng", url: ROUTE_URL.CONTRACT_LIST },
                { label: "Chỉnh sửa" },
              ]}
            />
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {loadError ? (
            <Alert
              type="error"
              showIcon
              message="Không thể tải dữ liệu hợp đồng"
              description={loadError}
              action={
                <Button size="small" onClick={() => void loadContract()}>
                  Thử lại
                </Button>
              }
            />
          ) : null}

          <ContractInfoCard
            title="1. Thông tin tham chiếu"
            loading={pageLoading}
            items={[
              {
                key: "contractNumber",
                label: "Số hợp đồng",
                children: contract ? getContractDisplayNumber(contract) : "-",
              },
              {
                key: "status",
                label: "Trạng thái hiện tại",
                children: contract ? <ContractStatusTag status={contract.status} /> : "-",
              },
              {
                key: "quotationId",
                label: "Báo giá liên kết",
                children: contract?.quotationId || "-",
              },
              {
                key: "customer",
                label: "Khách hàng",
                children: contract?.customerName || contract?.customerId || "-",
              },
              {
                key: "createdAt",
                label: "Ngày tạo",
                children: formatContractDate(contract?.createdAt),
              },
              {
                key: "totalAmount",
                label: "Tổng giá trị",
                children: <Typography.Text strong>{formatContractCurrency(contract?.totalAmount ?? 0)}</Typography.Text>,
              },
            ]}
          />

          <Alert
            type="info"
            showIcon
            message="Trạng thái hợp đồng được điều khiển bởi quy trình phê duyệt"
            description="Màn hình này không cho phép chỉnh sửa trực tiếp trạng thái để tránh hiểu nhầm trong luồng xử lý."
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => void handleSave(values)}
            initialValues={{
              confidential: false,
              quantity: 1,
              unitPrice: 0,
            }}
          >
            <Card bordered={false} className="shadow-sm" loading={pageLoading}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Typography.Title level={5} className="!mb-0">
                  2. Điều khoản hợp đồng
                </Typography.Title>
                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Điều khoản thanh toán"
                      name="paymentTerms"
                      rules={[{ required: true, message: "Vui lòng nhập điều khoản thanh toán." }]}
                    >
                      <Input.TextArea rows={3} maxLength={255} showCount />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Địa chỉ giao hàng"
                      name="deliveryAddress"
                      rules={[{ required: true, message: "Vui lòng nhập địa chỉ giao hàng." }]}
                    >
                      <Input.TextArea rows={3} maxLength={500} showCount />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Điều khoản giao hàng" name="deliveryTerms">
                  <Input.TextArea rows={2} maxLength={255} showCount />
                </Form.Item>
              </Space>
            </Card>

            <Card bordered={false} className="shadow-sm" loading={pageLoading}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Typography.Title level={5} className="!mb-0">
                  3. Giao hàng
                </Typography.Title>
                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Ngày giao dự kiến" name="expectedDeliveryDate" rules={[{ validator: validateExpectedDeliveryDate }]}>
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        disabledDate={disablePastDatePreservingSelected(watchedExpectedDeliveryDate)}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Đánh dấu bảo mật" name="confidential" valuePropName="checked">
                      <Switch checkedChildren="Bảo mật" unCheckedChildren="Công khai nội bộ" />
                    </Form.Item>
                  </Col>
                </Row>
              </Space>
            </Card>

            <Card bordered={false} className="shadow-sm" loading={pageLoading}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Typography.Title level={5} className="!mb-0">
                  4. Phạm vi chỉnh sửa dòng hàng
                </Typography.Title>
                <Alert
                  type={hasMultipleItems ? "warning" : "info"}
                  showIcon
                  message={
                    hasMultipleItems
                      ? "Hiện tại chỉ hỗ trợ chỉnh sửa dòng sản phẩm đầu tiên"
                      : "Bạn có thể điều chỉnh số lượng và đơn giá cho dòng sản phẩm hiện tại"
                  }
                  description={
                    hasMultipleItems
                      ? "Các dòng còn lại được giữ nguyên để đảm bảo không thay đổi logic dữ liệu hiện hành."
                      : "Nếu cần chỉnh sửa toàn bộ danh sách sản phẩm, vui lòng thực hiện theo luồng nghiệp vụ mở rộng."
                  }
                />

                {firstItem ? (
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={8}>
                      <Typography.Text type="secondary">Sản phẩm</Typography.Text>
                      <Typography.Paragraph className="!mb-0">
                        {firstItem.productName || firstItem.productCode || firstItem.productId}
                      </Typography.Paragraph>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Số lượng"
                        name="quantity"
                        rules={[
                          { required: true, message: "Vui lòng nhập số lượng." },
                          { type: "number", min: 1, message: "Số lượng phải lớn hơn hoặc bằng 1." },
                        ]}
                      >
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Đơn giá"
                        name="unitPrice"
                        rules={[
                          { required: true, message: "Vui lòng nhập đơn giá." },
                          { type: "number", min: 0, message: "Đơn giá không được âm." },
                        ]}
                      >
                        <InputNumber min={0} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : (
                  <Alert
                    type="warning"
                    showIcon
                    message="Hợp đồng chưa có dòng sản phẩm"
                    description="Hiện tại không có dữ liệu item để chỉnh sửa tại màn hình này."
                  />
                )}
              </Space>
            </Card>

            <Card bordered={false} className="shadow-sm" loading={pageLoading}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Typography.Title level={5} className="!mb-0">
                  5. Ghi chú thay đổi
                </Typography.Title>

                <Form.Item label="Ghi chú nội bộ" name="note">
                  <Input.TextArea rows={3} maxLength={1000} showCount />
                </Form.Item>

                <Form.Item
                  label="Lý do thay đổi"
                  name="changeReason"
                  rules={[{ required: true, message: "Vui lòng nhập lý do thay đổi." }]}
                >
                  <Input.TextArea rows={2} maxLength={500} showCount />
                </Form.Item>
              </Space>
            </Card>

            <ContractActionBar justify="space-between">
              <Button onClick={() => navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", id ?? ""))}>
                Quay lại
              </Button>
              <Button type="primary" htmlType="submit" loading={saving} disabled={pageLoading}>
                Lưu thay đổi
              </Button>
            </ContractActionBar>
          </Form>
        </Space>
      }
    />
  );
};

export default ContractEditPage;
