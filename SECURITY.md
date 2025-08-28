# Security Policy

Thank you for helping keep this project and its users safe. Please follow the guidance below when reporting security issues.

## Reporting a Vulnerability

- DO NOT open public GitHub issues for security problems.
- Instead, report privately via GitHub Security Advisories or email: security@your-org.example
- Include a clear description, affected versions, minimal Proof-of-Concept, impact analysis, and reproduction steps.
- Provide environment details (OS, browser/runtime, versions) and any relevant logs or screenshots.
- Please follow responsible disclosure and give us reasonable time to investigate and remediate.

If your finding targets Google products or infrastructure (not this repository), submit through Google VRP at bughunters.google.com and follow their scope and policies.

## Coordinated Disclosure Timeline

- We aim to acknowledge within 3 business days, provide a triage decision within 7 business days, and remediate according to severity.
- Standard disclosure target: 90 days; accelerated timelines may apply for actively exploited issues.

## Severity Guidelines (mapping)

- S0 Critical: RCE, auth bypass leading to full compromise, sensitive data exfiltration at scale
- S1 High: Sandbox escapes, universal XSS, privilege escalation
- S2 Medium: Limited data disclosure, exploit aids
- S3 Low: Minor issues with significant mitigations
- S4 Informational: No direct security impact

## Safe Testing

- Use the least-invasive PoCs; avoid impacting other users or production data
- Respect rate limits and terms of service; do not perform DoS
- Never include secrets in PoCs; redact sensitive data in reports

We appreciate your efforts and will credit researchers according to our disclosure policy once a fix is released.