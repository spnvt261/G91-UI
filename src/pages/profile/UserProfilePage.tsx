import { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import { authService } from "../../services/auth/auth.service";
import type { UserProfileModel } from "../../models/auth/auth.model";
import { getErrorMessage } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";

const UserProfilePage = () => {
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfileModel | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await authService.getProfile();
        setProfile(response);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load profile"), "error");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [notify]);

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" />

      {loading ? <p className="text-sm text-slate-500">Loading profile...</p> : null}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Full Name</p>
            <p className="mt-1 text-base font-medium text-slate-900">{profile?.fullName || "-"}</p>
          </div>
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
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
            <p className="mt-1 text-base font-medium text-slate-900">{profile?.phone || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Address</p>
            <p className="mt-1 text-base font-medium text-slate-900">{profile?.address || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
