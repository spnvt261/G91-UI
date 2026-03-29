import { Button, Col, Form, Input, InputNumber, Row, Select, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectModel } from "../../models/project/project.model";
import { customerService } from "../../services/customer/customer.service";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";
import ProjectFormLayout from "./components/ProjectFormLayout";
import ProjectProgressBar from "./components/ProjectProgressBar";
import { PROJECT_STATUS_OPTIONS, clampProgress } from "./projectForm.constants";

type ProjectWarehouseShape = ProjectModel & {
  primaryWarehouseId?: string;
  primaryWarehouseName?: string;
  backupWarehouseId?: string;
  backupWarehouseName?: string;
};

type ProjectCreateFormValues = {
  code?: string;
  name?: string;
  customerId?: string;
  warehouseId?: string;
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

        const nextCustomerOptions = customerListResponse.items
          .map((customer) => {
            const customerName = customer.companyName || customer.contactPerson || customer.customerCode || customer.id;
            return {
              label: customer.customerCode ? `${customerName} (${customer.customerCode})` : customerName,
              value: customer.id,
            };
          })
          .sort((left, right) => left.label.localeCompare(right.label));

        const warehouseNameById = new Map<string, string>();

        const upsertWarehouse = (id?: string, name?: string) => {
          if (!id) {
            return;
          }

          const normalizedId = id.trim();
          if (!normalizedId) {
            return;
          }

          const normalizedName = name?.trim();
          const currentName = warehouseNameById.get(normalizedId);
          if (!currentName || currentName === normalizedId) {
            warehouseNameById.set(normalizedId, normalizedName || normalizedId);
          }
        };

        projects.forEach((project) => {
          const warehouseProject = project as ProjectWarehouseShape;
          upsertWarehouse(warehouseProject.primaryWarehouseId ?? warehouseProject.warehouseId, warehouseProject.primaryWarehouseName);
          upsertWarehouse(warehouseProject.backupWarehouseId, warehouseProject.backupWarehouseName);
        });

        const nextWarehouseOptions = Array.from(warehouseNameById.entries())
          .map(([id, warehouseName]) => ({
            label: warehouseName === id ? id : `${warehouseName} (${id})`,
            value: id,
          }))
          .sort((left, right) => left.label.localeCompare(right.label));

        setCustomerOptions(nextCustomerOptions);
        setWarehouseOptions(nextWarehouseOptions);
      } catch (error) {
        setCustomerOptions([]);
        setWarehouseOptions([]);
        notify(getErrorMessage(error, "Không thể tải danh sách khách hàng và kho"), "error");
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
        code: values.code,
        name: values.name ?? "",
        customerId: values.customerId ?? "",
        warehouseId: values.warehouseId,
        progress: clampProgress(values.progress),
        status: values.status ?? "ACTIVE",
      });
      navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", created.id));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tạo dự án"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="Tạo dự án"
      subtitle="Tạo mới dự án và thiết lập thông tin cơ bản về khách hàng, kho."
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
          code: "",
          name: "",
          customerId: undefined,
          warehouseId: undefined,
          status: "ACTIVE",
          progress: 0,
        }}
        onFinish={handleCreate}
      >
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label="Mã dự án" name="code">
              <Input placeholder="Nhập mã dự án" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Tên dự án"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên dự án." }, { max: 255, message: "Tên dự án tối đa 255 ký tự." }]}
            >
              <Input placeholder="Nhập tên dự án" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Khách hàng" name="customerId" rules={[{ required: true, message: "Vui lòng chọn khách hàng." }]}>
              <Select
                showSearch
                optionFilterProp="label"
                options={customerOptions}
                loading={lookupLoading}
                placeholder={lookupLoading ? "Đang tải khách hàng..." : "Chọn khách hàng"}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Kho chính"
              name="warehouseId"
              help={!lookupLoading && warehouseOptions.length === 0 ? "Không có dữ liệu kho từ API hiện tại." : undefined}
            >
              <Select
                showSearch
                optionFilterProp="label"
                options={warehouseOptions}
                loading={lookupLoading}
                placeholder={lookupLoading ? "Đang tải kho..." : "Chọn kho"}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Trạng thái" name="status">
              <Select options={PROJECT_STATUS_OPTIONS.map((item) => ({ ...item }))} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Tiến độ (%)"
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
          {() => (
            <div style={{ marginBottom: 24 }}>
              <Typography.Text type="secondary">Xem trước tiến độ</Typography.Text>
              <div style={{ marginTop: 8 }}>
                <ProjectProgressBar value={form.getFieldValue("progress")} showMeta />
              </div>
            </div>
          )}
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={saving} disabled={lookupLoading}>
            Lưu dự án
          </Button>
          <Button onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} disabled={saving}>
            Quay lại
          </Button>
        </Space>
      </Form>
    </ProjectFormLayout>
  );
};

export default ProjectCreatePage;
