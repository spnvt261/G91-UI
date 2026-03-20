import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectModel } from "../../models/project/project.model";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";

const ProjectDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState<ProjectModel | null>(null);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        const detail = await projectService.getDetail(id);
        setProject(detail);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load project detail"), "error");
      }
    };

    void load();
  }, [id, notify]);

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Chi tiết dự án"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={
            <div className="flex gap-2">
              <CustomButton label="Cập nhật" onClick={() => navigate(ROUTE_URL.PROJECT_EDIT.replace(":id", id ?? ""))} />
              <CustomButton label="Gán kho" onClick={() => navigate(ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE.replace(":id", id ?? ""))} />
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Dự án", url: ROUTE_URL.PROJECT_LIST },
                { label: "Chi tiết" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
          {project ? (
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="font-semibold">ID:</span> {project.id}
              </p>
              <p>
                <span className="font-semibold">Mã dự án:</span> {project.code ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Tên dự án:</span> {project.name}
              </p>
              <p>
                <span className="font-semibold">Khách hàng:</span> {project.customerId}
              </p>
              <p>
                <span className="font-semibold">Kho:</span> {project.warehouseId ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Trạng thái:</span> {project.status}
              </p>
              <p>
                <span className="font-semibold">Tiến độ:</span> {project.progress ?? 0}%
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Đang tải thông tin dự án...</p>
          )}
        </BaseCard>
      }
    />
  );
};

export default ProjectDetailPage;
