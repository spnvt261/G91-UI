import { Alert, Button, Col, Descriptions, Form, Input, Row, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { useNotify } from "../../context/notifyContext";
import { getErrorMessage } from "../shared/page.utils";
import ProjectFormLayout from "./components/ProjectFormLayout";
import { resolveProjectBackTarget } from "./projectNavigation";
import { displayText } from "./projectPresentation";

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
  const [pageLoading, setPageLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const backTarget = useMemo(() => resolveProjectBackTarget(location, id), [id, location]);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setPageLoading(true);
        const detail = await projectService.getDetail(id);
        setProject(detail);
        form.setFieldsValue({
          warehouseId: detail.primaryWarehouseId ?? detail.warehouseId ?? "",
        });
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load project warehouse info"), "error");
      } finally {
        setPageLoading(false);
      }
    };

    void load();
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
      notify("Warehouse assigned successfully.", "success");
      navigate(backTarget);
    } catch (err) {
      notify(getErrorMessage(err, "Cannot assign warehouse"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="Assign Warehouse"
      subtitle="Update warehouse assignment for this project."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Home</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Projects</span> },
        { title: "Assign warehouse" },
      ]}
      loading={pageLoading}
    >
      {!id ? <Alert type="warning" showIcon message="Project id is missing from URL." /> : null}

      {project ? (
        <Descriptions size="small" column={{ xs: 1, md: 3 }}>
          <Descriptions.Item label="Project">{displayText(project.name)}</Descriptions.Item>
          <Descriptions.Item label="Project code">{displayText(project.projectCode ?? project.code)}</Descriptions.Item>
          <Descriptions.Item label="Current warehouse">{displayText(project.primaryWarehouseId ?? project.warehouseId)}</Descriptions.Item>
        </Descriptions>
      ) : null}

      <Form<AssignWarehouseFormValues> form={form} layout="vertical" onFinish={handleAssign}>
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Warehouse ID"
              name="warehouseId"
              rules={[{ required: true, message: "Warehouse ID is required." }, { max: 100, message: "Warehouse ID max length is 100." }]}
            >
              <Input placeholder="WH-001" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Reason" name="assignmentReason" rules={[{ max: 1000, message: "Reason max length is 1000." }]}>
              <Input placeholder="Optional reason for assignment" />
            </Form.Item>
          </Col>
        </Row>

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>
            Confirm assignment
          </Button>
          <Button onClick={() => navigate(backTarget)} disabled={saving}>
            Back
          </Button>
        </Space>
      </Form>
    </ProjectFormLayout>
  );
};

export default ProjectAssignWarehousePage;
