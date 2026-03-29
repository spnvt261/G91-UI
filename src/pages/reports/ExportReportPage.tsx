import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";

const ExportReportPage = () => {
  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Export Report"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang ch?" },
                { label: "Reports", url: ROUTE_URL.REPORT_SALES },
                { label: "Export" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Backend export API chua kh? d?ng trong codebase hi?n t?i. Các l?a ch?n export dang ? tr?ng thái ki?m soát (disabled), không dánh PASS gi?.
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <CustomButton label="Export Sales (CSV)" disabled />
              <CustomButton label="Export Inventory (CSV)" disabled />
              <CustomButton label="Export Project (PDF)" disabled />
            </div>
          </div>
        </BaseCard>
      }
    />
  );
};

export default ExportReportPage;

