import { Alert, Button, Col, Form, Input, Row, Select, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectModel } from "../../models/project/project.model";
import { customerService } from "../../services/customer/customer.service";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";
import ProjectContextCard from "./components/ProjectContextCard";
import ProjectFormLayout from "./components/ProjectFormLayout";
import ProjectFormSection from "./components/ProjectFormSection";
import { PROJECT_STATUS_OPTIONS } from "./projectForm.constants";
import { buildProjectActionNavigation, resolveProjectBackTarget } from "./projectNavigation";
import { buildCustomerOptions, buildWarehouseOptions } from "./projectLookups";

type ProjectEditFormValues = {
  code?: string;
  name?: string;
  location?: string;
  scope?: string;
  customerId?: string;
  warehouseId?: string;
  assignedProjectManager?: string;
  linkedOrderReference?: string;
  status?: string;
};

const ProjectEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [form] = Form.useForm<ProjectEditFormValues>();
  const [project, setProject] = useState<ProjectModel | null>(null);

  const [customerOptions, setCustomerOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { notify } = useNotify();

  const backTarget = useMemo(() => resolveProjectBackTarget(location, id), [id, location]);

  useEffect(() => {
    const loadPage = async () => {
      if (!id) {
        return;
      }

      try {
        setPageLoading(true);
        const detail = await projectService.getDetail(id);
        setProject(detail);

        form.setFieldsValue({
          code: detail.code ?? detail.projectCode ?? "",
          name: detail.name ?? "",
          location: detail.location ?? "",
          scope: detail.scope ?? "",
          customerId: detail.customerId ?? undefined,
          warehouseId: detail.warehouseId ?? detail.primaryWarehouseId ?? undefined,
          assignedProjectManager: detail.assignedProjectManager ?? "",
          linkedOrderReference: detail.linkedOrderReference ?? "",
          status: detail.status ?? "ACTIVE",
        });

        try {
          setLookupLoading(true);
          const [customerListResponse, projects] = await Promise.all([
            customerService.getList({ page: 1, pageSize: 100, status: "ACTIVE" }),
            projectService.getList({ page: 1, pageSize: 100 }),
          ]);

          setCustomerOptions(buildCustomerOptions(customerListResponse.items));
          setWarehouseOptions(
            buildWarehouseOptions(projects, [
              {
                id: detail.primaryWarehouseId ?? detail.warehouseId,
                name: detail.primaryWarehouseName ?? detail.warehouseName ?? detail.primaryWarehouseId ?? detail.warehouseId,
              },
              { id: detail.backupWarehouseId, name: detail.backupWarehouseName ?? detail.backupWarehouseId },
            ]),
          );
        } catch (lookupError) {
          setCustomerOptions([]);
          setWarehouseOptions([]);
          notify(getErrorMessage(lookupError, "Không thể tải dữ liệu chọn khách hàng và kho."), "error");
        } finally {
          setLookupLoading(false);
        }
      } catch (error) {
        notify(getErrorMessage(error, "Không thể tải dữ liệu dự án để cập nhật."), "error");
      } finally {
        setPageLoading(false);
      }
    };

    void loadPage();
  }, [form, id, notify]);

  const handleUpdate = async (values: ProjectEditFormValues) => {
    if (!id) {
      return;
    }

    try {
      setSaving(true);
      await projectService.update(id, {
        code: values.code?.trim() || undefined,
        name: values.name?.trim() || undefined,
        customerId: values.customerId,
        warehouseId: values.warehouseId,
        status: values.status,
        location: values.location?.trim() || undefined,
        scope: values.scope?.trim() || undefined,
        assignedProjectManager: values.assignedProjectManager?.trim() || undefined,
        linkedOrderReference: values.linkedOrderReference?.trim() || undefined,
      });
      notify("Đã lưu thay đổi dự án.", "success");
      navigate(backTarget);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể cập nhật dự án."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="Chỉnh sửa dự án"
      subtitle="Cập nhật thông tin nghiệp vụ để trang chi tiết dự án phản ánh đúng tình trạng vận hành hiện tại."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dự án</span> },
        { title: "Chỉnh sửa" },
      ]}
      loading={pageLoading}
    >
      {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã dự án trên đường dẫn." /> : null}

      {project ? <ProjectContextCard project={project} title="Dự án đang chỉnh sửa" /> : null}

      <Form<ProjectEditFormValues> form={form} layout="vertical" onFinish={handleUpdate}>
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <ProjectFormSection title="Thông tin cơ bản" description="Điều chỉnh thông tin nhận diện và phạm vi để các bộ phận phối hợp dễ hơn.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="Tên dự án" name="name" rules={[{ required: true, message: "Vui lòng nhập tên dự án." }]}>
                  <Input placeholder="Nhập tên dự án" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Mã dự án" name="code">
                  <Input placeholder="Nhập mã dự án" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Quản lý dự án" name="assignedProjectManager">
                  <Input placeholder="Nhập tên người phụ trách" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Mã đơn hàng liên kết" name="linkedOrderReference">
                  <Input placeholder="Nhập mã đơn hàng liên kết" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Địa điểm triển khai" name="location">
                  <Input placeholder="Nhập địa điểm triển khai" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Phạm vi công việc" name="scope">
                  <Input.TextArea rows={3} placeholder="Mô tả phạm vi triển khai" />
                </Form.Item>
              </Col>
            </Row>
          </ProjectFormSection>

          <ProjectFormSection title="Khách hàng và kho" description="Sử dụng danh sách chọn sẵn để tránh nhập sai mã kỹ thuật.">
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

          <ProjectFormSection title="Trạng thái dự án" description="Cập nhật trạng thái để các bộ phận nắm đúng mức độ ưu tiên.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="Trạng thái" name="status">
                  <Select options={PROJECT_STATUS_OPTIONS.map((item) => ({ ...item }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Alert
                  type="info"
                  showIcon
                  message="Cập nhật tiến độ ở trang riêng"
                  description={
                    <Button
                      type="link"
                      style={{ paddingInline: 0 }}
                      onClick={() => {
                        if (!id) {
                          return;
                        }
                        const navigation = buildProjectActionNavigation(ROUTE_URL.PROJECT_PROGRESS_UPDATE.replace(":id", id), location);
                        navigate(navigation.to, { state: navigation.state });
                      }}
                    >
                      Mở màn hình cập nhật tiến độ
                    </Button>
                  }
                />
              </Col>
            </Row>
          </ProjectFormSection>

          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              Lưu thay đổi
            </Button>
            <Button onClick={() => navigate(backTarget)} disabled={saving}>
              Quay lại
            </Button>
          </Space>
        </Space>
      </Form>
    </ProjectFormLayout>
  );
};

export default ProjectEditPage;
