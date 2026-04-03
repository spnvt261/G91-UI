import { MoreOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Dropdown, Empty, Input, Row, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import ProjectSummaryCards from "./components/ProjectSummaryCards";
import { PROJECT_STATUS_OPTIONS } from "./projectForm.constants";
import { displayText, formatProjectDate, isCompletedStatus, isInProgressStatus, isPausedOrCancelledStatus, resolveWarehouseDisplay } from "./projectPresentation";

interface ProjectListQueryState {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: string;
}

interface ProjectSummaryState {
  totalProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  pausedOrCancelledProjects: number;
}

const ProjectListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const canCreateProject = canPerformAction(role, "project.create");
  const canDeleteProject = canPerformAction(role, "project.delete");
  const canUpdateProject = canPerformAction(role, "project.update");
  const canAssignWarehouse = canPerformAction(role, "project.assign-warehouse");
  const canUpdateProgress = canPerformAction(role, "project.progress.update");
  const canViewFinancialSummary = canPerformAction(role, "project.financial-summary.view");
  const { notify } = useNotify();

  const [query, setQuery] = useState<ProjectListQueryState>({ page: 1, pageSize: 10 });
  const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState<ProjectModel[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const [summary, setSummary] = useState<ProjectSummaryState>({
    totalProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    pausedOrCancelledProjects: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);
      const result = await projectService.getListPaged({
        page: query.page,
        pageSize: query.pageSize,
        keyword: query.keyword,
        status: query.status as ProjectModel["status"] | undefined,
      });
      setItems(result.items);
      setTotalItems(result.pagination.totalItems);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh sách dự án.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query.keyword, query.page, query.pageSize, query.status]);

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const allProjects = await projectService.getList({ page: 1, pageSize: 300 });

      setSummary({
        totalProjects: allProjects.length,
        inProgressProjects: allProjects.filter((project) => isInProgressStatus(project.status)).length,
        completedProjects: allProjects.filter((project) => isCompletedStatus(project.status)).length,
        pausedOrCancelledProjects: allProjects.filter((project) => isPausedOrCancelledStatus(project.status)).length,
      });
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tải số liệu tổng quan dự án."), "warning");
    } finally {
      setSummaryLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const handleDeleteProject = useCallback(
    async (project: ProjectModel) => {
      try {
        setDeletingProjectId(project.id);
        await projectService.softDelete(project.id, "Lưu trữ từ danh sách dự án");
        notify("Đã chuyển dự án sang trạng thái lưu trữ.", "success");
        await Promise.all([loadProjects(), loadSummary()]);
      } catch (error) {
        notify(getErrorMessage(error, "Không thể lưu trữ dự án."), "error");
      } finally {
        setDeletingProjectId(null);
      }
    },
    [loadProjects, loadSummary, notify],
  );

  const columns = useMemo<ColumnsType<ProjectModel>>(
    () => [
      {
        title: "Dự án",
        key: "project",
        render: (_, row) => (
          <Space direction="vertical" size={2}>
            <Typography.Text strong>{displayText(row.name)}</Typography.Text>
            <Typography.Text type="secondary">
              Mã: {displayText(row.projectCode ?? row.code)} • Khách hàng: {displayText(row.customerName ?? row.customerId)}
            </Typography.Text>
            <Typography.Text type="secondary">
              Kho chính: {resolveWarehouseDisplay(row.primaryWarehouseName ?? row.warehouseName, row.primaryWarehouseId ?? row.warehouseId)}
            </Typography.Text>
          </Space>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 180,
        render: (value: string | undefined) => <ProjectStatusTag status={value} />,
      },
      {
        title: "Tiến độ thực hiện",
        key: "progress",
        width: 260,
        render: (_, row) => <ProjectProgressBar value={row.progressPercent ?? row.progress} size="small" showInfo={false} showMeta />,
      },
      {
        title: "Cập nhật",
        key: "updatedAt",
        width: 150,
        render: (_, row) => formatProjectDate(row.updatedAt),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 170,
        render: (_, row) => {
          const menuItems: MenuProps["items"] = [];

          if (canUpdateProject) {
            menuItems.push({
              key: "edit",
              label: "Chỉnh sửa dự án",
              onClick: () => navigate(ROUTE_URL.PROJECT_EDIT.replace(":id", row.id)),
            });
          }

          if (canAssignWarehouse) {
            menuItems.push({
              key: "assign-warehouse",
              label: "Gán kho",
              onClick: () => navigate(ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE.replace(":id", row.id)),
            });
          }

          if (canUpdateProgress) {
            menuItems.push({
              key: "update-progress",
              label: "Cập nhật tiến độ",
              onClick: () => navigate(ROUTE_URL.PROJECT_PROGRESS_UPDATE.replace(":id", row.id)),
            });
          }

          if (canViewFinancialSummary) {
            menuItems.push({
              key: "financial-summary",
              label: "Thống kê tài chính",
              onClick: () => navigate(ROUTE_URL.PROJECT_FINANCIAL_SUMMARY.replace(":id", row.id)),
            });
          }

          if (canDeleteProject) {
            if (menuItems.length > 0) {
              menuItems.push({ type: "divider" });
            }
            menuItems.push({
              key: "delete",
              label: "Lưu trữ dự án",
              danger: true,
              onClick: () => void handleDeleteProject(row),
            });
          }

          return (
            <Space>
              <Button type="link" onClick={() => navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", row.id))}>
                Xem chi tiết
              </Button>
              {menuItems.length > 0 ? (
                <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                  <Button icon={<MoreOutlined />} loading={deletingProjectId === row.id} />
                </Dropdown>
              ) : null}
            </Space>
          );
        },
      },
    ],
    [
      canAssignWarehouse,
      canDeleteProject,
      canViewFinancialSummary,
      canUpdateProgress,
      canUpdateProject,
      deletingProjectId,
      handleDeleteProject,
      navigate,
    ],
  );

  const resetFilters = () => {
    setSearchText("");
    setQuery((previous) => ({ ...previous, page: 1, keyword: undefined, status: undefined }));
  };

  return (
    <ProjectPageLayout
      title="Trung tâm dự án"
      subtitle="Theo dõi toàn bộ dự án, nắm nhanh tiến độ và xử lý tác vụ điều phối ngay trên một màn hình."
      breadcrumbItems={[
        { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
        { title: "Dự án" },
      ]}
      actions={
        canCreateProject ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTE_URL.PROJECT_CREATE)}>
            Tạo dự án
          </Button>
        ) : undefined
      }
    >
      <ProjectSummaryCards
        totalProjects={summary.totalProjects}
        inProgressProjects={summary.inProgressProjects}
        completedProjects={summary.completedProjects}
        pausedOrCancelledProjects={summary.pausedOrCancelledProjects}
        loading={summaryLoading}
      />

      <Card bordered={false} style={{ border: "1px solid #e6edf5" }}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} lg={12}>
              <Input.Search
                placeholder="Tìm theo tên dự án, mã dự án, khách hàng"
                allowClear
                enterButton="Tìm kiếm"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onSearch={(value) =>
                  setQuery((previous) => ({
                    ...previous,
                    page: 1,
                    keyword: value.trim() || undefined,
                  }))
                }
              />
            </Col>
            <Col xs={24} sm={12} lg={7}>
              <Select
                className="w-full"
                allowClear
                placeholder="Lọc theo trạng thái"
                value={query.status}
                options={PROJECT_STATUS_OPTIONS.map((option) => ({ ...option }))}
                onChange={(value) =>
                  setQuery((previous) => ({
                    ...previous,
                    page: 1,
                    status: value,
                  }))
                }
              />
            </Col>
            <Col xs={24} sm={12} lg={5}>
              <Button className="w-full" onClick={resetFilters}>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>

          {listError ? (
            <Alert
              type="error"
              showIcon
              message="Không thể tải danh sách dự án."
              description={
                <Space direction="vertical" size={4}>
                  <Typography.Text>{listError}</Typography.Text>
                  <Button size="small" onClick={() => void loadProjects()}>
                    Tải lại
                  </Button>
                </Space>
              }
            />
          ) : null}

          <Table<ProjectModel>
            rowKey="id"
            columns={columns}
            dataSource={items}
            loading={{ spinning: loading, tip: "Đang tải danh sách dự án..." }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có dự án phù hợp với bộ lọc hiện tại."
                />
              ),
            }}
            pagination={{
              current: query.page,
              pageSize: query.pageSize,
              total: totalItems,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} dự án`,
              onChange: (page, pageSize) =>
                setQuery((previous) => ({
                  ...previous,
                  page,
                  pageSize,
                })),
            }}
            scroll={{ x: 1100 }}
          />
        </Space>
      </Card>
    </ProjectPageLayout>
  );
};

export default ProjectListPage;
