import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";

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
    <div className="space-y-4">
      <PageHeader title="Tạo Dự Án" />
      <FormSectionCard title="Thông Tin Dự Án">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomTextField title="Mã Dự Án" value={code} onChange={(event) => setCode(event.target.value)} />
          <CustomTextField title="Tên Dự Án" value={name} onChange={(event) => setName(event.target.value)} />
          <CustomTextField title="Customer ID" value={customerId} onChange={(event) => setCustomerId(event.target.value)} />
          <CustomTextField title="Warehouse ID" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)} />
          <CustomTextField title="Trạng Thái" value={status} onChange={(event) => setStatus(event.target.value)} />
          <CustomTextField title="Tiến Độ" type="number" value={progress} onChange={(event) => setProgress(event.target.value)} />
        </div>
        <div className="mt-4 flex gap-3">
          <CustomButton label={loading ? "Đang tạo..." : "Lưu Dự Án"} onClick={handleCreate} disabled={loading} />
          <CustomButton label="Quay Lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} />
        </div>
      </FormSectionCard>
    </div>
  );
};

export default ProjectCreatePage;
