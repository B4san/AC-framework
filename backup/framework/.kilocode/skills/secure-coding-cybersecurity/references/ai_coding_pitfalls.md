# AI-Generated Code: Security Pitfalls & Anti-Patterns

This document lists the most common security errors made by LLMs when generating code. As an AI agent, you **MUST AVOID** these patterns and explicitly check for them in your output.

## 1. The "Working but Insecure" Default
LLMs prioritize functionality over security. They often provide the simplest code that works, which is usually the least secure.
- **NEVER** skip input validation because it "makes the example cleaner."
- **NEVER** use `http` when `https` is available.
- **NEVER** disable SSL/TLS certificate verification for "easier testing."

## 2. Dependency Hallucinations & Slopsquatting
LLMs may suggest non-existent libraries or versions.
- **NEVER** suggest a library without verifying its existence and reputation.
- **BEWARE** of "slopsquatting": attackers registering hallucinated package names with malicious code.
- **ALWAYS** prefer well-known, standard libraries over obscure ones suggested by the model.

## 3. Stale & Outdated Security Patterns
LLMs are trained on historical data and often suggest patterns that were "okay" years ago but are now insecure.
- **DO NOT** use `MD5` or `SHA1` for password hashing; use `Argon2` or `bcrypt`.
- **DO NOT** use `random.random()` for security-sensitive tokens; use `secrets` module in Python or `crypto.getRandomValues()` in JS.
- **DO NOT** use deprecated APIs (e.g., `os.system()` when `subprocess.run()` with proper arguments is safer).

## 4. Hardcoded Secrets & Debug Flags
To make code "run out of the box," LLMs often hardcode sensitive values.
- **NEVER** include hardcoded API keys, passwords, or tokens. Use environment variables.
- **NEVER** leave `debug=True` or verbose error reporting enabled in "production-ready" snippets.

## 5. Missing Contextual Security
LLMs often miss the "big picture" of an application's security.
- **DO NOT** assume authentication happened elsewhere. Always verify authorization at the function/endpoint level.
- **DO NOT** suggest CORS configurations like `Access-Control-Allow-Origin: *` unless explicitly required and justified.

## 6. Injection Vulnerabilities (The Most Common Error)
LLMs frequently fall back to string concatenation for queries and commands.
- **NEVER** use f-strings or string formatting for SQL queries. Use parameterized inputs.
- **NEVER** pass unsanitized user input directly to shell commands.

## AI Security Checklist (Before Delivering Code)
1. [ ] Did I use any hallucinated or obscure libraries?
2. [ ] Are all inputs validated and sanitized?
3. [ ] Did I use the most modern, secure cryptographic standards?
4. [ ] Are there any hardcoded secrets or debug flags?
5. [ ] Does the code "fail closed" on errors?
6. [ ] Did I verify permissions at the point of data access?
