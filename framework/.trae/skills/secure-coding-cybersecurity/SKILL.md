---
name: secure-coding-cybersecurity
description: "Expert guidance on secure coding practices, focusing on preventing common security errors made by AI during code generation. Use for: auditing AI-generated code, implementing secure design patterns, and ensuring code follows OWASP Top 10 standards. Covers input validation, authentication, cryptography, file handling, secure configuration, and business logic security."
---

# Secure Coding & Cybersecurity Skill

## Vision and Purpose

This skill establishes security as a first-class citizen in code generation and review. It recognizes that AI-generated code often prioritizes functionality over security, inheriting and propagating vulnerabilities from training data. This skill provides comprehensive guardrails, checklists, and verification steps to ensure all code—especially AI-generated—is robust, secure, and follows industry best practices.

## Critical Understanding: Why AI Code is Often Insecure

AI models optimize for "working code" and "correct-looking output" before "secure and robust code." This introduces classic vulnerabilities at concerning rates:

### Root Causes of AI Security Failures

1. **Functionality over Security**: If the prompt doesn't explicitly demand security, the model prioritizes the shortest solution even if it uses `eval()`, SQL string concatenation, or hardcoded keys.

2. **Learning from Insecure Examples**: A significant portion of publicly available code contains bad practices (hardcoded secrets, weak encryption, missing validation), and models reproduce these patterns.

3. **Lack of Context Awareness**: AI doesn't understand your business rules, threat model, or compliance requirements (PCI-DSS, HIPAA, GDPR), filling gaps with dangerous assumptions.

4. **High CWE Rates in Studies**: Empirical research consistently finds serious vulnerabilities (SQLi, XSS, buffer overflows, crypto misuse, hardcoded credentials) in AI-generated code samples.

## The Security Non-Negotiables

These rules must NEVER be violated, regardless of convenience or "example purposes":

1. **Never Prioritize Simplicity Over Security**: Do not provide "clean" examples that omit input validation or use insecure defaults, even with disclaimers.

2. **Treat AI Output as Untrusted**: Always audit AI-generated snippets for hallucinated libraries, outdated patterns, and missing security controls.

3. **Fail Closed**: All logic must default to "Access Denied" if an exception occurs, validation fails, or state is unclear.

4. **No Hardcoded Secrets**: Never suggest code with hardcoded API keys, passwords, tokens, or cryptographic keys. Always use environment variables, secret managers, or secure vaults.

5. **Parameterized Everything**: Never use string concatenation or formatting for SQL queries, OS commands, HTML rendering, or LDAP filters.

6. **Validate All Inputs**: Every piece of external data must be validated and sanitized before use.

7. **Defense in Depth**: Never rely on a single security control; implement multiple layers of protection.

## Comprehensive Security Checklist

### 1. Input Validation and Injection Prevention

**The Problem**: AI frequently omits input validation and sanitization unless explicitly requested, leading to CWE-20 (Improper Input Validation) and the entire injection vulnerability family (SQLi, XSS, OS Command Injection, LDAP Injection).

**Research Finding**: Multiple studies identify SQL injection, XSS, and OS command injection as recurrent vulnerabilities in LLM-generated code.

#### Checklist

- [ ] **Validate and normalize ALL user input** before use, including:
  - Query parameters (URL parameters)
  - Request body (JSON, form data)
  - Headers (including custom headers)
  - Path parameters
  - File uploads
  - WebSocket messages
  - GraphQL inputs

- [ ] **Use allowlists over denylists**: Define what is permitted rather than trying to block what is malicious. Use strict type checking, enum validation, and schema validation.

- [ ] **Parameterized queries ONLY**: Never concatenate strings to build SQL queries, shell commands, LDAP filters, XPath expressions, or NoSQL queries. Always use:
  - Prepared statements with bound parameters
  - ORM query builders with parameterized methods
  - Safe API abstractions that prevent injection

- [ ] **XSS Prevention**: Escape or sanitize all data before rendering in HTML contexts:
  - Use auto-escaping template engines
  - Apply context-appropriate encoding (HTML, JavaScript, CSS, URL)
  - Avoid `innerHTML`, `document.write`, and similar dangerous APIs
  - Implement Content Security Policy (CSP) headers

- [ ] **Disable dangerous evaluation**: Never use `eval()`, `Function()`, `exec()`, `child_process.exec()`, `Runtime.exec()`, `os.system()`, or similar on user-controlled data. If dynamic execution is absolutely necessary, use strict sandboxing and allowlists.

- [ ] **Strict regex validation**: When using regular expressions for validation:
  - Prefer exact match patterns (`^pattern$`) over partial matches
  - Avoid overly permissive patterns
  - Be aware of ReDoS (Regular Expression Denial of Service) vulnerabilities

#### Verification Steps

Before considering input handling complete:

1. **Fuzz Test**: Test with unexpected inputs (null, empty strings, very long strings, special characters, Unicode, binary data)
2. **Injection Test**: Attempt SQL, NoSQL, command, and XSS injection payloads
3. **Boundary Test**: Test at and beyond length limits, type boundaries, and range limits
4. **Negative Test**: Ensure invalid inputs are rejected with appropriate errors

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - SQL Injection vulnerability
query = f"SELECT * FROM users WHERE id = {user_id}"
cursor.execute(query)

# ✅ DO THIS INSTEAD - Parameterized query
query = "SELECT * FROM users WHERE id = ?"
cursor.execute(query, (user_id,))

# ❌ NEVER DO THIS - XSS vulnerability
element.innerHTML = userInput

// ❌ NEVER DO THIS - Command Injection
const output = exec(`ls ${userInput}`);

// ✅ DO THIS INSTEAD - Safe command execution with allowlist
const allowedCommands = ['list', 'status'];
if (allowedCommands.includes(userInput)) {
  const output = execFile('ls', [safePath]);
}
```

---

### 2. Authentication, Authorization, and Session Management

**The Problem**: AI generates authentication flows that "pass happy path tests" but ignore critical security details like rate limiting, constant-time comparison, or fine-grained authorization controls. This enables brute-force attacks, privilege escalation, and API abuse.

#### Checklist

- [ ] **Secure password storage**:
  - Use modern, memory-hard algorithms: Argon2id (recommended), bcrypt, or scrypt
  - Never use MD5, SHA1, SHA256 for password hashing (they're too fast)
  - Always use unique salts per password
  - Configure appropriate cost factors/work factors

- [ ] **Constant-time comparisons**: Compare tokens, passwords, and API keys using constant-time comparison functions to prevent timing attacks:
  - Python: `hmac.compare_digest()`
  - Node.js: `crypto.timingSafeEqual()`
  - Java: `MessageDigest.isEqual()`

- [ ] **Rate limiting and brute-force protection**:
  - Implement rate limiting on login endpoints, password reset, OTP verification, and sensitive APIs
  - Use progressive delays for failed attempts
  - Consider CAPTCHA after multiple failures
  - Implement account lockout policies (with unlock mechanisms)

- [ ] **Authorization on every endpoint**:
  - Verify ownership and permissions on every request, not just authentication
  - Check for IDOR (Insecure Direct Object Reference) vulnerabilities
  - Validate that users can only access their own resources
  - Implement attribute-based access control (ABAC) where appropriate

- [ ] **Secure session management**:
  - Use cryptographically secure random session IDs
  - Implement reasonable session timeouts
  - Support session revocation and rotation
  - Regenerate session IDs on privilege changes (login, password change, role change)

- [ ] **Secure cookie configuration**:
  - Set `HttpOnly` flag (prevents JavaScript access)
  - Set `Secure` flag (HTTPS only)
  - Set `SameSite` attribute (Strict or Lax)
  - Use appropriate `Max-Age` or `Expires`
  - Consider `__Host-` prefix for additional protection

- [ ] **JWT security**:
  - Use strong signing algorithms (RS256, ES256, HS256 with strong secrets)
  - Never use "none" algorithm or weak secrets
  - Set short expiration times
  - Include token rotation and revocation mechanisms
  - Store tokens securely (not in localStorage for sensitive apps)

- [ ] **Password reset security**:
  - Use cryptographically secure random tokens with high entropy
  - Implement single-use tokens with short expiration
  - Do not reveal whether an email exists in the system (privacy protection)
  - Invalidate existing tokens when new ones are requested
  - Require re-authentication after password reset

- [ ] **Multi-factor authentication (MFA)**:
  - Support TOTP (Time-based One-Time Password)
  - Support WebAuthn/FIDO2 for strong authentication
  - Enforce MFA for privileged accounts
  - Implement backup codes securely

#### Verification Steps

1. **Brute Force Test**: Attempt to guess passwords, session IDs, and tokens
2. **Timing Attack Test**: Measure response times for different inputs
3. **Authorization Test**: Try to access other users' resources
4. **Session Fixation Test**: Verify session ID changes on login
5. **Token Analysis**: Check JWT headers and payloads for security issues

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - Insecure password hashing
hashed = hashlib.md5(password.encode()).hexdigest()

# ✅ DO THIS INSTEAD - Secure password hashing
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))

# ❌ NEVER DO THIS - Timing attack vulnerability
if token == stored_token:
    # authenticate

# ✅ DO THIS INSTEAD - Constant-time comparison
if hmac.compare_digest(token, stored_token):
    # authenticate

# ❌ NEVER DO THIS - No rate limiting
@app.route('/login', methods=['POST'])
def login():
    # authenticate

# ✅ DO THIS INSTEAD - Rate limiting
@limiter.limit("5 per minute")
@app.route('/login', methods=['POST'])
def login():
    # authenticate

# ❌ NEVER DO THIS - Missing authorization check
@app.route('/api/documents/<doc_id>')
def get_document(doc_id):
    return Document.query.get(doc_id)  # No ownership check!

# ✅ DO THIS INSTEAD - Verify ownership
def get_document(doc_id):
    document = Document.query.get_or_404(doc_id)
    if document.owner_id != current_user.id:
        abort(403)
    return document
```

---

### 3. Cryptography and Secrets Management

**The Problem**: AI models frequently copy insecure cryptographic patterns from training data: obsolete ciphers, incorrect modes, hardcoded keys, weak PRNGs, and custom cryptographic schemes. They also commonly suggest embedding secrets directly in code or configuration files.

#### Checklist

- [ ] **No hardcoded secrets**: Search for and eliminate:
  - API keys embedded in source code
  - Database passwords in configuration files
  - Private keys in repositories
  - Authentication tokens in comments or documentation
  - Long hex/base64 strings that could be encoded secrets

- [ ] **Secure secrets management**:
  - Use dedicated secrets managers (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, Google Secret Manager)
  - Use environment variables as minimum acceptable practice (never commit `.env` files)
  - Implement secret rotation policies
  - Use separate secrets for different environments

- [ ] **Modern cryptographic algorithms**:
  - Symmetric encryption: AES-256-GCM (authenticated encryption) or ChaCha20-Poly1305
  - Asymmetric encryption: RSA-2048+ (OAEP padding) or ECC (P-256, P-384)
  - Hashing: SHA-256, SHA-3, or BLAKE2/BLAKE3
  - Password hashing: Argon2id, bcrypt, or scrypt
  - Key exchange: ECDH, X25519

- [ ] **Avoid deprecated/weak algorithms**:
  - Never use DES, 3DES, RC4, or AES-ECB
  - Avoid MD5 and SHA1 for security-sensitive operations
  - Don't use PKCS#1 v1.5 padding for RSA

- [ ] **Cryptographically secure random number generation**:
  - Python: `secrets.token_hex()`, `secrets.token_urlsafe()`, `secrets.randbits()`
  - Node.js: `crypto.randomBytes()`, `crypto.randomUUID()`
  - Java: `SecureRandom`
  - Never use `Math.random()`, `random` module, or other non-cryptographic RNGs for security purposes

- [ ] **Proper key lengths and parameters**:
  - AES: 256-bit keys
  - RSA: 2048-bit minimum (4096 recommended for long-term)
  - ECC: P-256 minimum
  - Argon2id: Appropriate memory, iterations, and parallelism for your hardware

- [ ] **Proper IV/nonce handling**:
  - Use cryptographically secure random IVs for each encryption operation
  - Never reuse IVs with the same key (especially for GCM mode)
  - IVs don't need to be secret but must be unique

- [ ] **Never roll your own crypto**:
  - Don't create custom encryption schemes
  - Don't implement your own authentication protocols
  - Don't create custom hash functions
  - Use well-vetted libraries and follow their documentation

#### Verification Steps

1. **Secret Scanning**: Use tools like `truffleHog`, `git-secrets`, or `detect-secrets` to find leaked secrets
2. **Algorithm Audit**: Verify all cryptographic algorithms are modern and properly used
3. **Key Analysis**: Check key generation, storage, and rotation practices
4. **Randomness Test**: Verify CSPRNG usage for all security-sensitive random values

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - Hardcoded secret
API_KEY = "sk_live_1234567890abcdef"

# ✅ DO THIS INSTEAD - Load from environment
import os
API_KEY = os.environ.get('API_KEY')
if not API_KEY:
    raise ValueError("API_KEY environment variable is required")

# ❌ NEVER DO THIS - Weak encryption
encrypted = des.encrypt(data)

# ✅ DO THIS INSTEAD - Authenticated encryption
from cryptography.fernet import Fernet
key = Fernet.generate_key()
cipher = Fernet(key)
encrypted = cipher.encrypt(data)

# ❌ NEVER DO THIS - Insecure random for security
import random
token = random.randint(100000, 999999)

# ✅ DO THIS INSTEAD - Cryptographically secure random
import secrets
token = secrets.randbelow(1000000)

# ❌ NEVER DO THIS - Custom crypto scheme
def custom_hash(data):
    return data[::-1] + "salt"

# ✅ DO THIS INSTEAD - Use standard library
import hashlib
hashed = hashlib.sha256(data).hexdigest()
```

---

### 4. File Handling, Uploads, and Deserialization

**The Problem**: Documentation examples that AI learns from often omit path validation, file type checking, or size limits. This enables path traversal, remote code execution via deserialization, and Denial of Service through huge files. AI frequently uses dangerous APIs like `pickle.loads()` or `unserialize()` on untrusted data.

#### Checklist

- [ ] **Path traversal prevention**:
  - Normalize all file paths derived from user input
  - Restrict file access to allowlisted directories
  - Use `chroot` jails or containerization where appropriate
  - Validate that resolved paths stay within allowed boundaries
  - Strip or reject path traversal sequences (`../`, `..\`, null bytes)

- [ ] **Secure file uploads**:
  - Validate file extensions against allowlists, not denylists
  - Verify MIME types match actual file content (magic bytes)
  - Scan uploaded files for malware
  - Limit file sizes and upload counts per request
  - Store uploads outside web root or use safe serving mechanisms
  - Rename files with random names to prevent execution attacks
  - Remove or sanitize metadata that could leak sensitive information

- [ ] **Deserialization security**:
  - Never deserialize untrusted data using pickle, marshal, or language-specific unsafe deserialization
  - Use safe serialization formats: JSON, MessagePack, Protocol Buffers
  - If object deserialization is necessary, implement strict type allowlists
  - Use schema validation for all deserialized data
  - Consider signing serialized data to prevent tampering

- [ ] **File permission security**:
  - Set least-privilege file permissions (never world-writable)
  - Use separate system users for file operations
  - Implement proper cleanup of temporary files
  - Secure file deletion when required

#### Verification Steps

1. **Path Traversal Test**: Attempt to access files outside allowed directories using `../`, null bytes, Unicode normalization attacks
2. **Upload Security Test**: Try uploading executable files, scripts, oversized files, and malicious content
3. **Deserialization Test**: Attempt deserialization attacks with malicious payloads
4. **File Permission Audit**: Verify file and directory permissions are appropriate

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - Path traversal vulnerability
filename = request.args.get('file')
with open(f"/uploads/{filename}", 'r') as f:
    content = f.read()

# ✅ DO THIS INSTEAD - Safe path handling
import os
from pathlib import Path

upload_dir = Path("/uploads").resolve()
filename = request.args.get('file')
# Sanitize and validate
safe_filename = os.path.basename(filename)
file_path = (upload_dir / safe_filename).resolve()

# Ensure the resolved path is within upload_dir
if not str(file_path).startswith(str(upload_dir)):
    abort(403)

# ❌ NEVER DO THIS - Unsafe deserialization
import pickle
data = pickle.loads(untrusted_input)

# ✅ DO THIS INSTEAD - Safe deserialization
import json
data = json.loads(untrusted_input)
# Validate against schema
if not validate_json_schema(data, SCHEMA):
    raise ValueError("Invalid data format")

# ❌ NEVER DO THIS - Insecure file upload
file = request.files['document']
file.save(f"/uploads/{file.filename}")

// ❌ NEVER DO THIS - Extension validation bypass
const allowedExtensions = ['.jpg', '.png'];
if (allowedExtensions.includes(path.extname(filename))) {
  // This can be bypassed with double extensions or null bytes
}

// ✅ DO THIS INSTEAD - Comprehensive validation
const allowedTypes = ['image/jpeg', 'image/png'];
const maxSize = 5 * 1024 * 1024; // 5MB

if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}

if (file.size > maxSize) {
  throw new Error('File too large');
}

// Verify magic bytes match MIME type
const magic = file.buffer.slice(0, 4);
if (!isValidMagicBytes(magic, file.mimetype)) {
  throw new Error('File content does not match type');
}
```

---

### 5. Secure Configuration and Dependency Management

**The Problem**: AI frequently proposes insecure example configurations: CORS set to `*`, disabled TLS verification, disabled CSRF protection, or verbose debug logging in production. AI may also "hallucinate" packages that don't exist or suggest typosquatted/obsoleted dependencies.

#### Checklist

- [ ] **Secure CORS configuration**:
  - Never use `*` in production (only for specific development scenarios)
  - Explicitly define allowed origins
  - Limit allowed methods and headers
  - Set appropriate `maxAge` for preflight caching
  - Consider credentials handling carefully

- [ ] **TLS/SSL security**:
  - Always enforce HTTPS in production
  - Use TLS 1.2 or higher (disable SSLv3, TLS 1.0, TLS 1.1)
  - Use strong cipher suites
  - Implement proper certificate validation
  - Never disable certificate verification "to make it work"

- [ ] **Security headers**:
  - Content Security Policy (CSP)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options or CSP frame-ancestors
  - Strict-Transport-Security (HSTS)
  - Referrer-Policy
  - Permissions-Policy

- [ ] **CSRF protection**:
  - Enable CSRF tokens for state-changing operations
  - Use double-submit cookie pattern or synchronizer token pattern
  - Validate Origin/Referer headers as additional protection
  - Consider SameSite cookies

- [ ] **Debug mode and information disclosure**:
  - Disable debug mode in production
  - Disable verbose error messages that expose stack traces
  - Disable server version banners
  - Remove default credentials and sample data
  - Disable auto-reload and hot-reload in production

- [ ] **Secure logging**:
  - Never log secrets, tokens, passwords, or PII (Personally Identifiable Information)
  - Use structured logging with appropriate levels
  - Implement log rotation and retention policies
  - Protect log files with appropriate permissions
  - Consider log aggregation with security monitoring

- [ ] **Dependency security**:
  - Verify all suggested packages exist and are legitimate
  - Check for typosquatting attacks (slight misspellings of popular packages)
  - Use lockfiles (package-lock.json, yarn.lock, poetry.lock, Cargo.lock, etc.)
  - Regularly audit dependencies for known vulnerabilities
  - Keep dependencies updated
  - Minimize dependency count (reduce attack surface)

- [ ] **Container and runtime security**:
  - Run containers as non-root user
  - Use minimal base images (distroless, Alpine, scratch)
  - Implement read-only filesystems where possible
  - Use security contexts and capabilities dropping
  - Network segmentation and firewall rules
  - Resource limits (CPU, memory, file descriptors)

#### Verification Steps

1. **Security Headers Test**: Use tools like `securityheaders.com` to verify header configuration
2. **Configuration Audit**: Review all configuration files for insecure defaults
3. **Dependency Scan**: Run SCA tools (Snyk, Dependabot, npm audit, pip-audit)
4. **Container Scan**: Use tools like Trivy, Clair, or Grype to scan container images

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - Insecure CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# ✅ DO THIS INSTEAD - Explicit origins
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://app.example.com", "https://admin.example.com"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# ❌ NEVER DO THIS - Disabled TLS verification
requests.get(url, verify=False)

# ✅ DO THIS INSTEAD - Proper TLS configuration
requests.get(url, verify=True)  # Default, verify certificates

# ❌ NEVER DO THIS - Debug mode in production
app.run(debug=True)

# ✅ DO THIS INSTEAD - Environment-based configuration
debug = os.environ.get('FLASK_ENV') == 'development'
app.run(debug=debug)

# ❌ NEVER DO THIS - Logging sensitive data
logger.info(f"User login: {username}, password: {password}")

// ❌ NEVER DO THIS - Information disclosure in errors
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack });
});

// ✅ DO THIS INSTEAD - Safe error handling
app.use((err, req, res, next) => {
  console.error(err); // Log internally
  res.status(500).json({ error: 'Internal server error' }); // Generic public message
});
```

---

### 6. Business Logic and Contextual Security

**The Problem**: AI doesn't understand your business rules, threat model, or compliance requirements. It makes dangerous assumptions like "the input will always be valid" or "only internal users will call this API." This leads to logic vulnerabilities that aren't syntactically obvious.

#### Checklist

- [ ] **Document security assumptions**: Explicitly write down:
  - Who is calling the API (internal, external, authenticated, anonymous)
  - Where requests are coming from (IP ranges, geolocation)
  - What privileges callers have
  - What the input can contain (valid ranges, formats)
  - What the expected threat model is

- [ ] **Beware of "fast paths"**: Review any logic that skips security controls under certain conditions:
  - "If the request has X header, skip Y validation"
  - "If the user is internal, skip Z check"
  - These can often be abused

- [ ] **Server-side authorization**: Never rely on client-controlled data for authorization decisions:
  - Don't trust JWT claims without verification
  - Don't use client-provided role flags
  - Don't trust client-side validation
  - Always re-verify permissions server-side

- [ ] **Sensitive operation protection**:
  - Require re-authentication for sensitive operations (email change, password change, role change, financial transactions)
  - Implement MFA for high-risk operations
  - Use confirmation mechanisms (email verification, OTP)
  - Log all sensitive operations with audit trails

- [ ] **Data exposure review**:
  - Review all API responses for over-exposure of data
  - Don't expose internal fields (database IDs, internal flags, debug info)
  - Implement field-level access control
  - Use Data Transfer Objects (DTOs) to control exposed data
  - Consider GraphQL query depth and complexity limiting

- [ ] **Race condition protection**:
  - Use transactions for multi-step operations
  - Implement proper locking mechanisms
  - Handle concurrent modifications gracefully
  - Use optimistic or pessimistic locking as appropriate

- [ ] **Business logic validation**:
  - Validate business rules, not just data types
  - Check for impossible states (negative balances, future dates in past, etc.)
  - Implement workflow state validation
  - Validate resource ownership and availability

#### Verification Steps

1. **Abuse Case Analysis**: Think like an attacker—how could this feature be misused?
2. **Boundary Testing**: Test edge cases and business rule boundaries
3. **Race Condition Testing**: Execute concurrent requests to identify timing issues
4. **Data Exposure Audit**: Review all API responses for over-exposure

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - Client-controlled authorization
role = request.json.get('role')  # User can set their own role!
if role == 'admin':
    # grant admin access

# ✅ DO THIS INSTEAD - Server-side role verification
user = get_current_user()
if not user.has_permission('admin'):
    abort(403)

# ❌ NEVER DO THIS - Sensitive operation without confirmation
@app.route('/api/change-email', methods=['POST'])
def change_email():
    current_user.email = request.json['new_email']
    db.session.commit()
    return {'status': 'success'}

# ✅ DO THIS INSTEAD - Require verification
def change_email():
    new_email = request.json['new_email']
    token = generate_verification_token(new_email)
    send_verification_email(new_email, token)
    return {'status': 'verification_sent'}

// ❌ NEVER DO THIS - Over-exposure of data
app.get('/api/users', (req, res) => {
  const users = await User.findAll();
  res.json(users); // Returns all fields including hashed passwords!
});

// ✅ DO THIS INSTEAD - Selective field exposure
app.get('/api/users', async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'username', 'email'] // Explicitly choose fields
  });
  res.json(users);
});
```

---

### 7. Error Handling and Information Disclosure

**The Problem**: AI-generated code often lacks proper error handling or exposes sensitive information in error messages, stack traces, or logs. This aids attackers in reconnaissance and exploitation.

#### Checklist

- [ ] **Safe error responses**: 
  - Return generic error messages to clients
  - Don't expose stack traces, internal paths, or database details
  - Use standardized error response formats
  - Include error codes for support without revealing implementation

- [ ] **Proper exception handling**:
  - Catch specific exceptions, not broad `except:` or `catch (Exception e)`
  - Handle errors gracefully without crashing
  - Ensure resources are cleaned up in finally blocks
  - Don't swallow exceptions silently

- [ ] **Fail securely**:
  - Default to "deny" when errors occur
  - Don't bypass security controls due to exceptions
  - Validate state after error recovery
  - Log security-relevant errors

- [ ] **Information leakage prevention**:
  - Remove version numbers from headers and error pages
  - Don't reveal user enumeration (e.g., "password incorrect" vs "user not found")
  - Sanitize error messages of sensitive data
  - Be careful with 404 vs 403 responses (don't reveal resource existence)

#### Verification Steps

1. **Error Response Analysis**: Trigger errors and examine responses
2. **Stack Trace Exposure**: Verify stack traces aren't returned in production
3. **Information Leakage Test**: Attempt to extract system information through errors

---

### 8. API Security

**The Problem**: APIs are increasingly targeted and AI-generated code often lacks proper API security controls like rate limiting, authentication, input validation, and output encoding.

#### Checklist

- [ ] **API authentication**:
  - Implement proper authentication for all endpoints
  - Use API keys, OAuth 2.0, or JWT appropriately
  - Secure API key transmission (headers, not URL/query params)
  - Implement key rotation mechanisms

- [ ] **API rate limiting**:
  - Implement tiered rate limits (different for authenticated vs anonymous)
  - Use appropriate rate limit windows
  - Return proper 429 status codes
  - Include rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)

- [ ] **API versioning**:
  - Version your APIs to allow graceful deprecation
  - Use URL versioning (/v1/, /v2/) or header versioning
  - Document breaking changes

- [ ] **API documentation security**:
  - Don't expose internal endpoints in public documentation
  - Remove sensitive examples from documentation
  - Secure API specification files

- [ ] **Webhook security**:
  - Verify webhook signatures
  - Use HTTPS for webhook URLs
  - Implement replay attack prevention (timestamps, nonces)
  - Allowlist IP ranges if possible

#### Verification Steps

1. **API Authentication Test**: Attempt to access protected endpoints without authentication
2. **Rate Limiting Test**: Exceed rate limits and verify behavior
3. **API Discovery**: Enumerate endpoints and verify no hidden/internal APIs are exposed

---

## Implementation Workflow

### Phase 1: Design
1. Define threat model and security requirements
2. Identify sensitive data and operations
3. Design authentication and authorization architecture
4. Plan security controls for each component

### Phase 2: Development
1. Apply secure coding patterns from this skill
2. Implement input validation at all entry points
3. Use parameterized queries and safe APIs
4. Configure security headers and CORS properly
5. Implement proper error handling

### Phase 3: Testing
1. Run automated security scans (SAST, SCA)
2. Perform manual code review with this checklist
3. Conduct penetration testing
4. Test with fuzzing and injection payloads
5. Verify business logic security

### Phase 4: Deployment
1. Secure configuration management
2. Enable security monitoring and logging
3. Implement incident response procedures
4. Plan for security updates and patches

## Compliance and Standards

### OWASP Top 10
Stay current with the latest OWASP Top 10 vulnerabilities and ensure your applications are protected against them.

### CWE/SANS Top 25
Address the most dangerous software weaknesses identified by MITRE and SANS.

### Industry-Specific Standards
- **PCI-DSS**: For payment card data
- **HIPAA**: For healthcare data
- **GDPR**: For EU personal data
- **SOC 2**: For service organizations

## When to Use This Skill

- **Before writing any code**: Review security requirements and threat model
- **During code generation**: Ensure AI-generated code follows security best practices
- **During code review**: Verify code against this comprehensive checklist
- **During security audits**: Use as a systematic guide for vulnerability assessment
- **During incident response**: Identify root causes and prevent recurrence
- **During security training**: Educate developers on secure coding practices

## Summary

Security is not a feature—it's a foundation. AI-generated code requires extra scrutiny because models prioritize functionality and aesthetics over security. This skill provides the guardrails, checklists, and verification steps needed to ensure your code is secure by design, not by accident, the examples provided in this place are from python but you need to adapt the logic from python to the codebase language.

Remember: **Trust but verify**. Always assume AI-generated code contains vulnerabilities until proven otherwise through rigorous review and testing.

---

*This skill should be consulted for every code generation task, every code review, and every security audit. Security is everyone's responsibility.*
