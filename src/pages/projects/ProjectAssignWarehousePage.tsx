import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";

const ProjectAssignWarehousePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [warehouseId, setWarehouseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAssign = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await projectService.assignWarehouse(id, { warehouseId });
      navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", id));
    } catch (err) {
      setError(getErrorMessage(err, "Cannot assign warehouse"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Gan Kho Cho Du An" />
      <FormSectionCard title="Assign Warehouse">
        <CustomTextField title="Warehouse ID" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} placeholder="WH-001" />
        {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
        <div className="mt-4 flex gap-3">
          <CustomButton label={loading ? "Dang gan..." : "Xac Nhan"} onClick={handleAssign} disabled={loading || !warehouseId} />
          <CustomButton label="Quay Lai" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default ProjectAssignWarehousePage;
