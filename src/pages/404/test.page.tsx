import { useMemo, useState } from "react";
import CustomButton from "../../components/customButton/CustomButton";
import CustomTextField from "../../components/customTextField/CustomTextField";
import AppLayout from "../../components/layout/AppLayout";
import ContentWrapper from "../../components/layout/ContentWrapper";
import PageHeader from "../../components/layout/PageHeader";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import BaseCard from "../../components/cards/BaseCard";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import TableFilterBar from "../../components/table/TableFilterBar";
import Pagination from "../../components/table/Pagination";
import FormSectionCard from "../../components/forms/FormSectionCard";
import ImageUploadCard from "../../components/forms/ImageUploadCard";
import StockConfigTable from "../../components/forms/StockConfigTable";
import StatsGrid from "../../components/dashboard/StatsGrid";
import ChartCard from "../../components/dashboard/ChartCard";
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal";

interface ProductRow {
  sku: string;
  name: string;
  category: string;
  thickness: string;
  size: string;
  inventory: string;
}

const productData: ProductRow[] = [
  { sku: "SP000523", name: "Ton Ma Kem G90 1.5mm", category: "Ton", thickness: "1.5 mm", size: "200 mm", inventory: "1,000" },
  { sku: "SP000524", name: "Ton Ma Kem G90 1.3mm", category: "Ton", thickness: "1.3 mm", size: "500 mm", inventory: "2,300" },
  { sku: "SP000525", name: "Ton Ma Kem G90 1.3mm", category: "Ton", thickness: "1.3 mm", size: "206 mm", inventory: "1,000" },
  { sku: "SP000526", name: "Ton Ma Kem G90 1.5mm", category: "Ton", thickness: "1.5 mm", size: "300 mm", inventory: "1,100" },
  { sku: "SP000527", name: "Ton Ma Kem G90 1.3mm", category: "Ton", thickness: "1.3 mm", size: "200 mm", inventory: "1,600" },
];

const tableColumns: DataTableColumn<ProductRow>[] = [
  { key: "sku", header: "Mã SP" },
  { key: "name", header: "Tên Sản Phẩm" },
  { key: "category", header: "Loại" },
  { key: "thickness", header: "Bề Dày" },
  { key: "size", header: "Kích Thưức" },
  { key: "inventory", header: "Tốn Kho", className: "font-semibold text-blue-700" },
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
    <ContentWrapper>
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-slate-800">Auth Components Showcase</h2>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
            <AuthCard title="Tạo Tài Khoản Khách Hàng" subtitle="Đăng ký tài khoản để quản lý báo giá, đơn hàng và theo dõi nó." footer={<AuthFooter />}>
              <div className="space-y-3">
                <CustomTextField title="Tên Công Ty" placeholder="Tên Công Ty" />
                <CustomTextField title="Mã Số Thuế" placeholder="Mã Số Thuế" />
                <CustomTextField title="Số Điện Thoại" placeholder="0900 000 000" />
                <CustomTextField title="Mật Khẩu" placeholder="Ít nhất 6 ký tự" type="password" />
                <CustomTextField title="Xác Nhận Mật Khẩu" placeholder="Ít nhất 6 ký tự" type="password" />
                <CustomButton label="Đăng Ký" className="w-full" />
              </div>
            </AuthCard>

            <AuthCard title="Đăng Nhập" subtitle="Chào mừng bạn quay lại! Đăng nhập để tiếp tục." footer={<AuthFooter />}>
              <div className="space-y-3">
                <CustomTextField title="Email" placeholder="Email" />
                <CustomTextField title="Mật Khẩu" placeholder="Nhập mật khẩu" type="password" />
                <CustomButton label="Đăng Nhập" className="w-full" />
              </div>
            </AuthCard>

            <AuthCard title="Quên Mật Khẩu" subtitle="Nhập email đăng ký của bạn để lạy lại mật khẩu." footer={<AuthFooter />}>
              <div className="space-y-3">
                <CustomTextField title="Email" placeholder="Email" />
                <CustomButton label="Gửi Yêu Cầu" className="w-full" />
              </div>
            </AuthCard>

            <AuthCard title="Đặt Mật Khẩu Mới" subtitle="Tạo mật khẩu mới cho tài khoản của bạn" footer={<AuthFooter />}>
              <div className="space-y-3">
                <CustomTextField title="Mật Khẩu Mới" placeholder="Ít nhất 6 ký tự" type="password" />
                <CustomTextField title="Xác Nhận Mật Khẩu" placeholder="Ít nhất 6 ký tự" type="password" />
                <CustomButton label="Đặt Mật Khẩu" className="w-full" />
              </div>
            </AuthCard>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-blue-100 shadow-xl">
          <AppLayout>
            <div className="space-y-6">
              <PageHeader title="Quản Lý Sản Phẩm" rightActions={<CustomButton label="Thêm Sản Phẩm" />} />

              <StatsGrid
                items={[
                  { title: "Total Revenue", value: "3.2B VND", trend: "+8.4% this month" },
                  { title: "Total Orders", value: "1,284", trend: "+12 orders today" },
                  { title: "Inventory Value", value: "9.1B VND", trend: "Stable stock level" },
                ]}
              />

              <BaseCard title="Danh Sách Sản Phẩm">
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
                      <CustomTextField title="Tên Sản Phẩm" placeholder="Thếp Mã Kem G90 1.5mm" />
                      <CustomTextField title="Ma SP" placeholder="SP000523" />
                      <CustomTextField title="Be Day" placeholder="1.5 mm" />
                      <CustomTextField title="Kich Thuoc" placeholder="200 mm" />
                    </div>
                  </FormSectionCard>
                  <StockConfigTable />
                </div>

                <div className="space-y-6">
                  <ImageUploadCard />
                  <ChartCard title="Product Trend" subtitle="Weekly import/export overview" />
                </div>
              </div>
            </div>
          </AppLayout>
        </section>
      </div>

      <DeleteConfirmModal
        open={openDeleteModal}
        itemName="Ton Ma Kem G90 1.5mm"
        onCancel={() => setOpenDeleteModal(false)}
        onConfirm={() => setOpenDeleteModal(false)}
      />
    </ContentWrapper>
  );
};

export default TestPage;