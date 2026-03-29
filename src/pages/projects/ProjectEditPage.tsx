import { Button, Col, Form, Input, Row, Select, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";
import ProjectFormLayout from "./components/ProjectFormLayout";
import { PROJECT_STATUS_OPTIONS } from "./projectForm.constants";
import { resolveProjectBackTarget } from "./projectNavigation";

type ProjectEditFormValues = {
  code?: string;
  name?: string;
  customerId?: string;
  warehouseId?: string;
  status?: string;
};

const ProjectEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [form] = Form.useForm<ProjectEditFormValues>();
  const [pageLoading, setPageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { notify } = useNotify();

  const backTarget = useMemo(() => resolveProjectBackTarget(location, id), [id, location]);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setPageLoading(true);
        const detail = await projectService.getDetail(id);
        form.setFieldsValue({
          code: detail.code ?? detail.projectCode ?? "",
          name: detail.name ?? "",
          customerId: detail.customerId ?? "",
          warehouseId: detail.warehouseId ?? detail.primaryWarehouseId ?? "",
          status: detail.status ?? "NEW",
        });
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load project for update"), "error");
      } finally {
        setPageLoading(false);
      }
    };

    void load();
  }, [form, id, notify]);

  const handleUpdate = async (values: ProjectEditFormValues) => {
    if (!id) {
      return;
    }

    try {
      setSaving(true);
      await projectService.update(id, {
        code: values.code,
        name: values.name,
        customerId: values.customerId,
        warehouseId: values.warehouseId,
        status: values.status,
      });
      navigate(backTarget);
    } catch (err) {
      notify(getErrorMessage(err, "Cannot update project"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="Update Project"
      subtitle="Edit project core fields while keeping the current business flow unchanged."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Home</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Projects</span> },
        { title: "Update" },
      ]}
      loading={pageLoading}
    >
      <Form<ProjectEditFormValues> form={form} layout="vertical" onFinish={handleUpdate}>
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item label="Project code" name="code">
              <Input placeholder="Enter project code" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Project name"
              name="name"
              rules={[{ required: true, message: "Project name is required." }, { max: 255, message: "Project name max length is 255." }]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Customer ID" name="customerId" rules={[{ required: true, message: "Customer ID is required." }]}>
              <Input placeholder="Enter customer id" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Warehouse ID" name="warehouseId">
              <Input placeholder="Enter warehouse id" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Status" name="status">
              <Select options={PROJECT_STATUS_OPTIONS.map((item) => ({ ...item }))} />
            </Form.Item>
          </Col>
        </Row>

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>
            Save changes
          </Button>
          <Button onClick={() => navigate(backTarget)} disabled={saving}>
            Back
          </Button>
        </Space>
      </Form>
    </ProjectFormLayout>
  );
};

export default ProjectEditPage;
