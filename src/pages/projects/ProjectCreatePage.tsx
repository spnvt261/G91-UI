import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const ProjectCreatePage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [status, setStatus] = useState("NEW");
  const [progress, setProgress] = useState("0");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  const handleCreate = async () => {
    try {
      setLoading(true);
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
      notify(getErrorMessage(err, "Cannot create project"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Tạo dự án"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Dự án", url: ROUTE_URL.PROJECT_LIST },
                { label: "Tạo mới" },
              ]}
            />
          }
        />
      }
      body={
        <FormSectionCard title="Thông tin dự án">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CustomTextField title="Mã dự án" value={code} onChange={(event) => setCode(event.target.value)} />
            <CustomTextField title="Tên dự án" value={name} onChange={(event) => setName(event.target.value)} />
            <CustomTextField title="Customer ID" value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
            <CustomTextField title="Warehouse ID" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} />
            <CustomTextField title="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)} />
            <CustomTextField title="Tiến độ" type="number" value={progress} onChange={(event) => setProgress(event.target.value)} />
          </div>
          <div className="mt-4 flex gap-3">
            <CustomButton label={loading ? "Đang tạo..." : "Lưu dự án"} onClick={handleCreate} disabled={loading} />
            <CustomButton label="Quay lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} />
          </div>
        </FormSectionCard>
      }
    />
  );
};

export default ProjectCreatePage;
