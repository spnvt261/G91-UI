import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Alert, Avatar, Badge, Breadcrumb, Button, Card, Col, Descriptions, Empty, Form, Input, Row, Skeleton, Space, Statistic, Tag, Typography } from "antd";
import { CloseOutlined, EditOutlined, ReloadOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";
import { canPerformAction } from "../../const/authz.const";
import { useNotify } from "../../context/notifyContext";
import type { UpdateProfileRequest, UserProfileModel, UserRole, UserStatus } from "../../models/auth/auth.model";
import { authService } from "../../services/auth/auth.service";
import type { AppDispatch } from "../../store";
import { setUser } from "../../store/authSlice";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import AuthInlineStatus, { type AuthInlineStatusValue } from "../../components/auth/AuthInlineStatus";
import { ApiClientError } from "../../apiConfig/axiosConfig";

interface ProfileFormValues {
  fullName: string;
  phone: string;
  address: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  GUEST: "Khách",
  CUSTOMER: "Khách hàng",
  ACCOUNTANT: "Kế toán",
  WAREHOUSE: "Kho",
  OWNER: "Chủ hệ thống",
};

const STATUS_META: Record<UserStatus, { label: string; badgeStatus: "success" | "error" | "warning" | "default"; tagColor: string }> = {
  ACTIVE: { label: "Đang hoạt động", badgeStatus: "success", tagColor: "success" },
  INACTIVE: { label: "Chưa kích hoạt", badgeStatus: "default", tagColor: "default" },
  LOCKED: { label: "Bị khóa", badgeStatus: "error", tagColor: "error" },
  PENDING_VERIFICATION: { label: "Chờ xác thực", badgeStatus: "warning", tagColor: "warning" },
};

const toProfileFormValues = (profile: UserProfileModel): ProfileFormValues => ({
  fullName: profile.fullName ?? "",
  phone: profile.phone ?? "",
  address: profile.address ?? "",
});

const formatDateTime = (value?: string): string => {
  if (!value) {
    return "Chưa cập nhật";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getInitials = (fullName?: string): string => {
  if (!fullName) {
    return "U";
  }

  const tokens = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return "U";
  }

  const first = tokens[0]?.[0] ?? "";
  const last = tokens[tokens.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
};

const UserProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notify } = useNotify();
  const role = getStoredUserRole();
  const canEditProfile = canPerformAction(role, "profile.update");

  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState<UserProfileModel | null>(null);
  const [profileStatus, setProfileStatus] = useState<AuthInlineStatusValue | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      setLoadError(null);
      const response = await authService.getProfile();
      setProfile(response);
      profileForm.setFieldsValue(toProfileFormValues(response));
      dispatch(setUser(response));
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải hồ sơ người dùng.");
      setLoadError(message);
      notify(message, "error");
    } finally {
      setLoadingProfile(false);
    }
  }, [dispatch, notify, profileForm]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleStartEdit = () => {
    if (!profile) {
      return;
    }

    profileForm.setFieldsValue(toProfileFormValues(profile));
    setProfileStatus(null);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    if (profile) {
      profileForm.setFieldsValue(toProfileFormValues(profile));
    }
    setProfileStatus(null);
    setEditMode(false);
  };

  const handleSaveProfile = async () => {
    let values: ProfileFormValues;

    try {
      values = await profileForm.validateFields();
    } catch {
      return;
    }

    setProfileStatus(null);

    const payload: UpdateProfileRequest = {
      fullName: values.fullName.trim(),
      phone: values.phone.trim() || undefined,
      address: values.address.trim() || undefined,
    };

    try {
      setSavingProfile(true);
      const updatedProfile = await authService.updateProfile(payload);
      setProfile(updatedProfile);
      profileForm.setFieldsValue(toProfileFormValues(updatedProfile));
      dispatch(setUser(updatedProfile));

      setProfileStatus({
        type: "success",
        message: "Cập nhật hồ sơ thành công",
        description: "Thông tin cá nhân của bạn đã được lưu.",
      });
      notify("Cập nhật hồ sơ thành công.", "success");
      setEditMode(false);
    } catch (error) {
      if (error instanceof ApiClientError && error.errors?.length) {
        profileForm.setFields(
          error.errors.map((item) => ({
            name: item.field as keyof ProfileFormValues,
            errors: [item.message],
          })),
        );
      }

      const message = getErrorMessage(error, "Không thể cập nhật hồ sơ.");
      setProfileStatus({
        type: "error",
        message: "Lưu thay đổi chưa thành công",
        description: message,
      });
      notify(message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="space-y-5 p-6 md:p-8">
        <Skeleton.Button active block style={{ height: 36 }} />
        <Card>
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        </Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          </Col>
          <Col xs={24} xl={8}>
            <Card>
              <Skeleton active paragraph={{ rows: 5 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <Breadcrumb items={[{ title: "Trang chủ" }, { title: "Tài khoản" }, { title: "Hồ sơ người dùng" }]} />

      {loadError ? (
        <Alert
          showIcon
          type="error"
          message="Không thể tải hồ sơ"
          description={loadError}
          action={
            <Button type="default" icon={<ReloadOutlined />} onClick={() => void loadProfile()}>
              Tải lại
            </Button>
          }
        />
      ) : null}

      {!profile ? (
        <Card>
          <Empty description="Chưa có dữ liệu hồ sơ." />
        </Card>
      ) : (
        <>
          <Card bordered={false} className="shadow-sm">
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col xs={24} lg={16}>
                <Space align="start" size={16}>
                  <Avatar size={80} icon={<UserOutlined />}>
                    {getInitials(profile.fullName)}
                  </Avatar>
                  <Space direction="vertical" size={4}>
                    <Typography.Title level={3} className="!mb-0">
                      {profile.fullName || "Chưa cập nhật tên"}
                    </Typography.Title>
                    <Typography.Text type="secondary">{profile.email || "Chưa có thư điện tử"}</Typography.Text>
                    <Space wrap>
                      <Tag color="blue">{ROLE_LABELS[profile.role]}</Tag>
                      <Tag color={STATUS_META[profile.status].tagColor}>{STATUS_META[profile.status].label}</Tag>
                    </Space>
                  </Space>
                </Space>
              </Col>

              {canEditProfile ? (
                <Col xs={24} lg={8}>
                  <Space wrap className="lg:justify-end">
                    {!editMode ? (
                      <Button type="primary" icon={<EditOutlined />} onClick={handleStartEdit}>
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <Button icon={<CloseOutlined />} onClick={handleCancelEdit} disabled={savingProfile}>
                        Hủy
                      </Button>
                    )}
                  </Space>
                </Col>
              ) : null}
            </Row>

            <Row gutter={[16, 16]} className="mt-4">
              <Col xs={24} sm={8}>
                <Statistic title="Vai trò" value={ROLE_LABELS[profile.role]} />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic title="Trạng thái" value={STATUS_META[profile.status].label} />
              </Col>
              <Col xs={24} sm={8}>
                <Space direction="vertical" size={2}>
                  <Typography.Text type="secondary">Cập nhật gần nhất</Typography.Text>
                  <Typography.Text strong>{formatDateTime(profile.updatedAt)}</Typography.Text>
                </Space>
              </Col>
            </Row>
          </Card>

          <Row gutter={[16, 16]}>
            <Col xs={24} xl={16}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                {editMode ? (
                  <Card title="Chỉnh sửa hồ sơ người dùng" bordered={false} className="shadow-sm">
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                      <AuthInlineStatus status={profileStatus} />

                      <Form form={profileForm} layout="vertical" requiredMark={false} disabled={savingProfile}>
                        <Row gutter={[16, 8]}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Họ và tên"
                              name="fullName"
                              rules={[
                                { required: true, message: "Vui lòng nhập họ và tên." },
                                { min: 2, message: "Họ và tên cần ít nhất 2 ký tự." },
                              ]}
                            >
                              <Input size="large" placeholder="Nhập họ và tên" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item label="Thư điện tử">
                              <Input size="large" value={profile.email} disabled />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={[16, 8]}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Số điện thoại"
                              name="phone"
                              rules={[{ max: 20, message: "Số điện thoại không vượt quá 20 ký tự." }]}
                            >
                              <Input size="large" placeholder="Ví dụ: 0901234567" />
                            </Form.Item>
                          </Col>
                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Địa chỉ"
                              name="address"
                              rules={[{ max: 255, message: "Địa chỉ không vượt quá 255 ký tự." }]}
                            >
                              <Input size="large" placeholder="Nhập địa chỉ liên hệ" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Space>
                          <Button type="primary" icon={<SaveOutlined />} loading={savingProfile} onClick={() => void handleSaveProfile()}>
                            Lưu thay đổi
                          </Button>
                          <Button onClick={handleCancelEdit} disabled={savingProfile}>
                            Hủy
                          </Button>
                        </Space>
                      </Form>
                    </Space>
                  </Card>
                ) : (
                  <>
                    <Card title="Thông tin cá nhân" bordered={false} className="shadow-sm">
                      <Descriptions column={1} size="middle" colon={false}>
                        <Descriptions.Item label="Họ và tên">{profile.fullName || "Chưa cập nhật"}</Descriptions.Item>
                        <Descriptions.Item label="Thư điện tử">{profile.email || "Chưa cập nhật"}</Descriptions.Item>
                      </Descriptions>
                    </Card>

                    <Card title="Thông tin liên hệ" bordered={false} className="shadow-sm">
                      <Descriptions column={1} size="middle" colon={false}>
                        <Descriptions.Item label="Số điện thoại">{profile.phone || "Chưa cập nhật"}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{profile.address || "Chưa cập nhật"}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </>
                )}
              </Space>
            </Col>

            <Col xs={24} xl={8}>
              <Card title="Thông tin tài khoản" bordered={false} className="shadow-sm">
                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                  <Space>
                    <Typography.Text type="secondary">Vai trò:</Typography.Text>
                    <Typography.Text>{ROLE_LABELS[profile.role]}</Typography.Text>
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">Trạng thái:</Typography.Text>
                    <Badge status={STATUS_META[profile.status].badgeStatus} text={STATUS_META[profile.status].label} />
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">Ngày tạo:</Typography.Text>
                    <Typography.Text>{formatDateTime(profile.createdAt)}</Typography.Text>
                  </Space>
                  <Space>
                    <Typography.Text type="secondary">Cập nhật cuối:</Typography.Text>
                    <Typography.Text>{formatDateTime(profile.updatedAt)}</Typography.Text>
                  </Space>
                </Space>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default UserProfilePage;
