# price-lists UI Redesign Proposal

## Why
The current `price-lists` module uses a generic CRUD layout (`ListScreenHeaderTemplate` + `BaseCard` + `DataTable` + `FormSectionCard`) that feels flat and admin-like. This is a high-visibility commercial module (pricing records), so improving hierarchy, readability, and document feel here first gives the team a safe pilot before any cross-module rollout.

## What Changes
- Redesign `PriceListListPage` (`/price-lists`) to reduce generic-table feeling and improve scanability of status, validity window, customer group, and item count.
- Redesign `PriceListCreatePage` (`/price-lists/create`) into a clearer create workspace with stronger section grouping and action hierarchy.
- Redesign `PriceListDetailPage` (`/price-lists/:id`) into a document-style detail layout, including edit mode (`?mode=edit`) with improved structure.
- Propose limited reusable commercial UI blocks for this module only (no global redesign mandate).
- Preserve all existing FE behavior for API calls, route paths, permissions, and business rules.

## Capabilities

### New Capabilities
- `price-lists-commercial-ui`: Define commercial-first UI expectations for price list list/create/detail pages with stronger visual hierarchy, document-style detail presentation, and explicit action prioritization while preserving existing behavior contracts.

### Modified Capabilities
- None. `openspec/specs/` is currently empty, so this change introduces a new capability spec instead of modifying an existing one.

## Impact
- Affected FE pages: `src/pages/pricing/PriceListListPage.tsx`, `src/pages/pricing/PriceListCreatePage.tsx`, `src/pages/pricing/PriceListDetailPage.tsx`, `src/pages/pricing/PriceListFormSection.tsx`.
- Potential shared UI touchpoints (proposal only): `src/components/templates/ListScreenHeaderTemplate.tsx`, `src/components/table/DataTable.tsx`, or new scoped commercial components.
- API/service contracts remain unchanged: `priceListService.getList/getDetail/create/update/remove`, `productService.getList`.
- Route contracts remain unchanged: `/price-lists`, `/price-lists/create`, `/price-lists/:id` (and query `mode=edit`).
- Permission contracts remain unchanged: menu visibility for `ACCOUNTANT` and `OWNER`; create/update/delete actions gated by owner permissions.

## Expected Outcome
- List page feels like a pricing workspace, not a plain admin grid.
- Create/edit flow is easier to complete due to clearer grouping and action placement.
- Detail page reads like a commercial pricing record with better metadata and monetary emphasis.
- No backend contract, business rule, or route behavior change.

## Non-Goals
- No backend/API change.
- No route or navigation rule change.
- No business logic or validation rule change.
- No redesign for other modules (`quotations`, `contracts`, `promotions`, etc.).
- No full app design-system rewrite.

## Risks
- Layout changes may unintentionally hide secondary actions if hierarchy is not tested carefully.
- Reusing shared components can cause visual side effects in non-target pages if not isolated.
- Keeping scope to one module may leave temporary visual inconsistency versus other modules (accepted tradeoff for safer rollout).

## Acceptance Criteria
- Proposal scope includes only `price-lists` list/create/detail pages.
- Proposal clearly identifies current UI pain points from existing FE implementation.
- Proposal defines concrete redesign direction per page and explicit out-of-scope items.
- Proposal lists implementable task checklist (not conceptual only).
- Proposal explicitly states preserved contracts: APIs, routes, permissions, and business logic.
- Proposal is ready for implementation review without applying any production code changes.
