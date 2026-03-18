# Secure Coding Examples

This document provides comparisons between vulnerable and secure code across multiple languages.

## 1. Injection (A05:2025) - SQL Injection

### Python (Insecure)
```python
# VULNERABLE: String formatting allows SQL injection
cursor.execute(f"SELECT * FROM users WHERE username = '{username}'")
```

### Python (Secure)
```python
# SECURE: Use parameterized queries
cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
```

### Node.js (Secure)
```javascript
// SECURE: Using placeholders in pg-promise or similar
db.any('SELECT * FROM users WHERE username = $1', [username]);
```

---

## 2. Broken Access Control (A01:2025) - IDOR

### Node.js (Insecure)
```javascript
// VULNERABLE: No check if the user owns the record
app.get('/api/invoice/:id', async (req, res) => {
    const invoice = await db.getInvoice(req.params.id);
    res.json(invoice);
});
```

### Node.js (Secure)
```javascript
// SECURE: Verify ownership
app.get('/api/invoice/:id', async (req, res) => {
    const invoice = await db.getInvoice(req.params.id);
    if (invoice.userId !== req.user.id) {
        return res.status(403).send('Forbidden');
    }
    res.json(invoice);
});
```

---

## 3. Cryptographic Failures (A04:2025) - Password Hashing

### Python (Secure)
```python
import argon2

ph = argon2.PasswordHasher()
hash = ph.hash("my_secure_password")
# To verify:
ph.verify(hash, "user_input_password")
```

---

## 4. Mishandling of Exceptional Conditions (A10:2025) - Fail Closed

### Java (Insecure)
```java
// VULNERABLE: Fail-open logic
public boolean isAuthorized(User user) {
    try {
        return ldapService.checkAccess(user);
    } catch (Exception e) {
        // If service is down, it might return true or allow bypass
        return true; 
    }
}
```

### Java (Secure)
```java
// SECURE: Fail-closed logic
public boolean isAuthorized(User user) {
    try {
        return ldapService.checkAccess(user);
    } catch (Exception e) {
        logger.error("Auth service error", e);
        return false; // Access denied by default
    }
}
```

---

## 5. Software Supply Chain (A03:2025) - Dependency Management

### Best Practices
- **Python**: Use `pip-audit` to check for known vulnerabilities.
- **Node.js**: Use `npm audit` or `pnpm audit`.
- **General**: Use a Lockfile (`package-lock.json`, `poetry.lock`) to ensure consistent builds.
- **SBOM**: Generate an SBOM using tools like `syft` or `cyclonedx-cli`.
