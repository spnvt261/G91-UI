import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";

const ProjectAssignWarehousePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [warehouseId, setWarehouseId] = useState("");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  const handleAssign = async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      await projectService.assignWarehouse(id, { warehouseId });
      navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", id));
    } catch (err) {
      notify(getErrorMessage(err, "Cannot assign warehouse"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Gán Kho Cho Dự Án" />
      <FormSectionCard title="Assign Warehouse">
        <CustomTextField title="Warehouse ID" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} placeholder="WH-001" />
        <div className="mt-4 flex gap-3">
          <CustomButton label={loading ? "Đang gán..." : "Xác Nhận"} onClick={handleAssign} disabled={loading || !warehouseId} />
          <CustomButton label="Quay Lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default ProjectAssignWarehousePage;
