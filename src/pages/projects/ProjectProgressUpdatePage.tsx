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

const ProjectProgressUpdatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [progressPercent, setProgressPercent] = useState("0");
  const [progressStatus, setProgressStatus] = useState("IN_PROGRESS");
  const [phase, setPhase] = useState("");
  const [notes, setNotes] = useState("");
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
        setProgressPercent(String(detail.progressPercent ?? detail.progress ?? 0));
        setProgressStatus(detail.progressStatus ?? "IN_PROGRESS");
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load project progress"), "error");
      } finally {
        setPageLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const handleSubmit = async () => {
    if (!id) {
      return;
    }

    const parsedProgress = Number(progressPercent);
    if (!Number.isFinite(parsedProgress) || parsedProgress < 0 || parsedProgress > 100) {
      notify("Ti?n d? ph?i n?m trong kho?ng 0-100.", "error");
      return;
    }

    try {
      setSaving(true);
      await projectService.updateProgress(id, {
        progressPercent: parsedProgress,
        progressStatus: progressStatus.trim() || undefined,
        phase: phase.trim() || undefined,
        notes: notes.trim() || undefined,
        changeReason: "Updated from Project progress flow",
      });
      notify("C?p nh?t ti?n d? d? án thành công.", "success");
      navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", id));
    } catch (err) {
      notify(getErrorMessage(err, "Cannot update project progress"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={pageLoading}
      loadingText="Ðang t?i ti?n d? d? án..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="C?p nh?t ti?n d? d? án"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang ch?" },
                { label: "D? án", url: ROUTE_URL.PROJECT_LIST },
                { label: "Ti?n d?" },
              ]}
            />
          }
        />
      }
      body={
        <FormSectionCard title="Thông tin ti?n d?">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CustomTextField
              title="Ti?n d? (%)"
              type="number"
              value={progressPercent}
              onChange={(event) => setProgressPercent(event.target.value)}
              placeholder="0 - 100"
            />
            <CustomTextField
              title="Tr?ng thái ti?n d?"
              value={progressStatus}
              onChange={(event) => setProgressStatus(event.target.value)}
              placeholder="IN_PROGRESS"
            />
            <CustomTextField title="Giai do?n" value={phase} onChange={(event) => setPhase(event.target.value)} placeholder="Foundation / Structure..." />
            <CustomTextField title="Ghi chú" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Mô t? c?p nh?t" />
          </div>
          <div className="mt-4 flex gap-3">
            <CustomButton label={saving ? "Ðang c?p nh?t..." : "Luu ti?n d?"} onClick={handleSubmit} disabled={saving} />
            <CustomButton
              label="Quay l?i"
              className="bg-slate-200 text-slate-700 hover:bg-slate-300"
              onClick={() => navigate(ROUTE_URL.PROJECT_DETAIL.replace(":id", id ?? ""))}
            />
          </div>
        </FormSectionCard>
      }
    />
  );
};

export default ProjectProgressUpdatePage;

