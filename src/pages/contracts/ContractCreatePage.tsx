import { Alert, Button, Card, Col, Empty, Input, Result, Row, Space, Statistic, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { QuotationModel } from "../../models/quotation/quotation.model";
import { contractService } from "../../services/contract/contract.service";
import { quotationService } from "../../services/quotation/quotation.service";
import { getErrorMessage } from "../shared/page.utils";
import ContractActionBar from "./components/ContractActionBar";
import ContractCreateSection from "./components/ContractCreateSection";
import ContractItemsTable, { type ContractItemRowData } from "./components/ContractItemsTable";
import ContractKeyValueList, { type ContractKeyValueItem } from "./components/ContractKeyValueList";
import { formatContractCurrency, formatContractDate } from "./contract.ui";

const PAYMENT_TERMS_MAX_LENGTH = 255;
const DELIVERY_ADDRESS_MAX_LENGTH = 500;

const ContractCreatePage = () => {
  const navigate = useNavigate();
  const { quotationId } = useParams();
  const { notify } = useNotify();

  const [quotation, setQuotation] = useState<QuotationModel | null>(null);
  const [paymentTerms, setPaymentTerms] = useState("Thanh toán 70% khi giao hàng, 30% còn lại trong vòng 30 ngày.");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [canCreateFromQuotation, setCanCreateFromQuotation] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const quotationDetailPath = quotationId
    ? ROUTE_URL.QUOTATION_DETAIL.replace(":id", quotationId)
    : ROUTE_URL.QUOTATION_LIST;

  const loadQuotation = useCallback(async () => {
    if (!quotationId) {
      setQuotation(null);
      return;
    }

    try {
      setPageLoading(true);
      setLoadError(null);
      const detail = await quotationService.getDetail(quotationId);
      setQuotation(detail);
      setCanCreateFromQuotation(Boolean(detail.actions?.accountantCanCreateContract));
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải thông tin báo giá để tạo hợp đồng.");
      setLoadError(message);
      setQuotation(null);
      notify(message, "error");
    } finally {
      setPageLoading(false);
    }
  }, [notify, quotationId]);

  useEffect(() => {
    void loadQuotation();
  }, [loadQuotation]);

  const quotationItems = useMemo<ContractItemRowData[]>(
    () =>
      (quotation?.items ?? []).map((item) => {
        const unitPrice = item.unitPrice ?? (item.quantity > 0 ? (item.totalPrice ?? item.amount ?? 0) / item.quantity : 0);
        return {
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice,
          amount: item.totalPrice ?? item.amount,
        };
      }),
    [quotation?.items],
  );

  const createBlockedReason = useMemo(() => {
    if (!quotationId) {
      return "Thiếu mã báo giá. Vui lòng quay lại danh sách báo giá và chọn lại.";
    }

    if (!canCreateFromQuotation) {
      return "Báo giá này hiện chưa đủ điều kiện để tạo hợp đồng theo chính sách phê duyệt.";
    }

    const normalizedPaymentTerms = paymentTerms.trim();
    const normalizedDeliveryAddress = deliveryAddress.trim();

    if (!normalizedPaymentTerms) {
      return "Vui lòng nhập điều khoản thanh toán.";
    }

    if (!normalizedDeliveryAddress) {
      return "Vui lòng nhập địa chỉ giao hàng.";
    }

    if (normalizedPaymentTerms.length > PAYMENT_TERMS_MAX_LENGTH) {
      return `Điều khoản thanh toán tối đa ${PAYMENT_TERMS_MAX_LENGTH} ký tự.`;
    }

    if (normalizedDeliveryAddress.length > DELIVERY_ADDRESS_MAX_LENGTH) {
      return `Địa chỉ giao hàng tối đa ${DELIVERY_ADDRESS_MAX_LENGTH} ký tự.`;
    }

    return null;
  }, [canCreateFromQuotation, deliveryAddress, paymentTerms, quotationId]);

  const canCreate = !createBlockedReason;

  const sourceInfoItems = useMemo<ContractKeyValueItem[]>(
    () => [
      {
        key: "quotationNumber",
        label: "Số báo giá",
        value: quotation?.quotationNumber || quotation?.id || "-",
      },
      {
        key: "quotationStatus",
        label: "Trạng thái báo giá",
        value: quotation?.status || "Chưa cập nhật",
      },
      {
        key: "customer",
        label: "Khách hàng",
        value: quotation?.customerName || quotation?.customerId || "-",
      },
      {
        key: "createdAt",
        label: "Ngày tạo",
        value: formatContractDate(quotation?.createdAt),
      },
      {
        key: "validUntil",
        label: "Hiệu lực đến",
        value: formatContractDate(quotation?.validUntil, "Chưa cập nhật"),
      },
      {
        key: "deliveryReq",
        label: "Yêu cầu giao hàng",
        value: quotation?.deliveryRequirements || "Chưa có yêu cầu bổ sung",
      },
    ],
    [quotation],
  );

  const createSummaryItems = useMemo<ContractKeyValueItem[]>(
    () => [
      {
        key: "contractFrom",
        label: "Nguồn dữ liệu",
        value: `Từ báo giá ${quotation?.quotationNumber || quotation?.id || "-"}`,
      },
      {
        key: "lineCount",
        label: "Số dòng hàng hợp lệ",
        value: quotationItems.length,
      },
      {
        key: "contractTotal",
        label: "Tổng giá trị",
        value: <Typography.Text strong>{formatContractCurrency(quotation?.totalAmount ?? 0)}</Typography.Text>,
      },
      {
        key: "eligibility",
        label: "Điều kiện phát hành",
        value: canCreate ? "Đủ điều kiện tạo hợp đồng" : createBlockedReason,
      },
    ],
    [canCreate, createBlockedReason, quotation, quotationItems.length],
  );

  const sidebarSummaryItems = useMemo<ContractKeyValueItem[]>(
    () => [
      {
        key: "quotation",
        label: "Mã báo giá",
        value: quotation?.quotationNumber || quotation?.id || "-",
      },
      {
        key: "customer",
        label: "Khách hàng",
        value: quotation?.customerName || quotation?.customerId || "-",
      },
      {
        key: "lines",
        label: "Số dòng hàng",
        value: quotationItems.length,
      },
    ],
    [quotation, quotationItems.length],
  );

  const handleCreate = async () => {
    if (createBlockedReason) {
      notify(createBlockedReason, "error");
      return;
    }

    if (!quotationId || !quotation?.customerId) {
      notify("Không thể tạo hợp đồng vì thiếu thông tin khách hàng từ báo giá.", "error");
      return;
    }

    const items = (quotation.items ?? []).reduce<Array<{ productId: string; quantity: number; unitPrice: number }>>((acc, item) => {
      const fallbackUnitPrice = item.unitPrice ?? (item.quantity ? (item.totalPrice ?? item.amount ?? 0) / item.quantity : undefined);

      if (!item.productId || item.quantity <= 0 || typeof fallbackUnitPrice !== "number") {
        return acc;
      }

      acc.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: fallbackUnitPrice,
      });

      return acc;
    }, []);

    try {
      setLoading(true);
      const created = await contractService.create({
        customerId: quotation.customerId,
        quotationId,
        paymentTerms: paymentTerms.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items,
      });

      notify("Tạo hợp đồng thành công.", "success");
      navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", created.id));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tạo hợp đồng."), "error");
    } finally {
      setLoading(false);
    }
  };

  const summaryCard = (
    <Card
      variant="borderless"
      className="shadow-sm"
      style={{ position: "sticky", top: 16 }}
      styles={{ body: { padding: 16 } }}
    >
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        <Typography.Title level={5} className="!mb-0">
          Tóm tắt nhanh
        </Typography.Title>
        <Typography.Text type="secondary">
          Xem nhanh dữ liệu cốt lõi trước khi phát hành hợp đồng.
        </Typography.Text>

        <ContractKeyValueList items={sidebarSummaryItems} />

        <Statistic
          title="Tổng tiền báo giá"
          value={quotation?.totalAmount ?? 0}
          formatter={(value) => formatContractCurrency(Number(value))}
        />

        <Alert
          type={canCreate ? "success" : "warning"}
          showIcon
          message={canCreate ? "Đủ điều kiện tạo hợp đồng" : "Chưa thể tạo hợp đồng"}
          description={canCreate ? "Bạn có thể kiểm tra lần cuối và bấm tạo hợp đồng." : createBlockedReason ?? undefined}
        />
      </Space>
    </Card>
  );

  if (!quotationId) {
    return (
      <NoResizeScreenTemplate
        header={
          <ListScreenHeaderTemplate
            title="Tạo hợp đồng từ báo giá"
            subtitle="Không tìm thấy mã báo giá trong đường dẫn hiện tại."
            breadcrumb={
              <CustomBreadcrumb
                breadcrumbs={[
                  { label: "Trang chủ" },
                  { label: "Hợp đồng", url: ROUTE_URL.CONTRACT_LIST },
                  { label: "Tạo hợp đồng" },
                ]}
              />
            }
          />
        }
        body={
          <Result
            status="warning"
            title="Thiếu thông tin báo giá"
            subTitle="Vui lòng quay lại danh sách báo giá và chọn một báo giá hợp lệ để tạo hợp đồng."
            extra={
              <Button type="primary" onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
                Đi tới danh sách báo giá
              </Button>
            }
          />
        }
      />
    );
  }

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Tạo hợp đồng từ báo giá"
          subtitle="Xác nhận thông tin nguồn, điều khoản thanh toán và địa chỉ giao hàng trước khi phát hành hợp đồng."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Hợp đồng", url: ROUTE_URL.CONTRACT_LIST },
                { label: "Tạo hợp đồng" },
              ]}
            />
          }
        />
      }
      body={
        loadError && !quotation && !pageLoading ? (
          <Result
            status="error"
            title="Không thể tải báo giá"
            subTitle={loadError}
            extra={
              <Space>
                <Button onClick={() => navigate(quotationDetailPath)}>Quay lại báo giá</Button>
                <Button type="primary" onClick={() => void loadQuotation()}>
                  Thử lại
                </Button>
              </Space>
            }
          />
        ) : (
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 16]} align="top">
              <Col xs={24} lg={16}>
                <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                  <ContractCreateSection
                    title="Thông tin báo giá nguồn"
                    subtitle="Dữ liệu tham chiếu từ báo giá đã chọn."
                    loading={pageLoading}
                    content={<ContractKeyValueList items={sourceInfoItems} />}
                  />

                  <ContractCreateSection
                    title="Danh sách sản phẩm từ báo giá"
                    subtitle="Các dòng hàng sẽ được kế thừa để tạo hợp đồng."
                    loading={pageLoading}
                    content={
                      <ContractItemsTable
                        items={quotationItems}
                        emptyDescription="Báo giá chưa có dòng sản phẩm để chuyển thành hợp đồng."
                      />
                    }
                  />

                  <ContractCreateSection
                    title="Điều khoản thanh toán"
                    subtitle="Thiết lập chính sách thanh toán áp dụng cho hợp đồng."
                    loading={pageLoading}
                    content={
                      <Input.TextArea
                        rows={3}
                        maxLength={PAYMENT_TERMS_MAX_LENGTH}
                        showCount
                        value={paymentTerms}
                        onChange={(event) => setPaymentTerms(event.target.value)}
                        placeholder="Ví dụ: Thanh toán 70% khi giao hàng, 30% còn lại trong vòng 30 ngày."
                      />
                    }
                  />

                  <ContractCreateSection
                    title="Địa chỉ và điều khoản giao hàng"
                    subtitle="Xác nhận rõ địa điểm giao hàng trước khi tạo hợp đồng."
                    loading={pageLoading}
                    content={
                      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                        <Input.TextArea
                          rows={3}
                          maxLength={DELIVERY_ADDRESS_MAX_LENGTH}
                          showCount
                          value={deliveryAddress}
                          onChange={(event) => setDeliveryAddress(event.target.value)}
                          placeholder="Nhập địa chỉ giao hàng đầy đủ theo hợp đồng."
                        />

                        {!canCreateFromQuotation ? (
                          <Alert
                            type="warning"
                            showIcon
                            message="Báo giá chưa đủ điều kiện tạo hợp đồng"
                            description="Vui lòng kiểm tra trạng thái báo giá hoặc liên hệ bộ phận phụ trách để xử lý trước khi tạo hợp đồng."
                          />
                        ) : null}
                      </Space>
                    }
                  />

                  <ContractCreateSection
                    title="Tóm tắt hợp đồng sẽ tạo"
                    subtitle="Kiểm tra nhanh các thông tin quan trọng trước khi xác nhận."
                    loading={pageLoading}
                    content={<ContractKeyValueList items={createSummaryItems} />}
                  />
                </Space>
              </Col>

              <Col xs={24} lg={8}>
                {pageLoading ? (
                  <Card variant="borderless" className="shadow-sm" loading />
                ) : quotation ? (
                  summaryCard
                ) : (
                  <Card variant="borderless" className="shadow-sm">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không có dữ liệu báo giá để hiển thị."
                    />
                  </Card>
                )}
              </Col>
            </Row>

            <ContractActionBar justify="space-between">
              <Button onClick={() => navigate(quotationDetailPath)}>Quay lại báo giá</Button>
              <Button type="primary" loading={loading} disabled={!canCreate || pageLoading} onClick={() => void handleCreate()}>
                Tạo hợp đồng
              </Button>
            </ContractActionBar>
          </Space>
        )
      }
    />
  );
};

export default ContractCreatePage;
