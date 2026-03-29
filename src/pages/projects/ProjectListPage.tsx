import { Button, Card, Col, Input, Modal, Row, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import ProjectPageLayout from "./components/ProjectPageLayout";
import ProjectProgressBar from "./components/ProjectProgressBar";
import ProjectStatusTag from "./components/ProjectStatusTag";
import { displayText } from "./projectPresentation";

const PAGE_SIZE = 8;

const STATUS_OPTIONS = [
  { label: "NEW", value: "NEW" },
  { label: "IN_PROGRESS", value: "IN_PROGRESS" },
  { label: "ON_HOLD", value: "ON_HOLD" },
  { label: "DONE", value: "DONE" },
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "CANCELLED", value: "CANCELLED" },
];

const ProjectListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const canCreateProject = canPerformAction(role, "project.create");
  const canDeleteProject = canPerformAction(role, "project.delete");

  const [items, setItems] = useState<ProjectModel[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ProjectModel | null>(null);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await projectService.getList({
          keyword: keyword.trim() || undefined,
          status: status as ProjectModel["status"] | undefined,
        });
        setItems(result);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load projects"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, notify, status]);

  const columns = useMemo<ColumnsType<ProjectModel>>(
    () => [
      {
        title: "Project code",
        key: "code",
        render: (_, row) => displayText(row.projectCode ?? row.code),
      },
      {
        title: "Project name",
        dataIndex: "name",
        key: "name",
        render: (value: string) => displayText(value),
      },
      {
        title: "Customer",
        key: "customer",
        render: (_, row) => displayText(row.customerName ?? row.customerId),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (value: string | undefined) => <ProjectStatusTag status={value} />,
      },
      {
        title: "Progress",
        key: "progress",
        width: 220,
        render: (_, row) => <ProjectProgressBar value={row.progressPercent ?? row.progress} size="small" />,
      },
      {
        title: "Actions",
        key: "actions",
        width: 210,
        render: (_, row) => (
          <Space>
            <Button size="small" onClick={() => navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", row.id))}>
              View
            </Button>
            {canDeleteProject ? (
              <Button size="small" danger onClick={() => setDeletingItem(row)}>
                Soft delete
              </Button>
            ) : null}
          </Space>
        ),
      },
    ],
    [canDeleteProject, navigate],
  );

  const handleDeleteProject = async () => {
    if (!deletingItem) {
      return;
    }

    try {
      setDeleting(true);
      await projectService.softDelete(deletingItem.id, "Archived from project list");
      setItems((previous) => previous.filter((item) => item.id !== deletingItem.id));
      notify("Project archived (soft delete).", "success");
      setDeletingItem(null);
    } catch (err) {
      notify(getErrorMessage(err, "Cannot archive project"), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <ProjectPageLayout
        title="Project Management"
        subtitle="Track project lifecycle and execute project actions from one workspace."
        breadcrumbItems={[
          { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Home</span> },
          { title: "Projects" },
        ]}
        actions={
          canCreateProject ? (
            <Button type="primary" onClick={() => navigate(ROUTE_URL.PROJECT_CREATE)}>
              Create project
            </Button>
          ) : undefined
        }
      >
        <Card>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={16}>
              <Input.Search
                allowClear
                placeholder="Search by project name, code, customer..."
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(1);
                }}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                className="w-full"
                allowClear
                placeholder="Filter by status"
                value={status}
                options={STATUS_OPTIONS}
                onChange={(value: string | undefined) => {
                  setStatus(value);
                  setPage(1);
                }}
              />
            </Col>
          </Row>

          <Table<ProjectModel>
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={items}
            scroll={{ x: 900 }}
            locale={{ emptyText: "No projects found." }}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total: items.length,
              showSizeChanger: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} projects`,
              onChange: (nextPage) => setPage(nextPage),
            }}
          />
        </Card>
      </ProjectPageLayout>

      <Modal
        title="Soft delete project"
        open={Boolean(deletingItem)}
        onCancel={() => (deleting ? undefined : setDeletingItem(null))}
        closable={!deleting}
        maskClosable={!deleting}
        footer={[
          <Button key="cancel" onClick={() => setDeletingItem(null)} disabled={deleting}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" danger loading={deleting} onClick={handleDeleteProject}>
            Confirm
          </Button>,
        ]}
      >
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          This action archives the project because backend hard-delete API is not available.
        </Typography.Paragraph>
        {deletingItem ? <Typography.Text strong>{deletingItem.name}</Typography.Text> : null}
      </Modal>
    </>
  );
};

export default ProjectListPage;
