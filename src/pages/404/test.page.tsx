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
  { key: "sku", header: "Ma SP" },
  { key: "name", header: "Ten San Pham" },
  { key: "category", header: "Loai" },
  { key: "thickness", header: "Be Day" },
  { key: "size", header: "Kich Thuoc" },
  { key: "inventory", header: "Ton Kho", className: "font-semibold text-blue-700" },
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
            <AuthCard title="Tao Tai Khoan Khach Hang" subtitle="Dang ky tai khoan de quan ly bao gia, don hang va theo doi no." footer={<AuthFooter />}>
              <div className="space-y-3">
                <CustomTextField title="Ten Cong Ty" placeholder="Ten Cong Ty" />
                <CustomTextField title="Ma So Thue" placeholder="Ma So Thue" />
                <CustomTextField title="So Dien Thoai" placeholder="0900 000 000" />
                <CustomTextField title="Mat Khau" placeholder="It nhat 6 ky tu" type="password" />
                <CustomTextField title="Xac Nhan Mat Khau" placeholder="It nhat 6 ky tu" type="password" />
                <CustomButton label="Dang Ky" className="w-full" />
              </div>
            </AuthCard>

            <AuthCard title="Dang Nhap" subtitle="Chao mung ban quay lai! Dang nhap de tiep tuc." footer={<AuthFooter />}>
              <div className="space-y-3">
                <CustomTextField title="Email" placeholder="Email" />
                <CustomTextField title="Mat Khau" placeholder="Nhap mat khau" type="password" />
                <CustomButton label="Dang Nhap" className="w-full" />
              </div>
            </AuthCard>

            <AuthCard title="Quen Mat Khau" subtitle="Nhap email dang ky cua ban de lay lai mat khau." footer={<AuthFooter />}>
              <div className="space-y-3">
                <CustomTextField title="Email" placeholder="Email" />
                <CustomButton label="Gui Yeu Cau" className="w-full" />
              </div>
            </AuthCard>

            <AuthCard title="Dat Mat Khau Moi" subtitle="Tao mat khau moi cho tai khoan cua ban" footer={<AuthFooter />}>
              <div className="space-y-3">
                <CustomTextField title="Mat Khau Moi" placeholder="It nhat 6 ky tu" type="password" />
                <CustomTextField title="Xac Nhan Mat Khau" placeholder="It nhat 6 ky tu" type="password" />
                <CustomButton label="Dat Mat Khau" className="w-full" />
              </div>
            </AuthCard>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-blue-100 shadow-xl">
          <AppLayout>
            <div className="space-y-6">
              <PageHeader title="Quan Ly San Pham" rightActions={<CustomButton label="Them San Pham" />} />

              <StatsGrid
                items={[
                  { title: "Total Revenue", value: "3.2B VND", trend: "+8.4% this month" },
                  { title: "Total Orders", value: "1,284", trend: "+12 orders today" },
                  { title: "Inventory Value", value: "9.1B VND", trend: "Stable stock level" },
                ]}
              />

              <BaseCard title="Danh Sach San Pham">
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
                      <CustomTextField title="Ten San Pham" placeholder="Ton Ma Kem G90 1.5mm" />
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