---
name: security-scan
description: Run automated security checks and summarize findings with remediation priorities.
license: MIT
compatibility: Language-agnostic.
metadata:
  author: ac-framework
  version: "1.0"
---

# Security Scan

Automates vulnerability checks during validation.

## Steps
1. Select stack-appropriate scanners (e.g., npm audit, pip-audit, bandit, semgrep).
2. Execute scans and collect outputs.
3. Classify findings by severity and exploitability.
4. Create remediation plan with owners/status.
5. Save report to `.agents/security-scan.md`.

## Output
- `.agents/security-scan.md`

## Guardrails
- Do not suppress findings silently.
- Document accepted risk with justification and expiry date.
