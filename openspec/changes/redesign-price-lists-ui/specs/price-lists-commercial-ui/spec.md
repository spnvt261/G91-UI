# price-lists-commercial-ui Spec Delta

## ADDED Requirements

### Requirement: Price list list page MUST present commercial information hierarchy
The system MUST render the `price-lists` list page as a commercial pricing workspace with explicit hierarchy for portfolio context, filtering, and record scanning.

#### Scenario: List page hierarchy on load
- **WHEN** an authorized user opens `/price-lists`
- **THEN** the page MUST show a hero-level header section before the record table
- **AND** the page MUST show a summary/KPI layer that surfaces portfolio-level pricing signals
- **AND** filter/search controls MUST be presented as a dedicated control section before the main table

#### Scenario: List row action hierarchy
- **WHEN** the list renders row actions for a price list record
- **THEN** `View` MUST be presented as the primary row-level read action
- **AND** `Edit` MUST be visually secondary to `View`
- **AND** destructive actions such as `Delete` MUST be visually distinguished from non-destructive actions

### Requirement: Price list create page MUST provide structured workspace layout
The system MUST present `/price-lists/create` as a structured create workspace that separates metadata entry, line-item construction, and submission controls.

#### Scenario: Create workspace composition
- **WHEN** a user opens `/price-lists/create`
- **THEN** the page MUST group fields into clear sections for basic information, validity/status, and line items
- **AND** the page MUST provide a persistent action area that keeps primary and secondary actions discoverable during form entry
- **AND** line-item editing MUST remain available within the same create flow

#### Scenario: Create flow behavior preservation
- **WHEN** a user submits a valid create form
- **THEN** the system MUST keep using the existing create API behavior and payload semantics
- **AND** the system MUST keep navigating to price list detail after successful creation
- **AND** validation/business rules for required fields and line items MUST remain unchanged

### Requirement: Price list detail page MUST present a document-style commercial record
The system MUST render `/price-lists/:id` as a document-style detail view where summary metadata is prioritized before line-item details.

#### Scenario: Detail view reading flow
- **WHEN** a user opens `/price-lists/:id` in view mode
- **THEN** the page MUST present a summary header with key metadata (name/status/validity) before the line-item section
- **AND** metadata and pricing item sections MUST be visually separated as document blocks
- **AND** the line-item section MUST remain available with existing item-level data

#### Scenario: Detail edit workspace
- **WHEN** an authorized user switches to `?mode=edit`
- **THEN** the page MUST use the redesign workspace structure for edit interactions
- **AND** save and cancel actions MUST remain clearly prioritized and always discoverable
- **AND** edit mode MUST preserve existing update semantics and mode toggle behavior

### Requirement: UI redesign MUST preserve route, permission, and API contracts
The redesign MUST remain presentation-focused and MUST NOT change established behavior contracts.

#### Scenario: Contract parity validation
- **WHEN** the redesigned pages are exercised for list/create/detail/edit/delete flows
- **THEN** route paths and query-param behavior MUST remain unchanged
- **AND** permission gating for create/update/delete actions MUST remain unchanged
- **AND** existing price-list and product service API contracts MUST remain unchanged
