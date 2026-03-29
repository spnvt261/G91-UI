# Tasks

## 1. Discovery / Validation

- [ ] 1.1 Confirm final in-scope `price-lists` page states: `/price-lists`, `/price-lists/create`, `/price-lists/:id`, and `/price-lists/:id?mode=edit`.
- [ ] 1.2 Confirm shared components currently used by these pages (`NoResizeScreenTemplate`, `ListScreenHeaderTemplate`, `BaseCard`, `DataTable`, `FormSectionCard`, `FilterSearchModalBar`, `Pagination`).
- [ ] 1.3 Confirm and document API/state behavior to preserve (`priceListService.getList/getDetail/create/update/remove`, `productService.getList`, query state, navigation outcomes, validation utilities).
- [ ] 1.4 Capture baseline UI references for list/create/detail/edit screens to support visual regression review later.

## 2. Shared UI Primitives

- [ ] 2.1 Create `EntityHeroHeader` primitive for commercial page headers with action slot hierarchy.
- [ ] 2.2 Create `KPIStatStrip` primitive for top-level list metrics used by `PriceListListPage`.
- [ ] 2.3 Create `DocumentMetaGrid` primitive for document-style detail metadata presentation.
- [ ] 2.4 Create `StickyActionSidebar` primitive for create/edit pages with persistent action placement.
- [ ] 2.5 Create `LineItemsSection` primitive to present price list items in worksheet/document style.
- [ ] 2.6 Create `StatusBadgeGroup` and `EmptyStateCard` primitives for consistent state communication.

## 3. Page Redesign Tasks

- [ ] 3.1 Redesign `PriceListListPage`: apply hero + KPI + filter-control + table composition, strengthen section hierarchy, prioritize row action hierarchy (`View` > `Edit` > `Delete`), and keep existing list/delete logic unchanged.
- [ ] 3.2 Redesign `PriceListCreatePage`: convert to workspace layout (grouped form sections + sticky action/summary area), improve section-level readability, and keep create API, validation, and success navigation unchanged.
- [ ] 3.3 Redesign `PriceListDetailPage` view mode: implement document-style summary/meta/item structure, improve reading flow and action placement, and keep detail-loading behavior unchanged.
- [ ] 3.4 Redesign `PriceListDetailPage` edit mode: align edit workspace with create experience, clarify save/cancel hierarchy, and keep `mode=edit` semantics plus update API behavior unchanged.
- [ ] 3.5 Update `PriceListFormSection` integration to support redesigned sections and visual grouping without changing business rules for items, status, validity, and required fields.

## 4. Validation Tasks

- [ ] 4.1 Verify API contracts remain unchanged for list/create/detail/update/delete and product lookup calls.
- [ ] 4.2 Verify route contracts remain unchanged (`/price-lists`, `/price-lists/create`, `/price-lists/:id`, `mode=edit`).
- [ ] 4.3 Verify permission contracts remain unchanged (menu visibility, owner-only create/update/delete actions).
- [ ] 4.4 Verify create/update/detail/delete flows and notifications remain behaviorally equivalent.
- [ ] 4.5 Capture before/after review notes and screenshots after implementation phase for approval audit.
