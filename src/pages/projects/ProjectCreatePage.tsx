import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";

const ProjectCreatePage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [status, setStatus] = useState("NEW");
  const [progress, setProgress] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError("");
      const created = await projectService.create({
        code,
        name,
        customerId,
        warehouseId,
        progress: Number(progress),
        status: status as "NEW" | "IN_PROGRESS" | "ON_HOLD" | "DONE",
      });
      navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", created.id));
    } catch (err) {
      setError(getErrorMessage(err, "Cannot create project"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Tao Du An" />
      <FormSectionCard title="Thong Tin Du An">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomTextField title="Ma Du An" value={code} onChange={(event) => setCode(event.target.value)} />
          <CustomTextField title="Ten Du An" value={name} onChange={(event) => setName(event.target.value)} />
          <CustomTextField title="Customer ID" value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
          <CustomTextField title="Warehouse ID" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} />
          <CustomTextField title="Trang Thai" value={status} onChange={(event) => setStatus(event.target.value)} />
          <CustomTextField title="Tien Do" type="number" value={progress} onChange={(event) => setProgress(event.target.value)} />
        </div>
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        <div className="mt-4 flex gap-3">
          <CustomButton label={loading ? "Dang tao..." : "Luu Du An"} onClick={handleCreate} disabled={loading} />
          <CustomButton label="Quay Lai" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default ProjectCreatePage;
