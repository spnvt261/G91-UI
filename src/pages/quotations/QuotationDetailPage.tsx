import { ArrowLeftOutlined, FileAddOutlined, ReloadOutlined, SendOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Descriptions, Divider, Empty, Flex, Layout, Row, Skeleton, Space, Statistic, Tooltip, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { QuotationDetailResponseData, QuotationHistoryResponseData } from "../../models/quotation/quotation.model";
import { quotationService } from "../../services/quotation/quotation.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import QuotationHistoryTimeline from "./components/QuotationHistoryTimeline";
import QuotationItemsTable, { type QuotationItemTableRow } from "./components/QuotationItemsTable";
import QuotationStatusTag from "./components/QuotationStatusTag";
import { formatQuotationCurrency, formatQuotationDate, formatQuotationDateTime } from "./quotation.ui";

const QuotationDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotify();

  const role = getStoredUserRole();
  const canSubmitDraft = canPerformAction(role, "quotation.create");
  const canShowCreateContract = canPerformAction(role, "contract.create");

  const [detail, setDetail] = useState<QuotationDetailResponseData | null>(null);
  const [history, setHistory] = useState<QuotationHistoryResponseData["events"]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadData = useCallback(async (quotationId: string) => {
    const [detailResponse, historyResponse] = await Promise.all([quotationService.getRawDetail(quotationId), quotationService.getHistory(quotationId)]);
    setDetail(detailResponse);
    setHistory(historyResponse.events ?? []);
  }, []);

  const reloadData = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setPageError(null);
      await loadData(id);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải chi tiết báo giá.");
      setPageError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, loadData, notify]);

  useEffect(() => {
    void reloadData();
  }, [reloadData]);

  const handleSubmitDraft = async () => {
    if (!id) {
      return;
    }

    try {
      setSubmitting(true);
      await quotationService.submit(id);
      await loadData(id);
      notify("Đã gửi báo giá từ bản nháp thành công.", "success");
    } catch (error) {
      notify(getErrorMessage(error, "Không thể gửi bản nháp báo giá."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const quotation = detail?.quotation;
  const canSubmitDraftNow = Boolean(canSubmitDraft && detail?.actions?.customerCanEdit && quotation?.status === "DRAFT");
  const canCreateContractNow = Boolean(canShowCreateContract && detail?.actions?.accountantCanCreateContract);

  const itemRows = useMemo<QuotationItemTableRow[]>(() => {
    if (!detail) {
      return [];
    }

    return detail.items.map((item, index) => ({
      key: `${item.productId}-${index}`,
      productCode: item.productCode ?? item.productId,
      productName: item.productName ?? "Sản phẩm chưa có tên",
      quantity: item.quantity,
      unitPrice: item.unitPrice ?? 0,
      amount: item.amount ?? item.totalPrice ?? 0,
    }));
  }, [detail]);

  const subTotal = useMemo(() => {
    if (!detail) {
      return 0;
    }

    if (typeof detail.pricing?.subTotal === "number") {
      return detail.pricing.subTotal;
    }

    return itemRows.reduce((sum, item) => sum + (item.amount ?? 0), 0);
  }, [detail, itemRows]);

  const totalAmount = detail?.pricing?.totalAmount ?? quotation?.totalAmount ?? 0;
  const discountAmount = detail?.pricing?.discountAmount ?? Math.max(subTotal - totalAmount, 0);

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title={
            <Space size={10} wrap>
              <Typography.Text strong>{quotation?.quotationNumber || (id ? `Báo giá #${id}` : "Chi tiết báo giá")}</Typography.Text>
              {quotation ? <QuotationStatusTag status={quotation.status} /> : null}
            </Space>
          }
          subtitle="Theo dõi tình trạng xử lý báo giá, thông tin thương mại và các hành động tiếp theo tại một nơi."
          actions={
            <Flex gap={8} wrap="wrap" justify="flex-end">
              {canSubmitDraft ? (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={submitting}
                  onClick={() => void handleSubmitDraft()}
                  disabled={!canSubmitDraftNow}
                >
                  Gửi báo giá
                </Button>
              ) : null}

              {canShowCreateContract ? (
                <Tooltip title={canCreateContractNow ? "Tạo hợp đồng từ báo giá này" : "Báo giá chưa đủ điều kiện để tạo hợp đồng"}>
                  <Button
                    type={canCreateContractNow ? "primary" : "default"}
                    icon={<FileAddOutlined />}
                    onClick={() => navigate(ROUTE_URL.CONTRACT_CREATE.replace(":quotationId", quotation?.id ?? ""))}
                    disabled={!canCreateContractNow}
                  >
                    Tạo hợp đồng
                  </Button>
                </Tooltip>
              ) : null}

              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
                Quay lại danh sách
              </Button>
            </Flex>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Báo giá", url: ROUTE_URL.QUOTATION_LIST },
                { label: "Chi tiết" },
              ]}
            />
          }
        />
      }
      body={
        <Layout style={{ background: "transparent" }}>
          {loading ? (
            <Card bordered={false} className="border border-slate-200">
              <Skeleton active paragraph={{ rows: 10 }} />
            </Card>
          ) : pageError ? (
            <Alert
              type="error"
              showIcon
              message="Không thể tải chi tiết báo giá."
              description={pageError}
              action={
                <Button size="small" icon={<ReloadOutlined />} onClick={() => void reloadData()}>
                  Thử lại
                </Button>
              }
            />
          ) : !detail ? (
            <Card bordered={false} className="border border-slate-200">
              <Empty description="Không tìm thấy báo giá cần xem." />
            </Card>
          ) : (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              {quotation?.status === "DRAFT" ? (
                <Alert
                  type="warning"
                  showIcon
                  message="Báo giá đang ở trạng thái nháp."
                  description="Bạn có thể rà soát thông tin và gửi báo giá để chuyển sang bước xử lý tiếp theo."
                  action={
                    canSubmitDraft ? (
                      <Button size="small" type="primary" loading={submitting} onClick={() => void handleSubmitDraft()} disabled={!canSubmitDraftNow}>
                        Gửi báo giá
                      </Button>
                    ) : undefined
                  }
                />
              ) : null}

              <Row gutter={[16, 16]} align="top">
                <Col xs={24} xl={16}>
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Card bordered={false} className="border border-slate-200">
                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        <Typography.Title level={5} className="!mb-0">
                          1. Tổng quan báo giá
                        </Typography.Title>

                        <Descriptions column={2} size="small" colon={false}>
                          <Descriptions.Item label="Mã báo giá">{quotation?.quotationNumber || quotation?.id || "-"}</Descriptions.Item>
                          <Descriptions.Item label="Trạng thái">{quotation ? <QuotationStatusTag status={quotation.status} compact /> : "-"}</Descriptions.Item>
                          <Descriptions.Item label="Ngày tạo">{formatQuotationDateTime(quotation?.createdAt)}</Descriptions.Item>
                          <Descriptions.Item label="Hiệu lực đến">{formatQuotationDate(quotation?.validUntil, "Chưa xác định")}</Descriptions.Item>
                          <Descriptions.Item label="Tổng báo giá">{formatQuotationCurrency(totalAmount)}</Descriptions.Item>
                        </Descriptions>
                      </Space>
                    </Card>

                    <Card bordered={false} className="border border-slate-200">
                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        <Typography.Title level={5} className="!mb-0">
                          2. Khách hàng / dự án
                        </Typography.Title>

                        <Descriptions column={1} size="small" colon={false}>
                          <Descriptions.Item label="Khách hàng">{detail.customer?.companyName || detail.customer?.id || "Chưa cập nhật"}</Descriptions.Item>
                          <Descriptions.Item label="Mã khách hàng">{detail.customer?.id || "Chưa cập nhật"}</Descriptions.Item>
                          <Descriptions.Item label="Dự án">{detail.project?.name || "Chưa gắn dự án"}</Descriptions.Item>
                          <Descriptions.Item label="Mã dự án">{detail.project?.projectCode || detail.project?.id || "Chưa cập nhật"}</Descriptions.Item>
                        </Descriptions>
                      </Space>
                    </Card>

                    <Card bordered={false} className="border border-slate-200">
                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        <Typography.Title level={5} className="!mb-0">
                          3. Thông tin thương mại
                        </Typography.Title>

                        <Descriptions column={1} size="small" colon={false}>
                          <Descriptions.Item label="Mã khuyến mãi">{detail.pricing?.promotionCode || "Không áp dụng"}</Descriptions.Item>
                          <Descriptions.Item label="Tạm tính">{formatQuotationCurrency(subTotal)}</Descriptions.Item>
                          <Descriptions.Item label="Giảm giá">{formatQuotationCurrency(discountAmount)}</Descriptions.Item>
                          <Descriptions.Item label="Tổng cuối">
                            <Typography.Text strong>{formatQuotationCurrency(totalAmount)}</Typography.Text>
                          </Descriptions.Item>
                        </Descriptions>
                      </Space>
                    </Card>

                    <Card bordered={false} className="border border-slate-200">
                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        <Typography.Title level={5} className="!mb-0">
                          4. Giao hàng / ghi chú
                        </Typography.Title>
                        <Typography.Text>{detail.deliveryRequirements || "Chưa có yêu cầu giao hàng."}</Typography.Text>
                      </Space>
                    </Card>

                    <Card bordered={false} className="border border-slate-200">
                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        <Typography.Title level={5} className="!mb-0">
                          Danh sách sản phẩm
                        </Typography.Title>

                        <QuotationItemsTable items={itemRows} emptyDescription="Chưa có sản phẩm trong báo giá này." />
                      </Space>
                    </Card>
                  </Space>
                </Col>

                <Col xs={24} xl={8}>
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Card bordered={false} className="border border-slate-200">
                      <Space direction="vertical" size={10} style={{ width: "100%" }}>
                        <Typography.Title level={5} className="!mb-0">
                          Tổng tiền báo giá
                        </Typography.Title>

                        <Statistic title="Tạm tính" value={subTotal} formatter={(value) => formatQuotationCurrency(Number(value ?? 0))} />
                        <Statistic title="Giảm giá" value={discountAmount} formatter={(value) => formatQuotationCurrency(Number(value ?? 0))} />

                        <Divider style={{ margin: "4px 0" }} />

                        <Statistic
                          title="Tổng cuối"
                          value={totalAmount}
                          valueStyle={{ color: "#0958d9", fontWeight: 700 }}
                          formatter={(value) => formatQuotationCurrency(Number(value ?? 0))}
                        />

                        {canShowCreateContract ? (
                          <Alert
                            type={canCreateContractNow ? "success" : "info"}
                            showIcon
                            message={canCreateContractNow ? "Báo giá đã sẵn sàng để tạo hợp đồng." : "Báo giá chưa đủ điều kiện tạo hợp đồng."}
                            action={
                              <Button
                                size="small"
                                type={canCreateContractNow ? "primary" : "default"}
                                disabled={!canCreateContractNow}
                                onClick={() => navigate(ROUTE_URL.CONTRACT_CREATE.replace(":quotationId", quotation?.id ?? ""))}
                              >
                                Tạo hợp đồng
                              </Button>
                            }
                          />
                        ) : null}
                      </Space>
                    </Card>

                    <Card bordered={false} className="border border-slate-200">
                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        <Typography.Title level={5} className="!mb-0">
                          Lịch sử xử lý
                        </Typography.Title>
                        <QuotationHistoryTimeline events={history} />
                      </Space>
                    </Card>
                  </Space>
                </Col>
              </Row>
            </Space>
          )}
        </Layout>
      }
    />
  );
};

export default QuotationDetailPage;
