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
          notify(getErrorMessage(warehouseError, "KhÃ´ng thá»ƒ táº£i danh sÃ¡ch kho."), "error");
        } finally {
          setWarehouseLoading(false);
        }
      } catch (error) {
        notify(getErrorMessage(error, "KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u dá»± Ã¡n Ä‘á»ƒ gÃ¡n kho."), "error");
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
      notify("ÄÃ£ cáº­p nháº­t kho phá»¥ trÃ¡ch cho dá»± Ã¡n.", "success");
      navigate(backTarget);
    } catch (error) {
      notify(getErrorMessage(error, "KhÃ´ng thá»ƒ cáº­p nháº­t kho cho dá»± Ã¡n."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="GÃ¡n kho cho dá»± Ã¡n"
      subtitle="XÃ¡c nháº­n kho phá»¥ trÃ¡ch trong ngá»¯ cáº£nh Ä‘áº§y Ä‘á»§ Ä‘á»ƒ giáº£m rá»§i ro thao tÃ¡c nháº§m dá»± Ã¡n."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chá»§</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dá»± Ã¡n</span> },
        { title: "GÃ¡n kho" },
      ]}
      loading={pageLoading}
    >
      {!id ? <Alert type="warning" showIcon message="KhÃ´ng tÃ¬m tháº¥y mÃ£ dá»± Ã¡n trÃªn Ä‘Æ°á»ng dáº«n." /> : null}

      {project ? (
        <ProjectContextCard
          project={project}
          title="Dá»± Ã¡n Ä‘ang cáº­p nháº­t kho"
          highlightWarehouseChange
          nextWarehouseId={selectedWarehouseId}
          nextWarehouseLabel={selectedWarehouseLabel}
        />
      ) : null}

      <Form<AssignWarehouseFormValues> form={form} layout="vertical" onFinish={handleAssign}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <ProjectFormSection title="ThÃ´ng tin gÃ¡n kho" description="Chá»n kho má»›i vÃ  ghi lÃ½ do Ä‘á»ƒ Ä‘á»™i váº­n hÃ nh dá»… kiá»ƒm tra vá» sau.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Kho phá»¥ trÃ¡ch"
                  name="warehouseId"
                  rules={[{ required: true, message: "Vui lÃ²ng chá»n kho phá»¥ trÃ¡ch." }]}
                  help={!warehouseLoading && warehouseOptions.length === 0 ? "Hiá»‡n chÆ°a cÃ³ dá»¯ liá»‡u kho Ä‘á»ƒ lá»±a chá»n." : undefined}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={warehouseOptions}
                    loading={warehouseLoading}
                    placeholder={warehouseLoading ? "Äang táº£i danh sÃ¡ch kho..." : "Chá»n kho phá»¥ trÃ¡ch"}
                    notFoundContent="ChÆ°a cÃ³ dá»¯ liá»‡u kho."
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="LÃ½ do cáº­p nháº­t kho" name="assignmentReason" rules={[{ max: 1000, message: "LÃ½ do tá»‘i Ä‘a 1000 kÃ½ tá»±." }]}>
                  <Input.TextArea rows={3} placeholder="VÃ­ dá»¥: Äiá»u phá»‘i láº¡i theo nÄƒng lá»±c tá»“n kho khu vá»±c miá»n Nam" />
                </Form.Item>
              </Col>
            </Row>
          </ProjectFormSection>

          <Space>
            <Button type="primary" htmlType="submit" loading={saving} disabled={warehouseLoading}>
              XÃ¡c nháº­n gÃ¡n kho
            </Button>
            <Button onClick={() => navigate(backTarget)} disabled={saving}>
              Quay láº¡i
            </Button>
          </Space>
        </Space>
      </Form>
    </ProjectFormLayout>
  );
};

export default ProjectAssignWarehousePage;

