import { Alert, Button, Col, Form, Input, InputNumber, Row, Select, Space } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { customerService } from "../../services/customer/customer.service";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";
import ProjectFormLayout from "./components/ProjectFormLayout";
import ProjectFormSection from "./components/ProjectFormSection";
import ProjectProgressBar from "./components/ProjectProgressBar";
import { PROJECT_STATUS_OPTIONS, clampProgress } from "./projectForm.constants";
import { buildCustomerOptions, buildWarehouseOptionsFromApi } from "./projectLookups";

type ProjectCreateFormValues = {
  code?: string;
  name?: string;
  location?: string;
  scope?: string;
  customerId?: string;
  warehouseId?: string;
  assignedProjectManager?: string;
  linkedOrderReference?: string;
  status?: string;
  progress?: number;
};

const ProjectCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [form] = Form.useForm<ProjectCreateFormValues>();

  const [customerOptions, setCustomerOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadLookupOptions = async () => {
      try {
        setLookupLoading(true);
        const [customerListResponse, warehouses] = await Promise.all([
          customerService.getList({ page: 1, pageSize: 100, status: "ACTIVE" }),
          projectService.getWarehouses(),
        ]);

        setCustomerOptions(buildCustomerOptions(customerListResponse.items));
        setWarehouseOptions(buildWarehouseOptionsFromApi(warehouses));
      } catch (error) {
        setCustomerOptions([]);
        setWarehouseOptions([]);
        notify(getErrorMessage(error, "KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u khÃ¡ch hÃ ng vÃ  kho."), "error");
      } finally {
        setLookupLoading(false);
      }
    };

    void loadLookupOptions();
  }, [notify]);

  const handleCreate = async (values: ProjectCreateFormValues) => {
    try {
      setSaving(true);
      const created = await projectService.create({
        code: values.code?.trim() || undefined,
        name: values.name?.trim() || "",
        customerId: values.customerId ?? "",
        warehouseId: values.warehouseId,
        status: values.status ?? "ACTIVE",
        progress: clampProgress(values.progress),
        location: values.location?.trim() || undefined,
        scope: values.scope?.trim() || undefined,
        assignedProjectManager: values.assignedProjectManager?.trim() || undefined,
        linkedOrderReference: values.linkedOrderReference?.trim() || undefined,
      });
      notify("Táº¡o dá»± Ã¡n thÃ nh cÃ´ng.", "success");
      navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", created.id));
    } catch (error) {
      notify(getErrorMessage(error, "KhÃ´ng thá»ƒ táº¡o dá»± Ã¡n."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProjectFormLayout
      title="Táº¡o dá»± Ã¡n má»›i"
      subtitle="Thiáº¿t láº­p dá»± Ã¡n theo Ä‘Ãºng ngá»¯ cáº£nh nghiá»‡p vá»¥ Ä‘á»ƒ Ä‘á»™i váº­n hÃ nh cÃ³ thá»ƒ theo dÃµi ngay sau khi lÆ°u."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chá»§</span> },
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)}>Dá»± Ã¡n</span> },
        { title: "Táº¡o má»›i" },
      ]}
    >
      <Form<ProjectCreateFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          status: "ACTIVE",
          progress: 0,
        }}
        onFinish={handleCreate}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <ProjectFormSection title="ThÃ´ng tin cÆ¡ báº£n" description="Nháº­p cÃ¡c thÃ´ng tin ná»n cá»§a dá»± Ã¡n Ä‘á»ƒ dá»… nháº­n diá»‡n vÃ  Ä‘iá»u phá»‘i.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="TÃªn dá»± Ã¡n"
                  name="name"
                  rules={[
                    { required: true, message: "Vui lÃ²ng nháº­p tÃªn dá»± Ã¡n." },
                    { max: 255, message: "TÃªn dá»± Ã¡n tá»‘i Ä‘a 255 kÃ½ tá»±." },
                  ]}
                >
                  <Input placeholder="VÃ­ dá»¥: Dá»± Ã¡n láº¯p Ä‘áº·t showroom Quáº­n 7" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="MÃ£ dá»± Ã¡n" name="code" rules={[{ max: 100, message: "MÃ£ dá»± Ã¡n tá»‘i Ä‘a 100 kÃ½ tá»±." }]}>
                  <Input placeholder="VÃ­ dá»¥: PRJ-SHOWROOM-Q7" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Quáº£n lÃ½ dá»± Ã¡n" name="assignedProjectManager" rules={[{ max: 255, message: "TÃªn quáº£n lÃ½ tá»‘i Ä‘a 255 kÃ½ tá»±." }]}>
                  <Input placeholder="Nháº­p tÃªn ngÆ°á»i phá»¥ trÃ¡ch chÃ­nh" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="MÃ£ Ä‘Æ¡n hÃ ng liÃªn káº¿t" name="linkedOrderReference" rules={[{ max: 255, message: "MÃ£ tham chiáº¿u tá»‘i Ä‘a 255 kÃ½ tá»±." }]}>
                  <Input placeholder="Nháº­p mÃ£ Ä‘Æ¡n hÃ ng náº¿u cÃ³" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Äá»‹a Ä‘iá»ƒm triá»ƒn khai" name="location" rules={[{ max: 255, message: "Äá»‹a Ä‘iá»ƒm tá»‘i Ä‘a 255 kÃ½ tá»±." }]}>
                  <Input placeholder="VÃ­ dá»¥: Quáº­n 7, TP. Há»“ ChÃ­ Minh" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Pháº¡m vi cÃ´ng viá»‡c" name="scope" rules={[{ max: 1000, message: "Pháº¡m vi tá»‘i Ä‘a 1000 kÃ½ tá»±." }]}>
                  <Input.TextArea rows={3} placeholder="MÃ´ táº£ pháº¡m vi chÃ­nh cá»§a dá»± Ã¡n" />
                </Form.Item>
              </Col>
            </Row>
          </ProjectFormSection>

          <ProjectFormSection title="KhÃ¡ch hÃ ng vÃ  kho" description="Thiáº¿t láº­p Ä‘Ãºng khÃ¡ch hÃ ng vÃ  kho phá»¥ trÃ¡ch ngay tá»« Ä‘áº§u Ä‘á»ƒ háº¡n cháº¿ sai lá»‡ch váº­n hÃ nh.">
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

          <ProjectFormSection title="Tráº¡ng thÃ¡i vÃ  tiáº¿n Ä‘á»™" description="Thiáº¿t láº­p tráº¡ng thÃ¡i má»Ÿ Ä‘áº§u vÃ  má»©c tiáº¿n Ä‘á»™ ban Ä‘áº§u Ä‘á»ƒ mÃ n hÃ¬nh chi tiáº¿t hiá»ƒn thá»‹ trá»±c quan.">
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="Tráº¡ng thÃ¡i dá»± Ã¡n" name="status">
                  <Select options={PROJECT_STATUS_OPTIONS.map((item) => ({ ...item }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Tiáº¿n Ä‘á»™ hiá»‡n táº¡i (%)"
                  name="progress"
                  rules={[
                    {
                      validator: (_, value) => {
                        const normalized = clampProgress(value);
                        if (value == null || normalized !== value) {
                          return Promise.reject(new Error("Tiáº¿n Ä‘á»™ pháº£i náº±m trong khoáº£ng 0 Ä‘áº¿n 100."));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber min={0} max={100} step={1} controls style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item noStyle shouldUpdate>
              {() => <ProjectProgressBar value={form.getFieldValue("progress")} showMeta />}
            </Form.Item>
          </ProjectFormSection>

          <Alert
            type="info"
            showIcon
            message="LÆ°u Ã½ khi táº¡o dá»± Ã¡n"
            description="Báº¡n cÃ³ thá»ƒ cáº­p nháº­t kho, tiáº¿n Ä‘á»™ vÃ  cÃ¡c má»‘c nghiá»‡m thu ngay trÃªn trang chi tiáº¿t dá»± Ã¡n sau khi táº¡o."
          />

          <Space>
            <Button type="primary" htmlType="submit" loading={saving} disabled={lookupLoading}>
              LÆ°u dá»± Ã¡n
            </Button>
            <Button onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} disabled={saving}>
              Quay láº¡i
            </Button>
          </Space>
        </Space>
      </Form>
    </ProjectFormLayout>
  );
};

export default ProjectCreatePage;

