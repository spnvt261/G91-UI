import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { PriceListItemModel, PriceListModel } from "../../models/pricing/price-list.model";
import { priceListService } from "../../services/pricing/price-list.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import PriceListFormSection from "./PriceListFormSection";
import {
  createInitialPriceListFormValues,
  toPriceListWritePayload,
  validatePriceListForm,
  type PriceListFormErrors,
} from "./priceListForm.utils";

const PriceListDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = getStoredUserRole();
  const canUpdate = canPerformAction(role, "price-list.update");
  const { notify } = useNotify();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<PriceListModel | null>(null);
  const [errors, setErrors] = useState<PriceListFormErrors>({});
  const [values, setValues] = useState(createInitialPriceListFormValues());

  const editMode = canUpdate && searchParams.get("mode") === "edit";

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const response = await priceListService.getDetail(id);
        setDetail(response);
        setValues(createInitialPriceListFormValues(response));
      } catch (error) {
        notify(getErrorMessage(error, "Không thể load price list detail"), "error");
        navigate(ROUTE_URL.PRICE_LIST_LIST, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [id, navigate, notify]);

  const columns = useMemo<DataTableColumn<PriceListItemModel>[]>(
    () => [
      { key: "productId", header: "Product ID", className: "font-semibold text-blue-900" },
      { key: "productCode", header: "Code", render: (row) => row.productCode ?? "-" },
      { key: "productName", header: "Name", render: (row) => row.productName ?? "-" },
      { key: "unitPriceVnd", header: "Unit Price", render: (row) => toCurrency(row.unitPriceVnd) },
    ],
    [],
  );

  const handleStartEdit = () => {
    if (!canUpdate) {
      return;
    }

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("mode", "edit");
      return next;
    });
  };

  const handleCancelEdit = () => {
    setErrors({});
    if (detail) {
      setValues(createInitialPriceListFormValues(detail));
    }

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete("mode");
      return next;
    });
  };

  const handleSave = async () => {
    if (!id) {
      return;
    }

    const validationErrors = validatePriceListForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const message = validationErrors.name ?? validationErrors.validFrom ?? validationErrors.validTo ?? validationErrors.items;
      if (message) {
        notify(message, "error");
      }
      return;
    }

    try {
      setSaving(true);
      await priceListService.update(id, toPriceListWritePayload(values));
      const reloaded = await priceListService.getDetail(id);
      setDetail(reloaded);
      setValues(createInitialPriceListFormValues(reloaded));
      notify("Price list updated successfully.", "success");
      handleCancelEdit();
    } catch (error) {
      notify(getErrorMessage(error, "Không thể update price list"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Äang táº£i chi tiáº¿t báº£ng giÃ¡..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Price List Detail"
          actions={
            <div className="flex flex-wrap gap-2">
              {canUpdate && !editMode ? <CustomButton label="Edit" onClick={handleStartEdit} /> : null}
              {canUpdate && editMode ? (
                <CustomButton
                  label="Cancel Edit"
                  className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                  onClick={handleCancelEdit}
                  disabled={saving}
                />
              ) : null}
              <CustomButton
                label="Back"
                className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                onClick={() => navigate(ROUTE_URL.PRICE_LIST_LIST)}
              />
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chá»§" },
                { label: "Price List", url: ROUTE_URL.PRICE_LIST_LIST },
                { label: "Detail" },
              ]}
            />
          }
        />
      }
      body={
        <div className="space-y-4">
          {!editMode ? (
            <BaseCard>
              {detail ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <p>
                      <span className="font-semibold">Name:</span> {detail.name}
                    </p>
                    <p>
                      <span className="font-semibold">Customer Group:</span> {detail.customerGroup || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span> {detail.status}
                    </p>
                    <p>
                      <span className="font-semibold">Valid From:</span> {detail.validFrom || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Valid To:</span> {detail.validTo || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Item Count:</span> {detail.itemCount}
                    </p>
                  </div>
                  <DataTable columns={columns} data={detail.items} />
                </div>
              ) : (
                <p className="text-sm text-slate-500">No price list data.</p>
              )}
            </BaseCard>
          ) : (
            <>
              <PriceListFormSection
                title="Update Price List"
                values={values}
                errors={errors}
                onChange={(updater) => setValues((previous) => updater(previous))}
                onRemoveItem={(rowId) =>
                  setValues((previous) => ({
                    ...previous,
                    items: previous.items.filter((item) => item.rowId !== rowId),
                  }))
                }
              />
              <div className="flex flex-wrap gap-3">
                <CustomButton label={saving ? "Saving..." : "Save Changes"} onClick={handleSave} disabled={saving} />
                <CustomButton
                  label="Cancel"
                  className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                  onClick={handleCancelEdit}
                  disabled={saving}
                />
              </div>
            </>
          )}
        </div>
      }
    />
  );
};

export default PriceListDetailPage;

