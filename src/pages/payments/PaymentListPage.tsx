import { SearchOutlined } from "@ant-design/icons";
import { Button, Card, Input, Space, Typography } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { getStoredUserRole } from "../../utils/authSession";

const PaymentListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const canRecordPayment = canPerformAction(role, "payment.record");

  const [paymentIdInput, setPaymentIdInput] = useState("");

  const openPaymentDetail = () => {
    const value = paymentIdInput.trim();
    if (!value) {
      return;
    }
    navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", value));
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Thanh toán"
          subtitle="Trung tâm nghiệp vụ ghi nhận thanh toán và tra cứu chi tiết phiếu thu."
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Thanh toán" }]} />}
          actions={
            canRecordPayment ? (
              <Button type="primary" onClick={() => navigate(ROUTE_URL.PAYMENT_RECORD)}>
                Ghi nhận thanh toán
              </Button>
            ) : null
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Card title="Tra cứu chi tiết phiếu thu">
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Typography.Text type="secondary">
                Nhập mã phiếu thu hoặc mã thanh toán để mở trang chi tiết.
              </Typography.Text>
              <Space.Compact block>
                <Input
                  size="large"
                  placeholder="Ví dụ: PMT-2026-0001 hoặc UUID thanh toán"
                  value={paymentIdInput}
                  onChange={(event) => setPaymentIdInput(event.target.value)}
                  onPressEnter={openPaymentDetail}
                />
                <Button size="large" icon={<SearchOutlined />} onClick={openPaymentDetail}>
                  Mở chi tiết
                </Button>
              </Space.Compact>
            </Space>
          </Card>
        </Space>
      }
    />
  );
};

export default PaymentListPage;
