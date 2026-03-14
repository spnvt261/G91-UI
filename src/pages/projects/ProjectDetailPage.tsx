import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState<ProjectModel | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        const detail = await projectService.getDetail(id);
        setProject(detail);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load project detail"));
      }
    };

    void load();
  }, [id]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Chi Tiet Du An"
        rightActions={
          <div className="flex gap-2">
            <CustomButton label="Cap Nhat" onClick={() => navigate(ROUTE_URL.PROJECT_EDIT.replace(":id", id ?? ""))} />
            <CustomButton label="Gan Kho" onClick={() => navigate(ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE.replace(":id", id ?? ""))} />
          </div>
        }
      />
      <BaseCard>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {project ? (
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <p><span className="font-semibold">ID:</span> {project.id}</p>
            <p><span className="font-semibold">Ma Du An:</span> {project.code ?? "-"}</p>
            <p><span className="font-semibold">Ten Du An:</span> {project.name}</p>
            <p><span className="font-semibold">Khach Hang:</span> {project.customerId}</p>
            <p><span className="font-semibold">Kho:</span> {project.warehouseId ?? "-"}</p>
            <p><span className="font-semibold">Trang Thai:</span> {project.status}</p>
            <p><span className="font-semibold">Tien Do:</span> {project.progress ?? 0}%</p>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Loading project...</p>
        )}
      </BaseCard>
    </div>
  );
};

export default ProjectDetailPage;
