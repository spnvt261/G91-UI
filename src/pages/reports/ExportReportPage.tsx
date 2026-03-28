import BaseCard from "../../components/cards/BaseCard";
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
                { label: "Trang chủ" },
                { label: "Reports", url: ROUTE_URL.REPORT_SALES },
                { label: "Export" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Export report backend endpoint is not available in the current codebase. This screen is reserved for owner/accountant once the backend export
            contract is provided.
          </div>
        </BaseCard>
      }
    />
  );
};

export default ExportReportPage;
