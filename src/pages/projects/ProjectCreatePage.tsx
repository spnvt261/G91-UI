import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Typography } from "antd";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectModel } from "../../models/project/project.model";
import { customerService } from "../../services/customer/customer.service";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";

type StatusValue = "ACTIVE" | "COMPLETED";

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
  status?: StatusValue;
  progress?: number;
};

const STATUS_OPTIONS: Array<{ label: string; value: StatusValue }> = [
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
];

const clampProgress = (value?: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
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
        notify(getErrorMessage(error, "Cannot load user and warehouse options"), "error");
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
        status: (values.status ?? "ACTIVE") as StatusValue,
      });
      navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", created.id));
    } catch (error) {
      notify(getErrorMessage(error, "Cannot create project"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Breadcrumb
          items={[
            { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
            { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dự án</span> },
            { title: "Tạo mới" },
          ]}
        />

        <Typography.Title level={4} style={{ margin: 0 }}>
          Tạo dự án
        </Typography.Title>

        <Card title="Thông tin dự án">
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
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Mã dự án" name="code">
                  <Input placeholder="Nhập mã dự án" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Tên dự án" name="name">
                  <Input placeholder="Nhập tên dự án" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="User" name="customerId">
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={customerOptions}
                    loading={lookupLoading}
                    placeholder={lookupLoading ? "Đang tải user..." : "Chọn user"}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Warehouse"
                  name="warehouseId"
                  help={!lookupLoading && warehouseOptions.length === 0 ? "Chưa có dữ liệu warehouse từ API." : undefined}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={warehouseOptions}
                    loading={lookupLoading}
                    placeholder={lookupLoading ? "Đang tải warehouse..." : "Chọn warehouse"}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Trạng thái" name="status">
                  <Select options={STATUS_OPTIONS} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Tiến độ"
                  name="progress"
                  rules={[
                    {
                      validator: (_, value) => {
                        const normalized = clampProgress(value);
                        if (value == null || normalized !== value) {
                          return Promise.reject(new Error("Tiến độ chỉ từ 0 đến 100"));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    step={1}
                    controls
                    style={{ width: "100%" }}
                    formatter={(value) => `${value ?? 0}%`}
                    parser={(value) => {
                      const raw = String(value ?? "").replace("%", "").trim();
                      const parsed = Number(raw);
                      return Number.isNaN(parsed) ? 0 : parsed;
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Space>
              <Button type="primary" htmlType="submit" loading={saving} disabled={lookupLoading}>
                Lưu dự án
              </Button>
              <Button onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} disabled={saving}>
                Quay lại
              </Button>
            </Space>
          </Form>
        </Card>
      </Space>
    </div>
  );
};

export default ProjectCreatePage;
