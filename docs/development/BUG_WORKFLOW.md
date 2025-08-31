## Bug Workflow and Data Model

### BugReport UML (Mermaid)
```mermaid
classDiagram
  class IssueRecord {
    +string id
    +string title
    +string status
    +string priority
    +string severity
    +datetime createdAt
    +datetime updatedAt
  }

  class BugReport {
    +string reportId
    +string title
    +string reporter
    +datetime timestamp
    +string environment
    +string[] stepsToReproduce
    +string reproducibility
    +string expectedResult
    +string actualResult
    +string[] visualEvidence
    +string severity
    +string priority
    +string businessImpact
    +string workaround
    +string[] relatedIssues
    +string patchLink
    +string testsIncluded
    +string status
    +string workflowNotes
  }

  IssueRecord <|-- BugReport
```

### Bug Lifecycle Activity
```mermaid
flowchart TD
  A[Report Bug] --> B[Triage]
  B -->|Incomplete| A
  B -->|Valid| C[Assign to Dev]
  C --> D[Reproduce]
  D --> E[Fix & PR]
  E --> F[Code Review]
  F -->|Changes requested| E
  F --> G[Merge]
  G --> H[Regression Testing]
  H -->|Fail| C
  H -->|Pass| I[Close]
```

### Status Workflow
```mermaid
stateDiagram-v2
  [*] --> New
  New --> Triaged
  Triaged --> InProgress
  InProgress --> FixSubmitted
  FixSubmitted --> Verifying
  Verifying --> Closed
  Verifying --> InProgress : Reopened
```

### Roles and Handoffs
```mermaid
sequenceDiagram
  actor Reporter
  participant QA as QA Lead
  participant Dev as Developer
  participant Reviewer as Code Reviewer
  participant Tester as Tester

  Reporter->>QA: Submit BugReport
  QA->>Reporter: Request more info (if needed)
  QA->>Dev: Assign with severity/priority
  Dev->>Dev: Reproduce issue
  Dev->>Reviewer: Submit PR (patchLink)
  Reviewer->>Dev: Review feedback
  Reviewer->>Dev: Approve and merge
  Dev->>Tester: Hand off build for verification
  Tester->>Dev: Fail → reopen (notes)
  Tester->>QA: Pass → close
```

Use the .github/ISSUE_TEMPLATE/bug_report.yml when filing bugs to ensure complete, reproducible reports.

