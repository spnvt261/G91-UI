import { Alert, Button, Col, Form, Input, Row, Select, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";
import ProjectContextCard from "./components/ProjectContextCard";
import ProjectFormLayout from "./components/ProjectFormLayout";
import ProjectFormSection from "./components/ProjectFormSection";
import { resolveProjectBackTarget } from "./projectNavigation";
import { buildWarehouseOptionsFromApi, findWarehouseLabel } from "./projectLookups";

type AssignWarehouseFormValues = {
  warehouseId?: string;
  assignmentReason?: string;
};

const ProjectAssignWarehousePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { notify } = useNotify();
  const [form] = Form.useForm<AssignWarehouseFormValues>();

  const [project, setProject] = useState<ProjectModel | null>(null);
  const [warehouseOptions, setWarehouseOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const backTarget = useMemo(() => resolveProjectBackTarget(location, id), [id, location]);
  const selectedWarehouseId = Form.useWatch("warehouseId", form);
  const selectedWarehouseLabel = findWarehouseLabel(selectedWarehouseId, warehouseOptions);

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
          warehouseId: detail.primaryWarehouseId ?? detail.warehouseId ?? undefined,
        });

        try {
          setWarehouseLoading(true);
          const warehouses = await projectService.getWarehouses();
          setWarehouseOptions(buildWarehouseOptionsFromApi(warehouses));
        } catch (warehouseError) {
          setWarehouseOptions([]);
          notify(getErrorMessage(warehouseError, "Không thể tải danh sách kho."), "error");
        } finally {
          setWarehouseLoading(false);
        }
      } catch (error) {
        notify(getErrorMessage(error, "Không thể tải dữ liệu dự án để gán kho."), "error");
      } finally {
        setPageLoading(false);
      }
    };

    void loadPage();
  }, [form, id, notify]);

  const handleAssign = async (values: AssignWarehouseFormValues) => {
    if (!id) {
      return;
    }

    try {
      setSaving(true);
      await projectService.assignWarehouse(id, {
        warehouseId: values.warehouseId,
        assignmentReason: values.assignmentReason?.trim() || undefined,
      });
      notify("Đã cập nhật kho phụ trách cho dự án.", "success");
      navigate(backTarget);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể cập nhật kho cho dự án."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="Gán kho cho dự án"
      subtitle="Xác nhận kho phụ trách trong ngữ cảnh đầy đủ để giảm rủi ro thao tác nhầm dự án."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dự án</span> },
        { title: "Gán kho" },
      ]}
      loading={pageLoading}
    >
      {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã dự án trên đường dẫn." /> : null}

      {project ? (
        <ProjectContextCard
          project={project}
          title="Dự án đang cập nhật kho"
          highlightWarehouseChange
          nextWarehouseId={selectedWarehouseId}
          nextWarehouseLabel={selectedWarehouseLabel}
        />
      ) : null}

      <Form<AssignWarehouseFormValues> form={form} layout="vertical" onFinish={handleAssign}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <ProjectFormSection title="Thông tin gán kho" description="Chọn kho mới và ghi lý do để đội vận hành dễ kiểm tra về sau.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Kho phụ trách"
                  name="warehouseId"
                  rules={[{ required: true, message: "Vui lòng chọn kho phụ trách." }]}
                  help={!warehouseLoading && warehouseOptions.length === 0 ? "Hiện chưa có dữ liệu kho để lựa chọn." : undefined}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={warehouseOptions}
                    loading={warehouseLoading}
                    placeholder={warehouseLoading ? "Đang tải danh sách kho..." : "Chọn kho phụ trách"}
                    notFoundContent="Chưa có dữ liệu kho."
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Lý do cập nhật kho" name="assignmentReason" rules={[{ max: 1000, message: "Lý do tối đa 1000 ký tự." }]}>
                  <Input.TextArea rows={3} placeholder="Ví dụ: Điều phối lại theo năng lực tồn kho khu vực miền Nam" />
                </Form.Item>
              </Col>
            </Row>
          </ProjectFormSection>

          <Space>
            <Button type="primary" htmlType="submit" loading={saving} disabled={warehouseLoading}>
              Xác nhận gán kho
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

export default ProjectAssignWarehousePage;
