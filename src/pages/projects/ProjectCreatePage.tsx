import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomSelect, { type Option } from "../../components/customSelect/CustomSelect";
import CustomTextField from "../../components/customTextField/CustomTextField";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProjectModel } from "../../models/project/project.model";
import { customerService } from "../../services/customer/customer.service";
import { projectService } from "../../services/project/project.service";
import { getErrorMessage } from "../shared/page.utils";

const PROJECT_STATUS_OPTIONS: Option[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
];

type ProjectWarehouseShape = ProjectModel & {
  primaryWarehouseId?: string;
  primaryWarehouseName?: string;
  backupWarehouseId?: string;
  backupWarehouseName?: string;
};

const ProjectCreatePage = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [progress, setProgress] = useState("0");
  const [customerOptions, setCustomerOptions] = useState<Option[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<Option[]>([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const loadLookupOptions = async () => {
      try {
        setLookupLoading(true);

        const [customerListResponse, projects] = await Promise.all([
          customerService.getList({ page: 1, pageSize: 100, status: "ACTIVE" }),
          projectService.getList({ page: 1, pageSize: 100 }),
        ]);

        const nextCustomerOptions = customerListResponse.items
          .map((customer) => {
            const customerName = customer.companyName || customer.contactPerson || customer.customerCode || customer.id;
            return {
              label: customer.customerCode ? `${customerName} (${customer.customerCode})` : customerName,
              value: customer.id,
            } satisfies Option;
          })
          .sort((left, right) => String(left.label).localeCompare(String(right.label)));

        const warehouseNameById = new Map<string, string>();
        const upsertWarehouse = (id?: string, name?: string) => {
          if (!id) {
            return;
          }

          const normalizedId = id.trim();
          if (!normalizedId) {
            return;
          }

          const normalizedName = name?.trim();
          const currentName = warehouseNameById.get(normalizedId);
          if (!currentName || currentName === normalizedId) {
            warehouseNameById.set(normalizedId, normalizedName || normalizedId);
          }
        };

        projects.forEach((project) => {
          const warehouseProject = project as ProjectWarehouseShape;
          upsertWarehouse(warehouseProject.primaryWarehouseId ?? warehouseProject.warehouseId, warehouseProject.primaryWarehouseName);
          upsertWarehouse(warehouseProject.backupWarehouseId, warehouseProject.backupWarehouseName);
        });

        const nextWarehouseOptions = Array.from(warehouseNameById.entries())
          .map(([id, warehouseName]) => ({
            label: warehouseName === id ? id : `${warehouseName} (${id})`,
            value: id,
          }))
          .sort((left, right) => String(left.label).localeCompare(String(right.label)));

        setCustomerOptions(nextCustomerOptions);
        setWarehouseOptions(nextWarehouseOptions);
      } catch (err) {
        setCustomerOptions([]);
        setWarehouseOptions([]);
        notify(getErrorMessage(err, "Cannot load user and warehouse options"), "error");
      } finally {
        setLookupLoading(false);
      }
    };

    void loadLookupOptions();
  }, [notify]);

  const handleCreate = async () => {
    try {
      setLoading(true);
      const created = await projectService.create({
        code,
        name,
        customerId,
        warehouseId,
        progress: Number(progress),
        status,
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
            <CustomSelect
              title="User"
              options={customerOptions}
              value={customerId ? [customerId] : []}
              onChange={(values) => setCustomerId(values[0] ?? "")}
              classNameSelect="w-full text-left"
              classNameOptions="w-full left-0"
              placeholder={lookupLoading ? "Đang tải user..." : "Chọn user"}
              disable={lookupLoading}
            />
            <CustomSelect
              title="Warehouse"
              options={warehouseOptions}
              value={warehouseId ? [warehouseId] : []}
              onChange={(values) => setWarehouseId(values[0] ?? "")}
              classNameSelect="w-full text-left"
              classNameOptions="w-full left-0"
              placeholder={lookupLoading ? "Đang tải warehouse..." : "Chọn warehouse"}
              disable={lookupLoading}
              helperText={!lookupLoading && warehouseOptions.length === 0 ? "Chưa có dữ liệu warehouse từ API." : undefined}
            />
            <CustomSelect
              title="Trạng thái"
              options={PROJECT_STATUS_OPTIONS}
              value={[status]}
              onChange={(values) => setStatus((values[0] as "ACTIVE" | "COMPLETED") ?? "ACTIVE")}
              classNameSelect="w-full text-left"
              classNameOptions="w-full left-0"
            />
            <CustomTextField title="Tiến độ" type="number" value={progress} onChange={(event) => setProgress(event.target.value)} />
          </div>
          <div className="mt-4 flex gap-3">
            <CustomButton label={loading ? "Đang tạo..." : "Lưu dự án"} onClick={handleCreate} disabled={loading || lookupLoading} />
            <CustomButton label="Quay lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.PROJECT_LIST)} />
          </div>
        </FormSectionCard>
      }
    />
  );
};

export default ProjectCreatePage;
