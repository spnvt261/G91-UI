import { Alert, Button, Col, Form, Input, InputNumber, Row, Select, Space, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";
import ProjectFormLayout from "./components/ProjectFormLayout";
import ProjectProgressBar from "./components/ProjectProgressBar";
import { PROGRESS_STATUS_OPTIONS, clampProgress } from "./projectForm.constants";
import { resolveProjectBackTarget } from "./projectNavigation";

type ProjectProgressFormValues = {
  progressPercent?: number;
  progressStatus?: string;
  phase?: string;
  notes?: string;
};

const ProjectProgressUpdatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { notify } = useNotify();
  const [form] = Form.useForm<ProjectProgressFormValues>();

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
        form.setFieldsValue({
          progressPercent: clampProgress(detail.progressPercent ?? detail.progress ?? 0),
          progressStatus: detail.progressStatus ?? "IN_PROGRESS",
          phase: "",
          notes: "",
        });
      } catch (err) {
        notify(getErrorMessage(err, "Không thể tải tiến độ dự án"), "error");
      } finally {
        setPageLoading(false);
      }
    };

    void load();
  }, [form, id, notify]);

  const handleSubmit = async (values: ProjectProgressFormValues) => {
    if (!id) {
      return;
    }

    const normalizedProgress = clampProgress(values.progressPercent);
    if (values.progressPercent == null || normalizedProgress !== values.progressPercent) {
      notify("Tiến độ phải nằm trong khoảng 0 đến 100.", "error");
      return;
    }

    try {
      setSaving(true);
      await projectService.updateProgress(id, {
        progressPercent: normalizedProgress,
        progressStatus: values.progressStatus?.trim() || undefined,
        phase: values.phase?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
        changeReason: "Cập nhật từ màn hình tiến độ dự án",
      });
      notify("Cập nhật tiến độ dự án thành công.", "success");
      navigate(backTarget);
    } catch (err) {
      notify(getErrorMessage(err, "Không thể cập nhật tiến độ dự án"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="Cập nhật tiến độ"
      subtitle="Ghi nhận tiến độ mới nhất và thông tin triển khai cho dự án."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dự án</span> },
        { title: "Cập nhật tiến độ" },
      ]}
      loading={pageLoading}
    >
      {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã dự án trên URL." /> : null}

      <Form<ProjectProgressFormValues> form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Tiến độ (%)"
              name="progressPercent"
              rules={[
                { required: true, message: "Vui lòng nhập tiến độ." },
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
              <InputNumber min={0} max={100} step={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Trạng thái tiến độ" name="progressStatus">
              <Select
                showSearch
                allowClear
                options={PROGRESS_STATUS_OPTIONS.map((item) => ({ ...item }))}
                placeholder="Chọn trạng thái tiến độ"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Giai đoạn" name="phase" rules={[{ max: 255, message: "Giai đoạn tối đa 255 ký tự." }]}>
              <Input placeholder="Móng / Kết cấu / Hoàn thiện..." />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Ghi chú" name="notes" rules={[{ max: 1000, message: "Ghi chú tối đa 1000 ký tự." }]}>
              <Input placeholder="Mô tả ngắn cập nhật tiến độ" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item noStyle shouldUpdate>
          {() => (
            <div style={{ marginBottom: 24 }}>
              <Typography.Text type="secondary">Xem trước tiến độ hiện tại</Typography.Text>
              <div style={{ marginTop: 8 }}>
                <ProjectProgressBar value={form.getFieldValue("progressPercent")} showMeta />
              </div>
            </div>
          )}
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>
            Lưu tiến độ
          </Button>
          <Button onClick={() => navigate(backTarget)} disabled={saving}>
            Quay lại
          </Button>
        </Space>
      </Form>
    </ProjectFormLayout>
  );
};

export default ProjectProgressUpdatePage;
