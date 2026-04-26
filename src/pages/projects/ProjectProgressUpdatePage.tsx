import { Alert, Button, Col, Form, Input, InputNumber, Row, Select, Space, Steps } from "antd";
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
import ProjectProgressBar from "./components/ProjectProgressBar";
import { PROGRESS_STATUS_OPTIONS, clampProgress, normalizeProgressStatus } from "./projectForm.constants";
import { resolveProjectBackTarget } from "./projectNavigation";

type ProjectProgressFormValues = {
  progressPercent?: number;
  progressStatus?: string;
  phase?: string;
  notes?: string;
  evidenceDocuments?: Array<{
    documentType?: string;
    fileName?: string;
    fileUrl?: string;
    contentType?: string;
  }>;
};

const DOCUMENT_TYPE_OPTIONS = [
  { label: "Tài liệu", value: "DOCUMENT" },
  { label: "Ảnh", value: "PHOTO" },
  { label: "Minh chứng", value: "EVIDENCE" },
] as const;

const resolveProgressStep = (progress: number) => {
  if (progress >= 100) {
    return 3;
  }
  if (progress >= 75) {
    return 2;
  }
  if (progress >= 30) {
    return 1;
  }
  return 0;
};

const normalizeEvidenceDocuments = (values?: ProjectProgressFormValues["evidenceDocuments"]) => {
  const documents = (values ?? [])
    .map((item) => ({
      documentType: (item?.documentType ?? "DOCUMENT").trim().toUpperCase(),
      fileName: item?.fileName?.trim() ?? "",
      fileUrl: item?.fileUrl?.trim() ?? "",
      contentType: item?.contentType?.trim() || undefined,
    }))
    .filter((item) => item.fileName && item.fileUrl);

  return documents.length > 0 ? documents : undefined;
};

const ProjectProgressUpdatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { notify } = useNotify();
  const [form] = Form.useForm<ProjectProgressFormValues>();

  const [project, setProject] = useState<ProjectModel | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const backTarget = useMemo(() => resolveProjectBackTarget(location, id), [id, location]);
  const currentProgress = clampProgress(Form.useWatch("progressPercent", form));

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
          progressPercent: clampProgress(detail.progressPercent ?? detail.progress ?? 0),
          progressStatus: normalizeProgressStatus(detail.progressStatus),
          phase: "",
          notes: "",
          evidenceDocuments: [],
        });
      } catch (error) {
        notify(getErrorMessage(error, "Không thể tải dữ liệu tiến độ dự án."), "error");
      } finally {
        setPageLoading(false);
      }
    };

    void loadPage();
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

    const normalizedStatus = normalizeProgressStatus(values.progressStatus);
    if (normalizedStatus === "COMPLETED" && normalizedProgress < 100) {
      notify("Trạng thái COMPLETED chỉ hợp lệ khi tiến độ bằng 100%.", "error");
      return;
    }

    const normalizedEvidenceDocuments = normalizeEvidenceDocuments(values.evidenceDocuments);

    try {
      setSaving(true);
      form.setFields([{ name: ["evidenceDocuments"], errors: [] }]);
      await projectService.updateProgress(id, {
        progressPercent: normalizedProgress,
        progressStatus: normalizedStatus,
        phase: values.phase?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
        changeReason: "Cập nhật từ màn hình tiến độ dự án",
        evidenceDocuments: normalizedEvidenceDocuments,
      });
      notify("Đã cập nhật tiến độ dự án.", "success");
      navigate(backTarget);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể cập nhật tiến độ dự án.");
      if (message.includes("evidenceDocuments")) {
        form.setFields([
          {
            name: ["evidenceDocuments"],
            errors: ["Tiến độ này cần minh chứng. Vui lòng thêm ít nhất 1 tài liệu có tên tệp và đường dẫn."],
          },
        ]);
      }
      notify(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="Cập nhật tiến độ dự án"
      subtitle="Ghi nhận tiến độ mới nhất để trang chi tiết dự án phản ánh đúng trạng thái triển khai thực tế."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dự án</span> },
        { title: "Cập nhật tiến độ" },
      ]}
      loading={pageLoading}
    >
      {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã dự án trên đường dẫn." /> : null}

      {project ? <ProjectContextCard project={project} title="Dự án đang cập nhật tiến độ" /> : null}

      <Form<ProjectProgressFormValues> form={form} layout="vertical" onFinish={handleSubmit}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <ProjectFormSection title="Thông tin cập nhật tiến độ" description="Cập nhật tỷ lệ hoàn thành và ghi chú triển khai để đội dự án theo dõi thống nhất.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Tiến độ mới (%)"
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
                <Form.Item label="Giai đoạn hiện tại" name="phase" rules={[{ max: 50, message: "Giai đoạn tối đa 50 ký tự." }]}>
                  <Input placeholder="Ví dụ: Thi công kết cấu chính" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Ghi chú cập nhật" name="notes" rules={[{ max: 1000, message: "Ghi chú tối đa 1000 ký tự." }]}>
                  <Input.TextArea rows={3} placeholder="Mô tả ngắn thay đổi quan trọng trong đợt cập nhật này" />
                </Form.Item>
              </Col>
            </Row>
          </ProjectFormSection>

          <ProjectFormSection
            title="Minh chứng tiến độ"
            description="Nếu tiến độ chạm mốc đang chờ, máy chủ sẽ yêu cầu ít nhất một tài liệu minh chứng."
          >
            <Form.List name="evidenceDocuments">
              {(fields, { add, remove }) => (
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  {fields.map((field, index) => (
                    <Row key={field.key} gutter={[12, 0]} align="bottom">
                      <Col xs={24} md={6}>
                        <Form.Item
                          label={`Loại tài liệu #${index + 1}`}
                          name={[field.name, "documentType"]}
                          rules={[{ required: true, message: "Chọn loại tài liệu." }]}
                          initialValue="DOCUMENT"
                        >
                          <Select options={DOCUMENT_TYPE_OPTIONS.map((item) => ({ ...item }))} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item
                          label="Tên tệp"
                          name={[field.name, "fileName"]}
                          rules={[
                            { required: true, message: "Nhập tên tệp." },
                            { max: 255, message: "Tên tệp tối đa 255 ký tự." },
                          ]}
                        >
                          <Input placeholder="bien-ban-nghiem-thu.pdf" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={9}>
                        <Form.Item
                          label="Đường dẫn tệp"
                          name={[field.name, "fileUrl"]}
                          rules={[
                            { required: true, message: "Nhập đường dẫn tệp." },
                            { max: 500, message: "Đường dẫn tệp tối đa 500 ký tự." },
                          ]}
                        >
                          <Input placeholder="Nhập đường dẫn tài liệu" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={3}>
                        <Button danger onClick={() => remove(field.name)} style={{ width: "100%" }}>
                          Xóa
                        </Button>
                      </Col>
                      <Col xs={24} md={6}>
                        <Form.Item
                          label="Content-Type (tùy chọn)"
                          name={[field.name, "contentType"]}
                          rules={[{ max: 100, message: "Loại nội dung tối đa 100 ký tự." }]}
                        >
                          <Input placeholder="Ví dụ: tệp PDF" />
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}

                  <Button type="dashed" onClick={() => add({ documentType: "DOCUMENT" })}>
                    Thêm minh chứng
                  </Button>
                </Space>
              )}
            </Form.List>
          </ProjectFormSection>

          <ProjectFormSection title="Xem trước tác động" description="Kiểm tra mức tiến độ trước khi lưu để đảm bảo cập nhật đúng với tình trạng thực tế.">
            <ProjectProgressBar value={currentProgress} showMeta />
            <Steps
              size="small"
              current={resolveProgressStep(currentProgress)}
              items={[
                { title: "Khởi động" },
                { title: "Triển khai" },
                { title: "Nước rút" },
                { title: "Hoàn tất" },
              ]}
            />
          </ProjectFormSection>

          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              Lưu tiến độ
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

export default ProjectProgressUpdatePage;
