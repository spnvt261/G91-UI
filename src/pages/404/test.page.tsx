import { useMemo, useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import BaseCard from "../../components/cards/BaseCard";
import ChartCard from "../../components/dashboard/ChartCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import FormSectionCard from "../../components/forms/FormSectionCard";
import ImageUploadCard from "../../components/forms/ImageUploadCard";
import StockConfigTable from "../../components/forms/StockConfigTable";
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import Pagination from "../../components/table/Pagination";
import TableFilterBar from "../../components/table/TableFilterBar";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";

interface ProductRow {
  sku: string;
  name: string;
  category: string;
  thickness: string;
  size: string;
  inventory: string;
}

const productData: ProductRow[] = [
  { sku: "SP000523", name: "Tôn mạ kẽm G90 1.5mm", category: "Ton", thickness: "1.5 mm", size: "200 mm", inventory: "1,000" },
  { sku: "SP000524", name: "Tôn mạ kẽm G90 1.3mm", category: "Ton", thickness: "1.3 mm", size: "500 mm", inventory: "2,300" },
  { sku: "SP000525", name: "Tôn mạ kẽm G90 1.3mm", category: "Ton", thickness: "1.3 mm", size: "206 mm", inventory: "1,000" },
  { sku: "SP000526", name: "Tôn mạ kẽm G90 1.5mm", category: "Ton", thickness: "1.5 mm", size: "300 mm", inventory: "1,100" },
  { sku: "SP000527", name: "Tôn mạ kẽm G90 1.3mm", category: "Ton", thickness: "1.3 mm", size: "200 mm", inventory: "1,600" },
];

const tableColumns: DataTableColumn<ProductRow>[] = [
  { key: "sku", header: "Mã SP" },
  { key: "name", header: "Tên sản phẩm" },
  { key: "category", header: "Loại" },
  { key: "thickness", header: "Bề dày" },
  { key: "size", header: "Kích thước" },
  { key: "inventory", header: "Tồn kho", className: "font-semibold text-blue-700" },
];

const TestPage = () => {
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [productType, setProductType] = useState<string[]>([]);
  const [sizeFilter, setSizeFilter] = useState<string[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const filteredData = useMemo(() => {
    return productData.filter((item) => {
      const bySearch =
        !searchValue ||
        item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchValue.toLowerCase());
      const byType = !productType.length || productType.includes(item.category.toLowerCase());
      const bySize = !sizeFilter.length || sizeFilter.includes(item.size);
      return bySearch && byType && bySize;
    });
  }, [productType, searchValue, sizeFilter]);

  const pageSize = 4;
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Component Showcase"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Showcase" }]} />}
        />
      }
      body={
        <>
          <div className="space-y-8">
            <section>
              <h2 className="mb-4 text-2xl font-bold text-slate-800">Auth Components Showcase</h2>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
                <AuthCard title="Tạo tài khoản khách hàng" subtitle="Đăng ký tài khoản để quản lý báo giá, đơn hàng và theo dõi." footer={<AuthFooter />}>
                  <div className="space-y-3">
                    <CustomTextField title="Tên công ty" placeholder="Tên công ty" />
                    <CustomTextField title="Mã số thuế" placeholder="Mã số thuế" />
                    <CustomTextField title="Số điện thoại" placeholder="0900 000 000" />
                    <CustomTextField title="Mật khẩu" placeholder="Ít nhất 6 ký tự" type="password" />
                    <CustomTextField title="Xác nhận mật khẩu" placeholder="Ít nhất 6 ký tự" type="password" />
                    <CustomButton label="Đăng ký" className="w-full" />
                  </div>
                </AuthCard>

                <AuthCard title="Đăng nhập" subtitle="Chào mừng bạn quay lại! Đăng nhập để tiếp tục." footer={<AuthFooter />}>
                  <div className="space-y-3">
                    <CustomTextField title="Email" placeholder="Email" />
                    <CustomTextField title="Mật khẩu" placeholder="Nhập mật khẩu" type="password" />
                    <CustomButton label="Đăng nhập" className="w-full" />
                  </div>
                </AuthCard>

                <AuthCard title="Quên mật khẩu" subtitle="Nhập email đăng ký để lấy lại mật khẩu." footer={<AuthFooter />}>
                  <div className="space-y-3">
                    <CustomTextField title="Email" placeholder="Email" />
                    <CustomButton label="Gửi yêu cầu" className="w-full" />
                  </div>
                </AuthCard>

                <AuthCard title="Đặt mật khẩu mới" subtitle="Tạo mật khẩu mới cho tài khoản của bạn." footer={<AuthFooter />}>
                  <div className="space-y-3">
                    <CustomTextField title="Mật khẩu mới" placeholder="Ít nhất 6 ký tự" type="password" />
                    <CustomTextField title="Xác nhận mật khẩu" placeholder="Ít nhất 6 ký tự" type="password" />
                    <CustomButton label="Đặt mật khẩu" className="w-full" />
                  </div>
                </AuthCard>
              </div>
            </section>

            <section className="space-y-6 overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-slate-800">Quản lý sản phẩm</h3>
                <CustomButton label="Thêm sản phẩm" />
              </div>

              <StatsGrid
                items={[
                  { title: "Total Revenue", value: "3.2B VND", trend: "+8.4% this month" },
                  { title: "Total Orders", value: "1,284", trend: "+12 orders today" },
                  { title: "Inventory Value", value: "9.1B VND", trend: "Stable stock level" },
                ]}
              />

              <BaseCard title="Danh sách sản phẩm">
                <TableFilterBar
                  searchValue={searchValue}
                  onSearchChange={(value) => {
                    setSearchValue(value);
                    setPage(1);
                  }}
                  filters={[
                    {
                      key: "product-type",
                      placeholder: "Product Type",
                      options: [
                        { label: "Ton", value: "ton" },
                        { label: "Thep", value: "thep" },
                      ],
                      value: productType,
                      onChange: (value) => {
                        setProductType(value);
                        setPage(1);
                      },
                    },
                    {
                      key: "size-filter",
                      placeholder: "Size Filter",
                      options: [
                        { label: "200 mm", value: "200 mm" },
                        { label: "206 mm", value: "206 mm" },
                        { label: "300 mm", value: "300 mm" },
                        { label: "500 mm", value: "500 mm" },
                      ],
                      value: sizeFilter,
                      onChange: (value) => {
                        setSizeFilter(value);
                        setPage(1);
                      },
                    },
                  ]}
                />

                <DataTable
                  columns={tableColumns}
                  data={pagedData}
                  actions={() => (
                    <div className="flex items-center gap-2 text-xs">
                      <button className="rounded border border-blue-200 px-2 py-1 text-blue-600 hover:bg-blue-50">Edit</button>
                      <button
                        className="rounded border border-red-200 px-2 py-1 text-red-500 hover:bg-red-50"
                        onClick={() => setOpenDeleteModal(true)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                />

                <Pagination page={page} pageSize={pageSize} total={filteredData.length} onChange={setPage} />
              </BaseCard>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="space-y-6 xl:col-span-2">
                  <FormSectionCard title="Product Information">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <CustomTextField title="Tên sản phẩm" placeholder="Thép mạ kẽm G90 1.5mm" />
                      <CustomTextField title="Mã SP" placeholder="SP000523" />
                      <CustomTextField title="Bề dày" placeholder="1.5 mm" />
                      <CustomTextField title="Kích thước" placeholder="200 mm" />
                    </div>
                  </FormSectionCard>
                  <StockConfigTable />
                </div>

                <div className="space-y-6">
                  <ImageUploadCard />
                  <ChartCard title="Product Trend" subtitle="Weekly import/export overview" />
                </div>
              </div>
            </section>
          </div>

          <DeleteConfirmModal
            open={openDeleteModal}
            itemName="Tôn mạ kẽm G90 1.5mm"
            onCancel={() => setOpenDeleteModal(false)}
            onConfirm={() => setOpenDeleteModal(false)}
          />
        </>
      }
    />
  );
};

export default TestPage;
