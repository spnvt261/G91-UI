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
        notify(getErrorMessage(err, "Không thể tải dữ liệu dự án để cập nhật"), "error");
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
      notify(getErrorMessage(err, "Không thể cập nhật dự án"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="Cập nhật dự án"
      subtitle="Chỉnh sửa thông tin chính của dự án và giữ nguyên luồng nghiệp vụ hiện tại."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dự án</span> },
        { title: "Cập nhật" },
      ]}
      loading={pageLoading}
    >
      <Form<ProjectEditFormValues> form={form} layout="vertical" onFinish={handleUpdate}>
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
            <Form.Item label="Mã khách hàng" name="customerId" rules={[{ required: true, message: "Vui lòng nhập mã khách hàng." }]}>
              <Input placeholder="Nhập mã khách hàng" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Mã kho" name="warehouseId">
              <Input placeholder="Nhập mã kho" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Trạng thái" name="status">
              <Select options={PROJECT_STATUS_OPTIONS.map((item) => ({ ...item }))} />
            </Form.Item>
          </Col>
        </Row>

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>
            Lưu cập nhật
          </Button>
          <Button onClick={() => navigate(backTarget)} disabled={saving}>
            Quay lại
          </Button>
        </Space>
      </Form>
    </ProjectFormLayout>
  );
};

export default ProjectEditPage;
