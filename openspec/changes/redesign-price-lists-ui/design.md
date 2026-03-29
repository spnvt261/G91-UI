# price-lists UI Redesign Design

## Context
The `price-lists` module currently has three pages under `src/pages/pricing/`: `PriceListListPage`, `PriceListCreatePage`, and `PriceListDetailPage` (including `?mode=edit`). All three rely on shared generic wrappers (`NoResizeScreenTemplate`, `ListScreenHeaderTemplate`, `BaseCard`, `DataTable`, `FormSectionCard`) that produce consistent CRUD structure but weak commercial hierarchy.

Current route and behavior contracts to preserve:
- `/price-lists` -> list with filter/search/pagination and row actions
- `/price-lists/create` -> create form with product lookup (`productService.getList`) and save (`priceListService.create`)
- `/price-lists/:id` -> detail, optional edit mode via query param, update via `priceListService.update`
- OWNER-only create/update/delete actions via `canPerformAction` rules; ACCOUNTANT and OWNER can access module routes

## Current UI Problems

### Create form problems
- `PriceListCreatePage` shows one large flat form block with limited visual separation between metadata and line-item work.
- Primary action and secondary action are only bottom buttons, so users scroll to submit and lose context.
- No sticky summary for status/validity/item count; users cannot quickly review before saving.
- Line items look like repeated generic inputs, not a pricing worksheet.

### Detail page problems
- `PriceListDetailPage` view mode uses text paragraphs + generic table, which reads as debug/admin output instead of a commercial record.
- Header action placement does not reinforce primary intent (read document first, then edit).
- Metadata (status, validity, customer group) is not visually prioritized as decision-critical information.
- In edit mode, product selection falls back to plain Product ID input (no option list), reducing clarity.

### List page problems
- `PriceListListPage` is a standard admin table with limited hierarchy and no commercial summary layer.
- Table rows do not foreground key signals (status + validity + customer segment) for quick scanning.
- Row actions are visually equivalent (View/Edit/Delete), weakening action hierarchy.
- No top-level KPI/context block to frame pricing portfolio health.

### Weak hierarchy and missing commercial feel
- Similar visual treatment across list/create/detail leads to generic CRUD perception.
- Commercial metadata is present but not staged in a document-like reading flow.
- Spacing/section grouping is functional but not intentional for sales/pricing workflows.

## UX Goals
- Users immediately understand page intent (portfolio list vs create workspace vs pricing document detail).
- Critical business data (status, validity, customer group, item count, monetary values) is visually prioritized.
- Create/edit flows feel guided, with clearer section sequence and action hierarchy.
- Detail view feels like a commercial record with summary first, evidence (line items) second.
- List view supports fast scanning and triage without redesigning API behavior.

## Design Principles
- Strong hierarchy: clear visual levels for title, summary metadata, and detail blocks.
- Explicit section grouping: isolate business metadata, validity/status, and line-item pricing.
- Sticky action/summary behavior on large screens for create/edit confidence.
- Hero summary in list/detail pages for commercial context.
- Document-style detail composition: summary header + metadata grid + item table.
- Enterprise commercial tone: clean, structured, serious (not flashy).
- Preserve business logic, API contracts, routes, and permission rules.

## Page-by-Page Proposal

### PriceListListPage (`/price-lists`)
Current issues:
- Generic header + filter + table stack with weak commercial context.
- No summary strip for active/inactive coverage and validity timeline awareness.

Proposed layout:
- Top hero header with module title + concise subtitle + primary action (Create Price List if permitted).
- KPI stat strip under hero (e.g., total lists, active lists, inactive lists, expiring-soon count based on loaded data).
- Filter/search bar remains but is placed as a dedicated control row below KPI.
- Data table remains core body but with stronger visual emphasis on name/status/validity.

Proposed main sections:
- HeroHeader
- KPIStatStrip
- FilterControlRow
- PriceListTable
- PaginationFooter

Action hierarchy:
- Primary: `Create Price List` (page-level).
- Secondary row action: `View`.
- Tertiary row action: `Edit`.
- Destructive row action: `Delete` visually separated.

Expected reading flow:
- Understand portfolio health -> narrow with filters -> inspect rows -> act.

Notes on preserved logic/API:
- Keep `priceListService.getList(query)` and `priceListService.remove(id)` usage unchanged.
- Keep query-state fields (`page`, `size`, `search`, `status`, `customerGroup`, `validFrom`, `validTo`).

### PriceListCreatePage (`/price-lists/create`)
Current issues:
- Flat single-card input composition with weak step guidance.
- Bottom-only actions increase scroll friction.

Proposed layout:
- Two-column workspace on desktop:
  - Main column: grouped form sections (Basic Info, Validity & Status, Line Items Worksheet).
  - Side column: sticky summary card with key metadata preview + primary/secondary actions.
- Mobile collapses to single column while keeping section order.

Proposed main sections:
- CreateHeroHeader
- BasicInfoSection
- ValidityStatusSection
- LineItemsSection
- StickyActionSidebar (summary + create/back)

Action hierarchy:
- Primary: `Create Price List`.
- Secondary: `Back`.
- Inline item-level: `Add Item`, `Remove`.

Expected reading flow:
- Enter metadata -> build line items -> review sticky summary -> submit.

Notes on preserved logic/API:
- Keep product loading via `productService.getList({ page: 1, pageSize: 1000, status: "ACTIVE" })`.
- Keep existing validation and payload mapping from `priceListForm.utils`.
- Keep submit flow (`priceListService.create`) and navigation to detail unchanged.

### PriceListDetailPage (`/price-lists/:id` and `?mode=edit`)
Current issues:
- Non-edit detail appears as plain key-value text and generic grid.
- Edit mode visually disconnected from document context.

Proposed layout:
- View mode:
  - Document hero with name, status badge, validity range, and quick commercial metadata.
  - Metadata grid card (customer group, item count, created/updated if available).
  - Line-items section with pricing table in document style.
- Edit mode:
  - Reuse create-like workspace structure while preserving existing mode toggle behavior.
  - Keep save/cancel controls visible and clearly prioritized.

Proposed main sections:
- DocumentHeroHeader
- DocumentMetaGrid
- LineItemsSection
- EditWorkspace (when `mode=edit`)

Action hierarchy:
- View mode primary: `Edit` (if authorized).
- Persistent secondary: `Back`.
- Edit mode primary: `Save Changes`.
- Edit mode secondary: `Cancel` / `Cancel Edit`.

Expected reading flow:
- Understand record status and validity -> inspect metadata -> inspect item pricing -> decide next action.

Notes on preserved logic/API:
- Keep load/update/reload behavior with `priceListService.getDetail` and `priceListService.update`.
- Keep query-param mode toggle (`mode=edit`) contract.
- Keep owner-only edit permission checks unchanged.

## Component Proposal
Only components needed for `price-lists` scope are proposed:
- `EntityHeroHeader`: reusable hero for module-level list/create/detail headings with action slots.
- `DocumentMetaGrid`: consistent metadata grid for detail view (status/validity/customer group/item count/timestamps).
- `MonetarySummaryCard`: summary of line-item totals/count for create/edit/detail context.
- `StickyActionSidebar`: desktop sticky panel for primary and secondary actions with compact summary.
- `KPIStatStrip`: top-level list metrics to reduce table-only dependence.
- `LineItemsSection`: module-focused wrapper around price list items with clear worksheet affordance.
- `StatusBadgeGroup`: normalized status + validity indicator presentation.
- `EmptyStateCard`: richer empty state for list and detail when no records/items.

## Data / Logic Preservation
The redesign MUST preserve:
- API endpoints and request/response mapping used by `priceListService` and `productService`.
- Form validation and payload conversion semantics in `priceListForm.utils`.
- Existing route paths and query usage (`/price-lists`, `/price-lists/create`, `/price-lists/:id`, `mode=edit`).
- Permission gating (`canPerformAction`) for create/update/delete and route access behavior.
- Existing navigation outcomes after create/update/delete operations.
- Existing error/success notification triggers and business-rule semantics.

## Rollout Order
Recommended implementation order within `price-lists` only:
1. `PriceListListPage` (establish visual language and hierarchy primitives).
2. `PriceListDetailPage` view mode (document-style record experience).
3. `PriceListCreatePage` (workspace + sticky summary/action pattern).
4. `PriceListDetailPage` edit mode alignment (ensure create/edit parity).

If only first 2-3 pages are implemented initially:
1. `PriceListListPage`
2. `PriceListDetailPage` (view)
3. `PriceListCreatePage`

## Goals / Non-Goals

**Goals:**
- Deliver a commercial-first UI structure for price-lists list/create/detail pages.
- Improve information hierarchy, section grouping, and action clarity.
- Preserve all functional contracts while changing only presentation and UX composition.

**Non-Goals:**
- Changing backend contracts or service semantics.
- Changing route map, auth model, or permission matrix.
- Redesigning other modules in this change.
- Rebuilding the entire global design system.

## Decisions
- Decision: Use module-scoped commercial components first, then promote to shared only when stable.
  - Rationale: avoids unintended cross-module visual regressions.
  - Alternative considered: immediate global template replacement.
  - Why not alternative: too broad for this review-first phase.

- Decision: Keep existing page route and query contracts while replacing layout composition.
  - Rationale: minimizes FE-BE integration risk and test-surface expansion.
  - Alternative considered: split edit into dedicated route.
  - Why not alternative: route behavior change is out of scope for this cycle.

- Decision: Preserve existing service and form utility layers as source of truth.
  - Rationale: redesign should be presentational, not business-logic refactor.
  - Alternative considered: refactor form state/service mapping during redesign.
  - Why not alternative: raises delivery and regression risk for first module pilot.

## Risks / Trade-offs
- [Richer UI composition can increase implementation complexity] -> Mitigation: stage rollout page-by-page and keep data contracts unchanged.
- [Potential inconsistency with still-generic modules] -> Mitigation: accept temporary inconsistency and document reusable patterns for later phases.
- [Shared component side effects if modified directly] -> Mitigation: prefer additive module-scoped components or backward-compatible extensions.
- [Sticky/sidebar patterns may require responsive tuning] -> Mitigation: define explicit mobile fallback to single-column flow.

## Migration Plan
- No backend migration required.
- FE rollout plan:
  1. Build/prepare new primitives for price-lists.
  2. Apply to list page.
  3. Apply to detail view page.
  4. Apply to create and detail edit flows.
  5. Validate behavior parity (API/route/permission).
- Rollback strategy:
  - Keep commits page-scoped so each page can be reverted independently if regressions appear.

## Open Questions
- Should expiring-soon KPI threshold be fixed (for example, 7 days) or configurable?
- Should edit mode load product options (matching create) as part of UX parity, while keeping the same API contract?
- Do we need a print-friendly style in this module now, or defer to later phase?
