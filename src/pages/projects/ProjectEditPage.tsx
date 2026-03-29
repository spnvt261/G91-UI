import { useEffect, useState } from "react";
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

const ProjectEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [status, setStatus] = useState("NEW");
  const [pageLoading, setPageLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setPageLoading(true);
        const detail = await projectService.getDetail(id);
        setCode(detail.code ?? "");
        setName(detail.name);
        setCustomerId(detail.customerId);
        setWarehouseId(detail.warehouseId ?? "");
        setStatus(detail.status);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load project for update"), "error");
      } finally {
        setPageLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const handleUpdate = async () => {
    if (!id) {
      return;
    }

    try {
      setSaving(true);
      await projectService.update(id, {
        code,
        name,
        customerId,
        warehouseId,
        status: status as "NEW" | "IN_PROGRESS" | "ON_HOLD" | "DONE",
      });
      navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", id));
    } catch (err) {
      notify(getErrorMessage(err, "Cannot update project"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={pageLoading}
      loadingText="Đang tải thông tin dự án..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Cập nhật dự án"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Dự án", url: ROUTE_URL.PROJECT_LIST },
                { label: "Cập nhật" },
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
          </div>
          <div className="mt-4 flex gap-3">
            <CustomButton label={saving ? "Đang lưu..." : "Lưu cập nhật"} onClick={handleUpdate} disabled={saving} />
            <CustomButton label="Quay lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} />
          </div>
        </FormSectionCard>
      }
    />
  );
};

export default ProjectEditPage;
