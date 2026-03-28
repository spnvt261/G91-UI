import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { useNotify } from "../../context/notifyContext";
import type { UpdateProfileRequest, UserProfileModel } from "../../models/auth/auth.model";
import { authService } from "../../services/auth/auth.service";
import type { AppDispatch } from "../../store";
import { setUser } from "../../store/authSlice";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

interface ProfileFormValues {
  fullName: string;
  phone: string;
  address: string;
}

const toFormValues = (profile: UserProfileModel): ProfileFormValues => ({
  fullName: profile.fullName ?? "",
  phone: profile.phone ?? "",
  address: profile.address ?? "",
});

const UserProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notify } = useNotify();
  const role = getStoredUserRole();
  const canEditProfile = canPerformAction(role, "profile.update");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState<UserProfileModel | null>(null);
  const [formValues, setFormValues] = useState<ProfileFormValues>({
    fullName: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormValues, string>>>({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await authService.getProfile();
        setProfile(response);
        setFormValues(toFormValues(response));
        dispatch(setUser(response));
      } catch (error) {
        notify(getErrorMessage(error, "Cannot load profile"), "error");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [dispatch, notify]);

  const validationErrors = useMemo(() => {
    const nextErrors: Partial<Record<keyof ProfileFormValues, string>> = {};

    if (!formValues.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    return nextErrors;
  }, [formValues.fullName]);

  const handleSave = async () => {
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      notify(Object.values(validationErrors)[0] ?? "Invalid profile data.", "error");
      return;
    }

    const payload: UpdateProfileRequest = {
      fullName: formValues.fullName.trim(),
      phone: formValues.phone.trim() || undefined,
      address: formValues.address.trim() || undefined,
    };

    try {
      setSaving(true);
      const updatedProfile = await authService.updateProfile(payload);
      setProfile(updatedProfile);
      setFormValues(toFormValues(updatedProfile));
      dispatch(setUser(updatedProfile));
      notify("Profile updated successfully.", "success");
      setEditMode(false);
    } catch (error) {
      notify(getErrorMessage(error, "Cannot update profile"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setErrors({});
    if (profile) {
      setFormValues(toFormValues(profile));
    }
    setEditMode(false);
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Loading profile..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="My Profile"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={
            canEditProfile ? (
              <div className="flex flex-wrap gap-2">
                {!editMode ? <CustomButton label="Edit Profile" onClick={() => setEditMode(true)} /> : null}
                {editMode ? (
                  <CustomButton
                    label="Cancel"
                    className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  />
                ) : null}
              </div>
            ) : undefined
          }
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Hồ sơ cá nhân" }]} />}
        />
      }
      body={
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CustomTextField
                title="Full Name"
                value={formValues.fullName}
                helperText={errors.fullName}
                error={Boolean(errors.fullName)}
                disabled={!editMode}
                onChange={(event) => setFormValues((previous) => ({ ...previous, fullName: event.target.value }))}
              />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                <p className="mt-1 text-base font-medium text-slate-900">{profile?.email || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
                <p className="mt-1 text-base font-medium text-slate-900">{profile?.role || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                <p className="mt-1 text-base font-medium text-slate-900">{profile?.status || "-"}</p>
              </div>
              <CustomTextField
                title="Phone"
                value={formValues.phone}
                disabled={!editMode}
                onChange={(event) => setFormValues((previous) => ({ ...previous, phone: event.target.value }))}
              />
              <CustomTextField
                title="Address"
                value={formValues.address}
                disabled={!editMode}
                onChange={(event) => setFormValues((previous) => ({ ...previous, address: event.target.value }))}
              />
            </div>

            {editMode ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <CustomButton label={saving ? "Saving..." : "Save Profile"} onClick={handleSave} disabled={saving} />
                <CustomButton
                  label="Cancel"
                  className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                  onClick={handleCancelEdit}
                  disabled={saving}
                />
              </div>
            ) : null}
          </div>
        </div>
      }
    />
  );
};

export default UserProfilePage;
