import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";

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
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Gán kho cho dự án"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Dự án", url: ROUTE_URL.PROJECT_LIST },
                { label: "Gán kho" },
              ]}
            />
          }
        />
      }
      body={
        <FormSectionCard title="Assign Warehouse">
          <CustomTextField title="Warehouse ID" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} placeholder="WH-001" />
          <div className="mt-4 flex gap-3">
            <CustomButton label={loading ? "Đang gán..." : "Xác nhận"} onClick={handleAssign} disabled={loading || !warehouseId} />
            <CustomButton label="Quay lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} />
          </div>
        </FormSectionCard>
      }
    />
  );
};

export default ProjectAssignWarehousePage;
