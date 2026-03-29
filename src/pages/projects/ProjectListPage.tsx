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
  { label: "Mới", value: "NEW" },
  { label: "Đang thực hiện", value: "IN_PROGRESS" },
  { label: "Tạm dừng", value: "ON_HOLD" },
  { label: "Hoàn thành", value: "DONE" },
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Đã hủy", value: "CANCELLED" },
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
        notify(getErrorMessage(err, "Không thể tải danh sách dự án"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, notify, status]);

  const columns = useMemo<ColumnsType<ProjectModel>>(
    () => [
      {
        title: "Mã dự án",
        key: "code",
        render: (_, row) => displayText(row.projectCode ?? row.code),
      },
      {
        title: "Tên dự án",
        dataIndex: "name",
        key: "name",
        render: (value: string) => displayText(value),
      },
      {
        title: "Khách hàng",
        key: "customer",
        render: (_, row) => displayText(row.customerName ?? row.customerId),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 160,
        render: (value: string | undefined) => <ProjectStatusTag status={value} />,
      },
      {
        title: "Tiến độ",
        key: "progress",
        width: 220,
        render: (_, row) => <ProjectProgressBar value={row.progressPercent ?? row.progress} size="small" />,
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 190,
        render: (_, row) => (
          <Space>
            <Button size="small" onClick={() => navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", row.id))}>
              Xem
            </Button>
            {canDeleteProject ? (
              <Button size="small" danger onClick={() => setDeletingItem(row)}>
                Xóa
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
      await projectService.softDelete(deletingItem.id, "Lưu trữ từ danh sách dự án");
      setItems((previous) => previous.filter((item) => item.id !== deletingItem.id));
      notify("Đã xóa dự án thành công.", "success");
      setDeletingItem(null);
    } catch (err) {
      notify(getErrorMessage(err, "Không thể xóa dự án"), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <ProjectPageLayout
        title="Quản lý dự án"
        subtitle="Theo dõi vòng đời dự án và thao tác nhanh trên cùng một màn hình."
        breadcrumbItems={[
          { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
          { title: "Dự án" },
        ]}
        actions={
          canCreateProject ? (
            <Button type="primary" onClick={() => navigate(ROUTE_URL.PROJECT_CREATE)}>
              Tạo dự án
            </Button>
          ) : undefined
        }
      >
        <Card>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={16}>
              <Input.Search
                allowClear
                placeholder="Tìm theo tên dự án, mã dự án, khách hàng..."
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
                placeholder="Lọc theo trạng thái"
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
            locale={{ emptyText: "Không có dữ liệu dự án." }}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total: items.length,
              showSizeChanger: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} dự án`,
              onChange: (nextPage) => setPage(nextPage),
            }}
          />
        </Card>
      </ProjectPageLayout>

      <Modal
        title="Xóa dự án"
        open={Boolean(deletingItem)}
        onCancel={() => (deleting ? undefined : setDeletingItem(null))}
        closable={!deleting}
        maskClosable={!deleting}
        footer={[
          <Button key="cancel" onClick={() => setDeletingItem(null)} disabled={deleting}>
            Hủy
          </Button>,
          <Button key="confirm" type="primary" danger loading={deleting} onClick={handleDeleteProject}>
            Xác nhận
          </Button>,
        ]}
      >
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          Hành động này sẽ chuyển dự án sang trạng thái lưu trữ vì backend chưa hỗ trợ API xóa cứng.
        </Typography.Paragraph>
        {deletingItem ? <Typography.Text strong>{deletingItem.name}</Typography.Text> : null}
      </Modal>
    </>
  );
};

export default ProjectListPage;
