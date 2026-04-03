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
import { buildCustomerOptions, buildWarehouseOptionsFromApi } from "./projectLookups";

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
          const [customerListResponse, warehouses] = await Promise.all([
            customerService.getList({ page: 1, pageSize: 100, status: "ACTIVE" }),
            projectService.getWarehouses(),
          ]);

          setCustomerOptions(buildCustomerOptions(customerListResponse.items));
          setWarehouseOptions(buildWarehouseOptionsFromApi(warehouses));
        } catch (lookupError) {
          setCustomerOptions([]);
          setWarehouseOptions([]);
          notify(getErrorMessage(lookupError, "KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u chá»n khÃ¡ch hÃ ng vÃ  kho."), "error");
        } finally {
          setLookupLoading(false);
        }
      } catch (error) {
        notify(getErrorMessage(error, "KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u dá»± Ã¡n Ä‘á»ƒ cáº­p nháº­t."), "error");
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
      notify("ÄÃ£ lÆ°u thay Ä‘á»•i dá»± Ã¡n.", "success");
      navigate(backTarget);
    } catch (error) {
      notify(getErrorMessage(error, "KhÃ´ng thá»ƒ cáº­p nháº­t dá»± Ã¡n."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="Chá»‰nh sá»­a dá»± Ã¡n"
      subtitle="Cáº­p nháº­t thÃ´ng tin nghiá»‡p vá»¥ Ä‘á»ƒ trang chi tiáº¿t dá»± Ã¡n pháº£n Ã¡nh Ä‘Ãºng tÃ¬nh tráº¡ng váº­n hÃ nh hiá»‡n táº¡i."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chá»§</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dá»± Ã¡n</span> },
        { title: "Chá»‰nh sá»­a" },
      ]}
      loading={pageLoading}
    >
      {!id ? <Alert type="warning" showIcon message="KhÃ´ng tÃ¬m tháº¥y mÃ£ dá»± Ã¡n trÃªn Ä‘Æ°á»ng dáº«n." /> : null}

      {project ? <ProjectContextCard project={project} title="Dá»± Ã¡n Ä‘ang chá»‰nh sá»­a" /> : null}

      <Form<ProjectEditFormValues> form={form} layout="vertical" onFinish={handleUpdate}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <ProjectFormSection title="ThÃ´ng tin cÆ¡ báº£n" description="Äiá»u chá»‰nh thÃ´ng tin nháº­n diá»‡n vÃ  pháº¡m vi Ä‘á»ƒ cÃ¡c bá»™ pháº­n phá»‘i há»£p dá»… hÆ¡n.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="TÃªn dá»± Ã¡n" name="name" rules={[{ required: true, message: "Vui lÃ²ng nháº­p tÃªn dá»± Ã¡n." }]}>
                  <Input placeholder="Nháº­p tÃªn dá»± Ã¡n" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="MÃ£ dá»± Ã¡n" name="code">
                  <Input placeholder="Nháº­p mÃ£ dá»± Ã¡n" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Quáº£n lÃ½ dá»± Ã¡n" name="assignedProjectManager">
                  <Input placeholder="Nháº­p tÃªn ngÆ°á»i phá»¥ trÃ¡ch" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="MÃ£ Ä‘Æ¡n hÃ ng liÃªn káº¿t" name="linkedOrderReference">
                  <Input placeholder="Nháº­p mÃ£ Ä‘Æ¡n hÃ ng liÃªn káº¿t" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Äá»‹a Ä‘iá»ƒm triá»ƒn khai" name="location">
                  <Input placeholder="Nháº­p Ä‘á»‹a Ä‘iá»ƒm triá»ƒn khai" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Pháº¡m vi cÃ´ng viá»‡c" name="scope">
                  <Input.TextArea rows={3} placeholder="MÃ´ táº£ pháº¡m vi triá»ƒn khai" />
                </Form.Item>
              </Col>
            </Row>
          </ProjectFormSection>

          <ProjectFormSection title="KhÃ¡ch hÃ ng vÃ  kho" description="Sá»­ dá»¥ng danh sÃ¡ch chá»n sáºµn Ä‘á»ƒ trÃ¡nh nháº­p sai mÃ£ ká»¹ thuáº­t.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="KhÃ¡ch hÃ ng" name="customerId" rules={[{ required: true, message: "Vui lÃ²ng chá»n khÃ¡ch hÃ ng." }]}>
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={customerOptions}
                    loading={lookupLoading}
                    placeholder={lookupLoading ? "Äang táº£i khÃ¡ch hÃ ng..." : "Chá»n khÃ¡ch hÃ ng"}
                    notFoundContent="ChÆ°a cÃ³ dá»¯ liá»‡u khÃ¡ch hÃ ng."
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Kho chÃ­nh"
                  name="warehouseId"
                  help={!lookupLoading && warehouseOptions.length === 0 ? "Hiá»‡n chÆ°a cÃ³ dá»¯ liá»‡u kho Ä‘á»ƒ chá»n." : undefined}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={warehouseOptions}
                    loading={lookupLoading}
                    placeholder={lookupLoading ? "Äang táº£i kho..." : "Chá»n kho phá»¥ trÃ¡ch"}
                    notFoundContent="ChÆ°a cÃ³ dá»¯ liá»‡u kho."
                  />
                </Form.Item>
              </Col>
            </Row>
          </ProjectFormSection>

          <ProjectFormSection title="Tráº¡ng thÃ¡i dá»± Ã¡n" description="Cáº­p nháº­t tráº¡ng thÃ¡i Ä‘á»ƒ cÃ¡c bá»™ pháº­n náº¯m Ä‘Ãºng má»©c Ä‘á»™ Æ°u tiÃªn.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="Tráº¡ng thÃ¡i" name="status">
                  <Select options={PROJECT_STATUS_OPTIONS.map((item) => ({ ...item }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Alert
                  type="info"
                  showIcon
                  message="Cáº­p nháº­t tiáº¿n Ä‘á»™ á»Ÿ trang riÃªng"
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
                      Má»Ÿ mÃ n hÃ¬nh cáº­p nháº­t tiáº¿n Ä‘á»™
                    </Button>
                  }
                />
              </Col>
            </Row>
          </ProjectFormSection>

          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              LÆ°u thay Ä‘á»•i
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

export default ProjectEditPage;

