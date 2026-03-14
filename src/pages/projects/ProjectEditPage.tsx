import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";

const ProjectEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [status, setStatus] = useState("NEW");
  const [progress, setProgress] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const detail = await projectService.getDetail(id);
        setCode(detail.code ?? "");
        setName(detail.name);
        setCustomerId(detail.customerId);
        setWarehouseId(detail.warehouseId ?? "");
        setStatus(detail.status);
        setProgress(String(detail.progress ?? 0));
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load project for update"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await projectService.update(id, {
        code,
        name,
        customerId,
        warehouseId,
        progress: Number(progress),
        status: status as "NEW" | "IN_PROGRESS" | "ON_HOLD" | "DONE",
      });
      await projectService.updateProgress(id, {
        progress: Number(progress),
        note: "Updated from ProjectEditPage",
      });
      navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", id));
    } catch (err) {
      setError(getErrorMessage(err, "Cannot update project"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Cập Nhật Dự Án" />
      <FormSectionCard title="Thông Tin Dự Án">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomTextField title="Mã Dự Án" value={code} onChange={(event) => setCode(event.target.value)} />
          <CustomTextField title="Tên Dự Án" value={name} onChange={(event) => setName(event.target.value)} />
          <CustomTextField title="Customer ID" value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
          <CustomTextField title="Warehouse ID" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} />
          <CustomTextField title="Trạng Thái" value={status} onChange={(event) => setStatus(event.target.value)} />
          <CustomTextField title="Tiến Độ" type="number" value={progress} onChange={(event) => setProgress(event.target.value)} />
        </div>
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        <div className="mt-4 flex gap-3">
          <CustomButton label={loading ? "Đang lưu..." : "Lưu Cập Nhật"} onClick={handleUpdate} disabled={loading} />
          <CustomButton label="Quay Lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default ProjectEditPage;
