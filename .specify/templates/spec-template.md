# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]  
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

### LIS Workflow Integrity *(mandatory for this project)*

- List the impacted workflow steps from this canonical chain:
  registration -> ordering -> collection -> receipt -> analysis -> entry -> approval ->
  print -> payment.
- State explicit guard conditions for each affected transition.
- Identify any prohibited bypasses and how they are prevented.

### Access Control and Permission Mapping *(mandatory for this project)*

- Identify actors in scope: reception staff, lab technician, lab doctor, system admin.
- Map each critical action to permission positions: T/X/S/V/I/E.
- Document where enforcement occurs (frontend guard, resolver guard, service guard).

### Result Approval and Auditability *(mandatory if feature touches results/output)*

- Define approval prerequisites before print/export/transmit.
- Define audit fields captured (approver, approval timestamp, amendment history).
- Define rejection behavior for unapproved outputs.

### Data Partition and Reporting Impact *(mandatory if feature touches data/query/reporting)*

- Define MMYY partition strategy and cross-month query behavior.
- Specify whether `pkg_xetnghiem` stored procedures are required and why.
- Define reconciliation expectations for multi-schema aggregation.

### Analyzer Integration Contract *(mandatory if feature touches device ingestion)*

- Describe analyzer adapter changes and mapping-layer updates.
- Define parameter-to-LIS-test-code mapping strategy.
- Confirm new device onboarding does not require core workflow code changes.

### Result Entry Operating Mode *(mandatory for this project)*

- State whether the feature operates in `Manual LIS`, `Analyzer Integrated LIS`, or both.
- Define how result entry occurs in the selected mode.
- Confirm approval, audit logging, and integrity rules remain unchanged across modes.

### Specimen Identification and Lifecycle *(mandatory if feature touches specimens)*

- Define unique specimen identifier strategy (barcode and/or equivalent unique ID).
- Define generation point (test ordering or specimen collection).
- Define continuity checks across collection -> transport -> receipt -> validation ->
  analysis.
- Define rejection criteria (damaged, insufficient volume, incorrect container,
  expired specimen) and status/reason persistence.

### Analyzer Ingestion Pipeline Controls *(mandatory if feature touches analyzer ingestion)*

- Define the ingestion path: device listener -> raw ingestion -> mapping -> validation ->
  LIS result storage.
- Define raw staging persistence before mapping.
- Define validation rules for units, reference range compatibility, and abnormal flags.
- Define storage gate behavior when mapping or validation fails.

### Manual Result Entry Controls *(mandatory if feature touches manual result entry)*

- Define result-entry service flow for manually entered results.
- Define validation, reference-range checks, and audit behavior before persistence.
- Define approval gating before print/export/transmit for manually entered results.

### External Integration Standards *(mandatory if feature transmits data externally)*

- Specify protocol contract (HL7 v2, FHIR, XML/JSON gateway) by integration boundary.
- Define output gating to prevent transmission of unapproved results.
- Define adapter boundaries that isolate integration logic from core workflow services.

### Audit Logging and Data Lifecycle *(mandatory if feature mutates clinical or access data)*

- Define immutable audit events and payload fields (actor, timestamp, action type,
  previous value, new value).
- Define audit coverage for result entry/modification/approval/export, permission changes,
  and specimen rejection when applicable.
- Define data retention window impact and archival accessibility impact for reporting.

### Authorization and Session Security *(mandatory if feature introduces protected actions)*

- Define explicit approval permission rules independent from generic T/X/S/V/I/E mapping.
- Define authentication requirements for all accessed resources.
- Define session expiration and re-authentication requirements for sensitive actions.

### Identity and Order Integrity *(mandatory if feature touches registration/order/specimen/result data)*

- Define patient identity continuity across registration, order, specimen, and result.
- Define unique order identifier behavior and propagation to downstream artifacts.
- Define permanent references linking specimens/results to originating patient and order.

### Result Integrity and Versioning *(mandatory if feature touches approved results)*

- Define immutability constraints for approved results.
- Define amendment workflow and version-history requirements.
- Define integrity checks for post-approval changes.

### Consistency, Performance, and Reporting Integrity *(mandatory if feature touches storage/query/reporting)*

- Define referential and transactional consistency requirements.
- Define partition-aware query strategy and high-throughput ingestion constraints when
  analyzer integration is enabled.
- Define reproducible reporting snapshot strategy and historical consistency behavior.

### Privacy, Recovery, and Operations *(mandatory if feature affects compliance/operations)*

- Define patient confidentiality controls and access-logging behavior.
- Define backup and disaster-recovery impact and non-loss guarantees for approved results.
- Define configuration-governance impact (no-code config changes + auditability).
- Define observability impact for ingestion, database, integrations, and reporting.

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
