import { Alert, Button, Col, Form, Input, InputNumber, Row, Select, Space } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { customerService } from "../../services/customer/customer.service";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";
import ProjectFormLayout from "./components/ProjectFormLayout";
import ProjectFormSection from "./components/ProjectFormSection";
import ProjectProgressBar from "./components/ProjectProgressBar";
import { PROJECT_STATUS_OPTIONS, clampProgress } from "./projectForm.constants";
import { buildCustomerOptions, buildWarehouseOptions } from "./projectLookups";

type ProjectCreateFormValues = {
  code?: string;
  name?: string;
  location?: string;
  scope?: string;
  customerId?: string;
  warehouseId?: string;
  assignedProjectManager?: string;
  linkedOrderReference?: string;
  status?: string;
  progress?: number;
};

const ProjectCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [form] = Form.useForm<ProjectCreateFormValues>();

  const [customerOptions, setCustomerOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadLookupOptions = async () => {
      try {
        setLookupLoading(true);
        const [customerListResponse, projects] = await Promise.all([
          customerService.getList({ page: 1, pageSize: 100, status: "ACTIVE" }),
          projectService.getList({ page: 1, pageSize: 100 }),
        ]);

        setCustomerOptions(buildCustomerOptions(customerListResponse.items));
        setWarehouseOptions(buildWarehouseOptions(projects));
      } catch (error) {
        setCustomerOptions([]);
        setWarehouseOptions([]);
        notify(getErrorMessage(error, "Không thể tải dữ liệu khách hàng và kho."), "error");
      } finally {
        setLookupLoading(false);
      }
    };

    void loadLookupOptions();
  }, [notify]);

  const handleCreate = async (values: ProjectCreateFormValues) => {
    try {
      setSaving(true);
      const created = await projectService.create({
        code: values.code?.trim() || undefined,
        name: values.name?.trim() || "",
        customerId: values.customerId ?? "",
        warehouseId: values.warehouseId,
        status: values.status ?? "ACTIVE",
        progress: clampProgress(values.progress),
        location: values.location?.trim() || undefined,
        scope: values.scope?.trim() || undefined,
        assignedProjectManager: values.assignedProjectManager?.trim() || undefined,
        linkedOrderReference: values.linkedOrderReference?.trim() || undefined,
      });
      notify("Tạo dự án thành công.", "success");
      navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", created.id));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tạo dự án."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="Tạo dự án mới"
      subtitle="Thiết lập dự án theo đúng ngữ cảnh nghiệp vụ để đội vận hành có thể theo dõi ngay sau khi lưu."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dự án</span> },
        { title: "Tạo mới" },
      ]}
    >
      <Form<ProjectCreateFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          status: "ACTIVE",
          progress: 0,
        }}
        onFinish={handleCreate}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <ProjectFormSection title="Thông tin cơ bản" description="Nhập các thông tin nền của dự án để dễ nhận diện và điều phối.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Tên dự án"
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên dự án." },
                    { max: 255, message: "Tên dự án tối đa 255 ký tự." },
                  ]}
                >
                  <Input placeholder="Ví dụ: Dự án lắp đặt showroom Quận 7" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Mã dự án" name="code" rules={[{ max: 100, message: "Mã dự án tối đa 100 ký tự." }]}>
                  <Input placeholder="Ví dụ: PRJ-SHOWROOM-Q7" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Quản lý dự án" name="assignedProjectManager" rules={[{ max: 255, message: "Tên quản lý tối đa 255 ký tự." }]}>
                  <Input placeholder="Nhập tên người phụ trách chính" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Mã đơn hàng liên kết" name="linkedOrderReference" rules={[{ max: 255, message: "Mã tham chiếu tối đa 255 ký tự." }]}>
                  <Input placeholder="Nhập mã đơn hàng nếu có" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Địa điểm triển khai" name="location" rules={[{ max: 255, message: "Địa điểm tối đa 255 ký tự." }]}>
                  <Input placeholder="Ví dụ: Quận 7, TP. Hồ Chí Minh" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Phạm vi công việc" name="scope" rules={[{ max: 1000, message: "Phạm vi tối đa 1000 ký tự." }]}>
                  <Input.TextArea rows={3} placeholder="Mô tả phạm vi chính của dự án" />
                </Form.Item>
              </Col>
            </Row>
          </ProjectFormSection>

          <ProjectFormSection title="Khách hàng và kho" description="Thiết lập đúng khách hàng và kho phụ trách ngay từ đầu để hạn chế sai lệch vận hành.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="Khách hàng" name="customerId" rules={[{ required: true, message: "Vui lòng chọn khách hàng." }]}>
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={customerOptions}
                    loading={lookupLoading}
                    placeholder={lookupLoading ? "Đang tải khách hàng..." : "Chọn khách hàng"}
                    notFoundContent="Chưa có dữ liệu khách hàng."
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Kho chính"
                  name="warehouseId"
                  help={!lookupLoading && warehouseOptions.length === 0 ? "Hiện chưa có dữ liệu kho để chọn." : undefined}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={warehouseOptions}
                    loading={lookupLoading}
                    placeholder={lookupLoading ? "Đang tải kho..." : "Chọn kho phụ trách"}
                    notFoundContent="Chưa có dữ liệu kho."
                  />
                </Form.Item>
              </Col>
            </Row>
          </ProjectFormSection>

          <ProjectFormSection title="Trạng thái và tiến độ" description="Thiết lập trạng thái mở đầu và mức tiến độ ban đầu để màn hình chi tiết hiển thị trực quan.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="Trạng thái dự án" name="status">
                  <Select options={PROJECT_STATUS_OPTIONS.map((item) => ({ ...item }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Tiến độ hiện tại (%)"
                  name="progress"
                  rules={[
                    {
                      validator: (_, value) => {
                        const normalized = clampProgress(value);
                        if (value == null || normalized !== value) {
                          return Promise.reject(new Error("Tiến độ phải nằm trong khoảng 0 đến 100."));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber min={0} max={100} step={1} controls style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item noStyle shouldUpdate>
              {() => <ProjectProgressBar value={form.getFieldValue("progress")} showMeta />}
            </Form.Item>
          </ProjectFormSection>

          <Alert
            type="info"
            showIcon
            message="Lưu ý khi tạo dự án"
            description="Bạn có thể cập nhật kho, tiến độ và các mốc nghiệm thu ngay trên trang chi tiết dự án sau khi tạo."
          />

          <Space>
            <Button type="primary" htmlType="submit" loading={saving} disabled={lookupLoading}>
              Lưu dự án
            </Button>
            <Button onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} disabled={saving}>
              Quay lại
            </Button>
          </Space>
        </Space>
      </Form>
    </ProjectFormLayout>
  );
};

export default ProjectCreatePage;
