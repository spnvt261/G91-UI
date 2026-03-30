import { Alert, Button, Card, Empty, Input, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ContractModel } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getErrorMessage } from "../shared/page.utils";
import ContractSummaryCards from "../contracts/components/ContractSummaryCards";
import {
  formatContractCurrency,
  formatContractDate,
  getContractDisplayNumber,
  isHighValueContract,
  isRecentContract,
  isTodayContract,
  isUrgentPendingContract,
} from "../contracts/contract.ui";

const DEFAULT_PAGE_SIZE = 8;

const ContractApprovalListPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();

  const [allItems, setAllItems] = useState<ContractModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const loadPendingContracts = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);
      const items = await contractService.getList({
        keyword: keyword || undefined,
        status: "PENDING",
      });
      setAllItems(items);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh sách hợp đồng chờ duyệt.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [keyword, notify]);

  useEffect(() => {
    void loadPendingContracts();
  }, [loadPendingContracts]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allItems.slice(start, start + pageSize);
  }, [allItems, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(allItems.length / pageSize));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [allItems.length, page, pageSize]);

  const columns = useMemo<ColumnsType<ContractModel>>(
    () => [
      {
        title: "Số hợp đồng",
        key: "contractNumber",
        width: 250,
        render: (_, row) => (
          <Space orientation="vertical" size={2}>
            <Space size={6}>
              <Typography.Text strong>{getContractDisplayNumber(row)}</Typography.Text>
              {isRecentContract(row.createdAt) ? (
                <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                  Mới
                </Tag>
              ) : null}
              {isHighValueContract(row.totalAmount) ? (
                <Tag color="volcano" style={{ marginInlineEnd: 0 }}>
                  Giá trị cao
                </Tag>
              ) : null}
            </Space>
            <Typography.Text type="secondary">Mã hệ thống: {row.id}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Khách hàng",
        key: "customer",
        render: (_, row) => (
          <Space orientation="vertical" size={1}>
            <Typography.Text>{row.customerName || "Chưa cập nhật tên khách hàng"}</Typography.Text>
            <Typography.Text type="secondary">{row.customerId || "-"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Báo giá",
        dataIndex: "quotationId",
        key: "quotationId",
        width: 180,
        render: (value?: string) => value || "-",
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 180,
        align: "right",
        render: (value: number) => <Typography.Text strong>{formatContractCurrency(value)}</Typography.Text>,
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        render: (value?: string) => formatContractDate(value),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 180,
        render: (_, row) => (
          <Button
            type="primary"
            ghost
            onClick={(event) => {
              event.stopPropagation();
              navigate(ROUTE_URL.CONTRACT_APPROVAL_DETAIL.replace(":id", row.id));
            }}
          >
            Xem và phê duyệt
          </Button>
        ),
      },
    ],
    [navigate],
  );

  const summaryCards = useMemo(
    () => [
      {
        key: "total",
        label: "Tổng chờ duyệt",
        value: allItems.length,
        description: "Toàn bộ hợp đồng đang ở trạng thái chờ owner duyệt",
      },
      {
        key: "today",
        label: "Phát sinh hôm nay",
        value: allItems.filter((item) => isTodayContract(item.createdAt)).length,
        valueColor: "#1677ff",
        description: "Hợp đồng mới cần xử lý sớm",
      },
      {
        key: "highValue",
        label: "Giá trị lớn",
        value: allItems.filter((item) => isHighValueContract(item.totalAmount)).length,
        valueColor: "#d4380d",
        description: "Giá trị từ 1 tỷ VND trở lên",
      },
      {
        key: "urgent",
        label: "Cần xử lý sớm",
        value: allItems.filter((item) => isUrgentPendingContract(item)).length,
        valueColor: "#d48806",
        description: "Hợp đồng quá 3 ngày hoặc giá trị cao",
      },
    ],
    [allItems],
  );

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Danh sách hợp đồng chờ phê duyệt"
          subtitle="Hộp thư phê duyệt dành cho owner: tập trung các hợp đồng cần ra quyết định và ưu tiên xử lý theo mức độ quan trọng."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Phê duyệt hợp đồng" },
              ]}
            />
          }
        />
      }
      body={
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <ContractSummaryCards items={summaryCards} loading={loading} />

          <Card variant="borderless" className="shadow-sm">
            <Space orientation="vertical" size={16} style={{ width: "100%" }}>
              <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
                <Input.Search
                  allowClear
                  value={keywordInput}
                  style={{ maxWidth: 520 }}
                  placeholder="Tìm theo số hợp đồng, khách hàng hoặc mã báo giá"
                  onChange={(event) => setKeywordInput(event.target.value)}
                  onSearch={(value) => {
                    setKeyword(value.trim());
                    setPage(1);
                  }}
                />

                <Button
                  onClick={() => {
                    setKeywordInput("");
                    setKeyword("");
                    setPage(1);
                  }}
                >
                  Xóa tìm kiếm
                </Button>
              </Space>

              {listError ? (
                <Alert
                  type="error"
                  showIcon
                  message="Không thể tải danh sách phê duyệt"
                  description={listError}
                  action={
                    <Button size="small" onClick={() => void loadPendingContracts()}>
                      Thử lại
                    </Button>
                  }
                />
              ) : null}

              <Table<ContractModel>
                rowKey="id"
                size="middle"
                columns={columns}
                dataSource={pagedItems}
                loading={{ spinning: loading, description: "Đang tải danh sách chờ phê duyệt..." }}
                rowClassName={() => "cursor-pointer"}
                onRow={(record) => ({
                  onClick: () => navigate(ROUTE_URL.CONTRACT_APPROVAL_DETAIL.replace(":id", record.id)),
                  style: isHighValueContract(record.totalAmount)
                    ? { backgroundColor: "#fff7e6" }
                    : isRecentContract(record.createdAt)
                      ? { backgroundColor: "#f0f9ff" }
                      : undefined,
                })}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không có hợp đồng nào đang chờ phê duyệt."
                    />
                  ),
                }}
                pagination={{
                  current: page,
                  pageSize,
                  total: allItems.length,
                  placement: ["bottomEnd"],
                  showSizeChanger: true,
                  pageSizeOptions: [8, 16, 24, 32],
                  showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} hợp đồng`,
                }}
                onChange={(pagination) => {
                  setPage(pagination.current ?? page);
                  setPageSize(pagination.pageSize ?? pageSize);
                }}
                scroll={{ x: 1100 }}
              />
            </Space>
          </Card>
        </Space>
      }
    />
  );
};

export default ContractApprovalListPage;
