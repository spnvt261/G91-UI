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
        notify(getErrorMessage(err, "Cannot load project progress"), "error");
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
      notify("Progress must be between 0 and 100.", "error");
      return;
    }

    try {
      setSaving(true);
      await projectService.updateProgress(id, {
        progressPercent: normalizedProgress,
        progressStatus: values.progressStatus?.trim() || undefined,
        phase: values.phase?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
        changeReason: "Updated from project progress flow",
      });
      notify("Project progress updated successfully.", "success");
      navigate(backTarget);
    } catch (err) {
      notify(getErrorMessage(err, "Cannot update project progress"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="Update Progress"
      subtitle="Record latest progress and execution notes for this project."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Home</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Projects</span> },
        { title: "Update progress" },
      ]}
      loading={pageLoading}
    >
      {!id ? <Alert type="warning" showIcon message="Project id is missing from URL." /> : null}

      <Form<ProjectProgressFormValues> form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Progress (%)"
              name="progressPercent"
              rules={[
                { required: true, message: "Progress is required." },
                {
                  validator: (_, value) => {
                    const normalized = clampProgress(value);
                    if (value == null || normalized !== value) {
                      return Promise.reject(new Error("Progress must be between 0 and 100."));
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
            <Form.Item label="Progress status" name="progressStatus">
              <Select
                showSearch
                allowClear
                options={PROGRESS_STATUS_OPTIONS.map((item) => ({ ...item }))}
                placeholder="Select progress status"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Phase" name="phase" rules={[{ max: 255, message: "Phase max length is 255." }]}>
              <Input placeholder="Foundation / Structure / Finishing..." />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Notes" name="notes" rules={[{ max: 1000, message: "Notes max length is 1000." }]}>
              <Input placeholder="Brief update notes" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item noStyle shouldUpdate>
          {() => (
            <div style={{ marginBottom: 24 }}>
              <Typography.Text type="secondary">Current progress preview</Typography.Text>
              <div style={{ marginTop: 8 }}>
                <ProjectProgressBar value={form.getFieldValue("progressPercent")} showMeta />
              </div>
            </div>
          )}
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>
            Save progress
          </Button>
          <Button onClick={() => navigate(backTarget)} disabled={saving}>
            Back
          </Button>
        </Space>
      </Form>
    </ProjectFormLayout>
  );
};

export default ProjectProgressUpdatePage;
