# OWASP Top 10:2025 Reference

The OWASP Top 10 is the standard awareness document for developers and web application security. It represents a broad consensus about the most critical security risks to web applications.

| ID | Name | Description | Key Prevention |
| :--- | :--- | :--- | :--- |
| **A01:2025** | **Broken Access Control** | Users can act outside of their intended permissions. | Implement least privilege; check permissions on every request. |
| **A02:2025** | **Security Misconfiguration** | Insecure default settings, incomplete configurations, or open cloud storage. | Automate hardening; remove unused features/debug modes. |
| **A03:2025** | **Software Supply Chain Failures** | Risks from third-party libraries, dependencies, and CI/CD pipelines. | Use SBOMs; verify signatures; use dependency scanning (SCA). |
| **A04:2025** | **Cryptographic Failures** | Use of weak or no encryption for sensitive data. | Use strong algorithms (Argon2, AES-GCM); encrypt data at rest/transit. |
| **A05:2025** | **Injection** | Malicious data sent to an interpreter (SQL, NoSQL, OS Command). | Use parameterized queries; validate and sanitize all inputs. |
| **A06:2025** | **Insecure Design** | Flaws in the application's architecture and design. | Use secure design patterns; perform threat modeling early. |
| **A07:2025** | **Authentication Failures** | Weaknesses in identity verification, session management, or password policies. | Implement MFA; use secure session managers; enforce strong passwords. |
| **A08:2025** | **Software and Data Integrity Failures** | Insecure deserialization or lack of integrity checks on updates/data. | Sign code/data; verify integrity before processing; avoid insecure deserialization. |
| **A09:2025** | **Security Logging & Alerting Failures** | Insufficient logging or monitoring to detect and respond to active attacks. | Log security events; implement real-time alerting; centralize logs. |
| **A10:2025** | **Mishandling of Exceptional Conditions** | Improper error handling, failing open, or leaking info via error messages. | Fail closed; use generic error messages; handle all exceptions. |

## Deep Dive: New/Updated Categories

### A03:2025 Software Supply Chain Failures
This category focuses on the risks associated with the components and services that make up the software development life cycle.
- **Vulnerabilities**: Using libraries with known vulnerabilities (CVEs), dependency confusion attacks, compromised build pipelines.
- **Prevention**: Generate and maintain a **Software Bill of Materials (SBOM)**, use tools like `npm audit`, `pip-audit`, or Snyk.

### A10:2025 Mishandling of Exceptional Conditions
Focuses on how the application behaves when things go wrong.
- **Vulnerabilities**: "Fail-open" logic (e.g., if an auth check throws an error, it defaults to 'allow'), leaking stack traces or sensitive environment variables in error responses.
- **Prevention**: Always "Fail-closed". Ensure that if an error occurs during a security check, access is denied by default.
