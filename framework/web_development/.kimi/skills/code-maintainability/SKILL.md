---
name: code-maintainability
description: "Comprehensive guide to prevent unmaintainable code, especially from AI generation. Covers code duplication, documentation, error handling, naming conventions, architecture, performance, dependencies, modularity, testing, and technical debt prevention. Essential for code reviews and ensuring long-term code health."
---

# Code Maintainability & Quality Skill

## Vision and Purpose

This skill establishes maintainability as a critical quality attribute in code generation and review. It recognizes that AI-generated code often prioritizes immediate functionality over long-term maintainability, creating technical debt that compounds over time. This skill provides comprehensive guidelines, checklists, and best practices to ensure all code—especially AI-generated—is clean, readable, testable, and maintainable.

## Critical Understanding: Why AI Code is Often Unmaintainable

AI models optimize for "working code" and "completing the task" before "maintainable architecture." This creates patterns that are functional today but become liabilities tomorrow.

### Root Causes of AI Maintainability Failures

1. **Functionality over Structure**: AI generates code that passes immediate tests but lacks proper architecture, creating monolithic functions and tight coupling.

2. **Pattern Repetition from Training Data**: AI learns from codebases with varying quality standards, inheriting bad practices like magic numbers, poor naming, and spaghetti code.

3. **Lack of Context Awareness**: AI doesn't understand your team's conventions, existing architecture, or long-term maintenance needs.

4. **Boilerplate Bloat**: Studies show AI generates code with 8x more duplication than human developers, creating maintenance nightmares.

5. **Happy Path Bias**: AI focuses on successful scenarios, neglecting error handling, edge cases, and failure modes.

## The Maintainability Non-Negotiables

These rules must NEVER be violated, regardless of time pressure or "temporary" solutions:

1. **No Code Duplication**: Don't repeat logic—extract to reusable functions, utilities, or shared components.

2. **Document the "Why", Not the "What"**: Comments should explain business decisions and rationale, not restate the code.

3. **Handle All Edge Cases**: Every function must consider null values, empty inputs, boundary conditions, and failures.

4. **Consistent Naming**: Use clear, descriptive names that reveal intent. Avoid abbreviations and single-letter variables.

5. **Single Responsibility**: Each function, class, and module should have one reason to change.

6. **Test Everything**: All code paths—including error conditions—must have automated tests.

7. **No Hardcoded Values**: Use constants, configuration, or environment variables for values that might change.

## Comprehensive Maintainability Checklist

### 1. Code Duplication and Bloat

**The Problem**: AI generates duplicated code blocks at 8x the rate of human developers. This creates maintenance overhead, increases bug propagation, and violates the DRY (Don't Repeat Yourself) principle.

#### Checklist

- [ ] **Detect duplicate blocks**: Search for functions with 90%+ identical logic
  - Look for similar conditional structures repeated across files
  - Identify loops with nearly identical processing logic
  - Find validation patterns copied multiple times

- [ ] **Identify unnecessary layers**: Review wrapper functions that add no value
  - `processData()` that only calls `coreProcessData()` with same arguments
  - Adapter layers that don't transform anything
  - Redundant abstraction hierarchies

- [ ] **Remove dead code**: Eliminate unused artifacts
  - Variables declared but never referenced
  - Import statements for unused dependencies
  - Functions that are never called
  - Commented-out code blocks
  - Unreachable code paths

- [ ] **Measure code volume**: Compare against human-written equivalents
  - If AI code is 2x+ longer, investigate bloat
  - Look for verbose patterns that could be simplified
  - Check for unnecessary intermediate variables

#### Verification Steps

1. **Duplication Scan**: Use tools like SonarQube, jscpd, or PMD CPD to find duplicates
2. **Dead Code Analysis**: Use IDE inspections or tools like vulture (Python), unimport
3. **Complexity Metrics**: Calculate lines of code per function and cyclomatic complexity

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - Duplicated logic
def process_user_data(data):
    if data is None:
        return None
    cleaned = data.strip().lower()
    validated = validate_length(cleaned, 100)
    return validated

def process_product_data(data):
    if data is None:
        return None
    cleaned = data.strip().lower()
    validated = validate_length(cleaned, 100)
    return validated

# ✅ DO THIS INSTEAD - Reusable function
def normalize_text(data, max_length=100):
    """
    Normalize text input by cleaning and validating.
    
    Business Rule: All text inputs must be normalized before storage
    to ensure consistency in search and display.
    
    Args:
        data: Raw text input
        max_length: Maximum allowed length (default: 100)
    
    Returns:
        Normalized string or None if input is None
    """
    if data is None:
        return None
    cleaned = data.strip().lower()
    return validate_length(cleaned, max_length)

# Usage
user_name = normalize_text(raw_user_name)
product_name = normalize_text(raw_product_name)
```

```javascript
// ❌ NEVER DO THIS - Unnecessary wrapper
function processData(data) {
    return coreProcessData(data); // No transformation, no value added
}

// ✅ DO THIS INSTEAD - Use core function directly
// Or add meaningful transformation:
function processAndValidateData(data) {
    const processed = coreProcessData(data);
    return validateBusinessRules(processed);
}
```

---

### 2. Documentation and Comments

**The Problem**: AI generates comments that merely restate what the code does, providing zero value. Missing context about business decisions, edge cases, and integration points makes maintenance difficult.

#### Checklist

- [ ] **Explain the "Why"**: Every non-obvious decision needs explanation
  - Why was this algorithm chosen?
  - Why this specific limit/boundary?
  - What business rule does this enforce?

- [ ] **Document business context**: Include domain knowledge
  - Reference to requirements or tickets
  - Explanation of business constraints
  - Links to related documentation

- [ ] **Document integration points**: Explain external dependencies
  - How this code interacts with other modules
  - Expected contract of external APIs
  - Side effects and state changes

- [ ] **Document edge cases**: Explicitly call out special handling
  - Null/undefined behavior
  - Empty collection handling
  - Boundary conditions
  - Concurrency considerations

- [ ] **Useful vs. useless comments**: Ensure comments add value
  - ❌ Bad: `// increment counter` (restates code)
  - ✅ Good: `// API retry limit: max 3 attempts with exponential backoff starting at 100ms`

#### Verification Steps

1. **Comment Review**: Check that comments explain rationale, not mechanics
2. **Documentation Coverage**: Ensure all public APIs have docstrings/JSDoc
3. **Edge Case Documentation**: Verify all special cases are documented

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - Useless comment
# increment counter
counter += 1

# ❌ NEVER DO THIS - Restating the obvious
def calculate_total(price, quantity):
    # multiply price by quantity
    return price * quantity

# ✅ DO THIS INSTEAD - Explain business context
def calculate_total(price, quantity):
    """
    Calculate order total with volume discount rules.
    
    Business Rules:
    - Base price * quantity for orders < 10 items
    - 5% discount for orders 10-49 items
    - 10% discount for orders 50+ items
    
    Args:
        price: Unit price in cents (integer to avoid floating point errors)
        quantity: Number of items ordered
    
    Returns:
        Total amount in cents
    
    Edge Cases:
        - Returns 0 if quantity is 0
        - Raises ValueError if price or quantity is negative
    """
    if quantity == 0:
        return 0
    
    base_total = price * quantity
    
    if quantity >= 50:
        return int(base_total * 0.90)  # 10% discount
    elif quantity >= 10:
        return int(base_total * 0.95)  # 5% discount
    
    return base_total
```

```javascript
// ✅ DO THIS INSTEAD - Document integration context
/**
 * Process payment through Stripe integration.
 * 
 * Integration Notes:
 * - Requires STRIPE_SECRET_KEY environment variable
 * - Webhook endpoint must be configured at /webhooks/stripe
 * - Idempotency key prevents duplicate charges on retries
 * 
 * Error Handling:
 * - Card errors: Returns 402 with user-friendly message
 * - API errors: Returns 500, logs to Sentry
 * - Network errors: Retries up to 3 times with exponential backoff
 * 
 * @param {Object} paymentData - Payment details
 * @param {string} paymentData.amount - Amount in cents
 * @param {string} paymentData.currency - ISO 4217 currency code
 * @returns {Promise<PaymentResult>} Payment confirmation or error
 */
async function processStripePayment(paymentData) {
    // Implementation with proper error handling...
}
```

---

### 3. Error Handling and Edge Cases

**The Problem**: AI focuses on "happy path" scenarios, neglecting null checks, exceptions, and failure modes. This creates fragile code that fails unpredictably in production.

#### Checklist

- [ ] **Null safety**: Protect against null/undefined values
  - Validate all input parameters at function entry
  - Use optional chaining where appropriate
  - Fail fast with clear error messages

- [ ] **Exception handling**: Catch errors at risk points
  - Database operations
  - External API calls
  - File system operations
  - Parsing operations (JSON, XML, dates)
  - Network requests

- [ ] **Graceful degradation**: Provide fallbacks when possible
  - Default values for missing configuration
  - Cached responses when APIs fail
  - Circuit breakers for external dependencies

- [ ] **Error logging**: Log appropriately for debugging
  - Include context (function name, input parameters, stack trace)
  - Use appropriate log levels (error, warn, info)
  - Never log sensitive data (passwords, tokens, PII)

- [ ] **Edge case testing**: Handle boundary conditions
  - Empty strings and arrays
  - Zero and negative numbers
  - Maximum integer values
  - Special characters and Unicode
  - Maximum file sizes
  - Timeout scenarios

#### Verification Steps

1. **Null Injection**: Pass null/undefined to all parameters
2. **Exception Testing**: Force errors in external dependencies
3. **Boundary Testing**: Test minimum, maximum, and boundary values
4. **Fuzz Testing**: Randomize inputs to find unexpected failures

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - No null checks or error handling
def process_user(user):
    email = user['email']  # KeyError if key missing
    send_email(email)      # Fails if email is None

# ✅ DO THIS INSTEAD - Comprehensive error handling
def process_user(user):
    """
    Process user data with validation and error handling.
    
    Args:
        user: Dictionary containing user data
    
    Raises:
        ValueError: If user data is invalid
        EmailError: If email sending fails
    """
    if not user:
        raise ValueError("User data is required")
    
    email = user.get('email')
    if not email:
        raise ValueError("User email is required")
    
    if not is_valid_email(email):
        raise ValueError(f"Invalid email format: {email}")
    
    try:
        send_email(email)
    except EmailException as e:
        logger.error(f"Failed to send email to {email}: {e}")
        raise EmailError(f"Could not send welcome email") from e
```

```javascript
// ❌ NEVER DO THIS - Missing error handling
async function fetchUserData(userId) {
    const response = await fetch(`/api/users/${userId}`);
    const data = await response.json(); // Crashes if not valid JSON
    return data;
}

// ✅ DO THIS INSTEAD - Robust error handling
async function fetchUserData(userId) {
    if (!userId) {
        throw new ValidationError('User ID is required');
    }
    
    try {
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new NotFoundError(`User ${userId} not found`);
            }
            throw new ApiError(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
            throw new DataError('Invalid response format');
        }
        
        return data;
        
    } catch (error) {
        if (error instanceof ValidationError || error instanceof NotFoundError) {
            throw error; // Re-throw known errors
        }
        
        logger.error('Failed to fetch user data', {
            userId,
            error: error.message,
            stack: error.stack
        });
        
        throw new ServiceError('Unable to retrieve user data');
    }
}
```

---

### 4. Naming Conventions

**The Problem**: AI generates ambiguous, inconsistent, or abbreviated names that obscure intent. Poor naming is one of the biggest barriers to code understanding.

#### Checklist

- [ ] **Descriptive variable names**: Reveal purpose and content
  - ❌ Avoid: `data`, `temp`, `result`, `value`, `x`, `y`
  - ✅ Use: `userEmailList`, `calculatedTaxAmount`, `pendingOrderCount`

- [ ] **Consistent naming patterns**: Follow conventions throughout
  - camelCase for JavaScript/TypeScript variables and functions
  - PascalCase for classes and constructors
  - snake_case for Python variables and functions
  - SCREAMING_SNAKE_CASE for constants
  - Boolean prefix: `is`, `has`, `can`, `should`

- [ ] **Accurate naming**: Names should match actual purpose
  - `isValid` should not mean `isUserEmailVerified`
  - Function names should describe what they do, not how

- [ ] **Avoid abbreviations**: Unless universally understood
  - ❌ Avoid: `usrNm`, `dta`, `proc`, `calc`, `fn`
  - ✅ Acceptable: `id`, `url`, `api`, `html` (domain standards)

- [ ] **Function naming**: Use action verbs
  - `fetch`, `get`, `create`, `update`, `delete`, `process`, `validate`, `calculate`, `transform`

#### Verification Steps

1. **Name Review**: Read names without context—do they make sense?
2. **Abbreviation Check**: Ensure all abbreviations are domain-appropriate
3. **Consistency Audit**: Verify naming conventions are applied consistently

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - Ambiguous names
def calc(a, b):
    return a * b

data = get_data()
for x in data:
    process(x)

# ✅ DO THIS INSTEAD - Clear, descriptive names
def calculate_order_total(item_price, quantity):
    """Calculate total price for order line item."""
    return item_price * quantity

user_orders = fetch_pending_orders()
for order in user_orders:
    process_order_payment(order)
```

```javascript
// ❌ NEVER DO THIS - Inconsistent naming and abbreviations
let usrNm = getUserName();
let is_valid = validateEmail(email);
function procData(d) { /* ... */ }

// ✅ DO THIS INSTEAD - Consistent, clear naming
const userName = getUserName();
const isEmailValid = validateEmail(email);
function processUserData(userData) { /* ... */ }

// Boolean naming convention
const isAuthenticated = checkAuthStatus();
const hasPermission = verifyUserPermission('admin');
const canEdit = determineEditAccess(document);
```

---

### 5. Architecture and Coupling

**The Problem**: AI generates code with excessive coupling, mixing concerns, and inconsistent patterns. This makes changes ripple through the codebase and violates SOLID principles.

#### Checklist

- [ ] **Respect abstractions**: Don't bypass interfaces
  - Reference interfaces/abstract types, not concrete implementations
  - Use dependency injection instead of hardcoded dependencies
  - Follow the Dependency Inversion Principle

- [ ] **Loose coupling**: Minimize inter-module dependencies
  - Changes in one module shouldn't break unrelated modules
  - Use events or message passing for loose communication
  - Apply the Law of Demeter

- [ ] **Consistent patterns**: Use same approach for similar problems
  - Don't mix Singleton, Factory, and direct instantiation arbitrarily
  - Establish and follow architectural patterns
  - Use established design patterns appropriately

- [ ] **Single Responsibility**: One reason to change per component
  - Functions: One task
  - Classes: One responsibility
  - Modules: One domain concern

- [ ] **Separation of concerns**: Keep layers distinct
  - Presentation/UI logic separate from business logic
  - Business logic separate from data access
  - Validation centralized, not scattered

#### Verification Steps

1. **Dependency Analysis**: Use tools like madge, dependency-cruiser
2. **Change Impact Analysis**: Change one module, see what breaks
3. **Architecture Review**: Verify adherence to established patterns

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - High coupling, mixed concerns
class UserService:
    def create_user(self, data):
        # Validation mixed with business logic
        if not data.get('email'):
            raise ValueError("Email required")
        
        # Direct database access mixed in
        db = Database.connect("localhost", "user", "pass123")
        cursor = db.cursor()
        cursor.execute("INSERT INTO users ...")
        
        # Email sending mixed in
        smtp = SMTP("smtp.gmail.com")
        smtp.sendmail("welcome@example.com", data['email'], "Welcome!")
        
        # Logging mixed in
        with open("/var/log/users.log", "a") as f:
            f.write(f"User created: {data['email']}\n")

# ✅ DO THIS INSTEAD - Separated concerns
class UserValidator:
    """Validates user input data."""
    
    def validate_create_data(self, data):
        if not data.get('email'):
            raise ValidationError("Email is required")
        if not is_valid_email(data['email']):
            raise ValidationError("Invalid email format")
        return data

class UserRepository:
    """Handles user data persistence."""
    
    def __init__(self, db_connection):
        self._db = db_connection
    
    def create(self, user_data):
        # Database operations only
        return self._db.insert('users', user_data)

class NotificationService:
    """Handles user notifications."""
    
    def __init__(self, email_client, logger):
        self._email = email_client
        self._logger = logger
    
    def send_welcome_email(self, user_email):
        self._email.send(user_email, "Welcome!", template="welcome")
        self._logger.info(f"Welcome email sent to {user_email}")

class UserService:
    """Orchestrates user creation with proper separation."""
    
    def __init__(self, validator, repository, notifications):
        self._validator = validator
        self._repository = repository
        self._notifications = notifications
    
    def create_user(self, user_data):
        validated_data = self._validator.validate_create_data(user_data)
        user = self._repository.create(validated_data)
        self._notifications.send_welcome_email(user.email)
        return user
```

---

### 6. Performance and Efficiency

**The Problem**: AI prioritizes clarity over efficiency, often generating code with N+1 queries, excessive I/O, and memory waste that becomes problematic at scale.

#### Checklist

- [ ] **Database optimization**: Efficient queries
  - Eliminate N+1 queries (queries inside loops)
  - Use eager loading/joins where appropriate
  - Implement pagination for large result sets
  - Add necessary database indexes
  - Only select needed columns

- [ ] **Minimize I/O operations**: Batch operations when possible
  - Batch database inserts/updates
  - Bulk API requests instead of individual calls
  - Efficient file operations (streaming, buffering)

- [ ] **Memory efficiency**: Avoid unnecessary allocations
  - Don't create copies when references suffice
  - Use generators for large datasets
  - Release resources promptly

- [ ] **Async/concurrency**: Don't block on I/O
  - Use async/await for network calls
  - Don't perform synchronous operations in event loops
  - Implement proper concurrency controls

- [ ] **Algorithm efficiency**: Choose appropriate algorithms
  - Avoid O(n²) when O(n log n) or O(n) is possible
  - Consider time vs. space tradeoffs
  - Profile performance-critical code

#### Verification Steps

1. **Query Analysis**: Use EXPLAIN plans and query log analysis
2. **Load Testing**: Test with realistic data volumes
3. **Profiling**: Use profilers to identify bottlenecks
4. **Memory Profiling**: Check for leaks and excessive allocation

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - N+1 query problem
users = User.query.all()
for user in users:
    # This executes a query for EACH user!
    orders = Order.query.filter_by(user_id=user.id).all()
    process_orders(orders)

# ✅ DO THIS INSTEAD - Eager loading
# Single query with join
users_with_orders = db.session.query(User).options(
    joinedload(User.orders)
).all()

for user in users_with_orders:
    process_orders(user.orders)  # No additional queries
```

```javascript
// ❌ NEVER DO THIS - Sequential async operations
async function processUsers(userIds) {
    const results = [];
    for (const userId of userIds) {
        // Each iteration waits for the previous to complete!
        const user = await fetchUser(userId);
        results.push(user);
    }
    return results;
}

// ✅ DO THIS INSTEAD - Parallel async operations
async function processUsers(userIds) {
    // All requests fire in parallel
    const promises = userIds.map(userId => fetchUser(userId));
    return await Promise.all(promises);
}

// ✅ Or with concurrency limiting for large batches
async function processUsersBatched(userIds, batchSize = 10) {
    const results = [];
    for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(id => fetchUser(id))
        );
        results.push(...batchResults);
    }
    return results;
}
```

---

### 7. Dependencies and Versioning

**The Problem**: AI may suggest packages that don't exist, use loose version constraints, or create dependency bloat with deep transitive dependency trees.

#### Checklist

- [ ] **Verify dependencies**: Ensure packages exist and are legitimate
  - Check for typosquatting (slight misspellings of popular packages)
  - Verify package is actively maintained
  - Review package quality and security

- [ ] **Lock dependencies**: Use lockfiles for reproducible builds
  - `package-lock.json` (npm)
  - `yarn.lock` (yarn)
  - `poetry.lock` (Poetry)
  - `Cargo.lock` (Rust)
  - `go.sum` (Go)

- [ ] **Version constraints**: Use appropriate versioning
  - Pin exact versions for critical dependencies
  - Use caret (^) or tilde (~) ranges thoughtfully
  - Avoid wildcards (*) in production

- [ ] **Minimize dependencies**: Reduce attack surface
  - Question every new dependency
  - Prefer standard library solutions
  - Remove unused dependencies

- [ ] **Audit regularly**: Check for vulnerabilities
  - Run `npm audit`, `pip-audit`, `snyk test`
  - Automate with Dependabot or similar
  - Keep dependencies updated

#### Verification Steps

1. **Dependency Audit**: Use `npm audit`, `safety check`, `snyk test`
2. **License Check**: Verify license compatibility
3. **Update Check**: Identify outdated dependencies
4. **Bloat Analysis**: Check bundle size and dependency depth

#### Common AI Mistakes to Avoid

```json
// ❌ NEVER DO THIS - Loose versions and unchecked packages
{
  "dependencies": {
    "express": "*",
    "unknown-package": "^1.0.0",  // Might not exist!
    "left-pad": "1.0.0"  // Check if really needed
  }
}

// ✅ DO THIS INSTEAD - Specific versions with lockfile
{
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "^4.17.21"
  }
}
// Always include package-lock.json in version control
```

---

### 8. Modularity and Encapsulation

**The Problem**: AI generates code with unclear module boundaries, exposing internal details and creating fragile dependencies between modules.

#### Checklist

- [ ] **Clear module boundaries**: Changes in one module don't affect others unexpectedly
  - Define public APIs explicitly
  - Keep implementation details private
  - Use exports/imports thoughtfully

- [ ] **Encapsulation**: Hide internal state
  - Private fields/methods for internal use only
  - Getter/setter methods for controlled access
  - Immutable data where possible

- [ ] **Single responsibility**: One reason to change
  - Module focused on one domain concern
  - Cohesive functionality
  - Clear purpose and scope

- [ ] **Consistent interfaces**: Similar modules have similar interfaces
  - Standardize input/output patterns
  - Consistent error handling
  - Predictable behavior

#### Verification Steps

1. **API Review**: Verify public interfaces are clean and minimal
2. **Encapsulation Test**: Try to access internal state—should be difficult
3. **Cohesion Check**: Ensure module functions relate to single purpose

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - Poor encapsulation
class BankAccount:
    def __init__(self):
        self.balance = 0  # Public field, can be modified directly
        self.transactions = []  # Internal state exposed

account = BankAccount()
account.balance = 1000000  # Anyone can modify!

# ✅ DO THIS INSTEAD - Proper encapsulation
class BankAccount:
    def __init__(self):
        self._balance = 0  # Private field
        self._transactions = []  # Private
    
    @property
    def balance(self):
        """Read-only access to balance."""
        return self._balance
    
    def deposit(self, amount):
        """Deposit funds with validation."""
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")
        self._balance += amount
        self._transactions.append(Transaction('deposit', amount))
    
    def get_transaction_history(self):
        """Return copy of transaction history."""
        return self._transactions.copy()

account = BankAccount()
account.deposit(100)
print(account.balance)  # 100
# account.balance = 1000  # AttributeError: can't set attribute
```

---

### 9. Testing and Quality Assurance

**The Problem**: AI generates tests that only cover happy paths with weak assertions, providing false confidence while missing edge cases and error conditions.

#### Checklist

- [ ] **Comprehensive test coverage**: More than happy paths
  - Success cases
  - Error cases
  - Edge cases (null, empty, boundaries)
  - Invalid inputs

- [ ] **Strong assertions**: Verify specific outcomes
  - ❌ Weak: `expect(result).toBeDefined()`
  - ✅ Strong: `expect(result).toEqual(expectedValue)`
  - Verify exact values, not just existence

- [ ] **Test maintainability**: Tests should be clear and maintainable
  - Descriptive test names explaining scenario
  - Arrange-Act-Assert structure
  - Shared setup using beforeEach/afterEach
  - No test interdependencies

- [ ] **Test coverage goals**: Aim for high coverage with quality
  - Minimum 70% coverage (preferably 80%+)
  - Focus on critical paths
  - Don't test implementation details

- [ ] **Integration testing**: Test component interactions
  - API endpoint tests
  - Database integration tests
  - Third-party service mocks

#### Verification Steps

1. **Coverage Analysis**: Use coverage tools (nyc, coverage.py, cargo tarpaulin)
2. **Mutation Testing**: Verify test quality with mutation testing
3. **Test Review**: Ensure tests are meaningful, not just coverage padding

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - Weak tests with poor coverage
def test_calculate():
    result = calculate(5, 10)
    assert result is not None  # Too weak!

def test_process_data():
    data = {"name": "test"}
    result = process_data(data)
    assert result  # Just checks truthiness

# ✅ DO THIS INSTEAD - Comprehensive tests
import pytest

class TestOrderCalculator:
    """Test suite for order total calculation."""
    
    def test_calculate_simple_order(self):
        """Should correctly calculate order without discounts."""
        result = calculate_order_total(price=1000, quantity=5)
        assert result == 5000
    
    def test_calculate_with_small_discount(self):
        """Should apply 5% discount for orders 10-49 items."""
        result = calculate_order_total(price=100, quantity=10)
        assert result == 950  # 1000 - 5%
    
    def test_calculate_with_large_discount(self):
        """Should apply 10% discount for orders 50+ items."""
        result = calculate_order_total(price=100, quantity=50)
        assert result == 4500  # 5000 - 10%
    
    def test_calculate_zero_quantity(self):
        """Should return 0 for empty orders."""
        result = calculate_order_total(price=100, quantity=0)
        assert result == 0
    
    def test_calculate_negative_price_raises_error(self):
        """Should reject negative prices."""
        with pytest.raises(ValueError, match="Price cannot be negative"):
            calculate_order_total(price=-100, quantity=5)
    
    def test_calculate_large_numbers(self):
        """Should handle maximum integer values."""
        result = calculate_order_total(price=1000000, quantity=1000)
        assert result == 900000000  # With 10% discount
```

```javascript
// ✅ DO THIS INSTEAD - Well-structured JavaScript tests
describe('UserService', () => {
    describe('createUser', () => {
        it('should create user with valid data', async () => {
            const userData = {
                email: 'test@example.com',
                name: 'Test User'
            };
            
            const result = await userService.createUser(userData);
            
            expect(result).toMatchObject({
                id: expect.any(String),
                email: 'test@example.com',
                name: 'Test User',
                createdAt: expect.any(Date)
            });
        });
        
        it('should throw ValidationError for missing email', async () => {
            const userData = { name: 'Test User' };
            
            await expect(userService.createUser(userData))
                .rejects
                .toThrow(ValidationError);
        });
        
        it('should throw DuplicateError for existing email', async () => {
            const userData = { email: 'existing@example.com', name: 'Test' };
            
            await expect(userService.createUser(userData))
                .rejects
                .toThrow(DuplicateError);
        });
    });
});
```

---

### 10. Technical Debt Prevention

**The Problem**: AI generates "temporary" solutions that become permanent, accumulating technical debt through shortcuts, hacks, and quick fixes.

#### Checklist

- [ ] **No TODO without tickets**: Every TODO needs tracking
  - Create issue/ticket for each TODO
  - Include TODO with ticket reference in code
  - Schedule technical debt sprints

- [ ] **Avoid temporary hacks**: Shortcuts become permanent
  - Don't commit "quick fixes" that bypass architecture
  - Refactor instead of layering hacks
  - Document workarounds and plan proper solutions

- [ ] **Configuration over code**: Make behavior configurable
  - Magic numbers as named constants
  - Feature flags for toggling behavior
  - Environment-specific configuration

- [ ] **Version control discipline**: Clean commit history
  - Descriptive commit messages
  - Logical, atomic commits
  - No debugging code or secrets in commits

#### Verification Steps

1. **TODO Audit**: Find all TODOs and verify they have tickets
2. **Code Smell Detection**: Use linters to find anti-patterns
3. **Architecture Review**: Ensure shortcuts haven't compromised design

#### Common AI Mistakes to Avoid

```python
# ❌ NEVER DO THIS - Hardcoded magic numbers
def calculate_shipping(weight):
    if weight < 10:
        return 5.99  # Magic number!
    elif weight < 50:
        return 10.99  # Magic number!
    return 25.99  # Magic number!

# ✅ DO THIS INSTEAD - Named constants
SHIPPING_TIERS = [
    (10, 5.99),   # (max_weight_kg, cost_usd)
    (50, 10.99),
    (float('inf'), 25.99)
]

def calculate_shipping(weight_kg):
    """Calculate shipping cost based on weight tiers."""
    for max_weight, cost in SHIPPING_TIERS:
        if weight_kg < max_weight:
            return cost
    return SHIPPING_TIERS[-1][1]

# ❌ NEVER DO THIS - TODO without context
# TODO: Fix this later
def process_payment(data):
    pass  # Not implemented

# ✅ DO THIS INSTEAD - TODO with ticket reference
# TODO(PROJ-1234): Implement Stripe payment processing
# Currently returns mock success for development
# See: https://jira.company.com/browse/PROJ-1234
def process_payment(data):
    logger.warning("Using mock payment processor")
    return PaymentResult(success=True, transaction_id="mock-123")
```

---

## Implementation Workflow

### Phase 1: Code Generation
1. Review AI-generated code against this checklist
2. Refactor duplicated logic immediately
3. Add documentation for business context
4. Implement proper error handling

### Phase 2: Code Review
1. Verify naming conventions are followed
2. Check architecture and coupling
3. Ensure comprehensive test coverage
4. Validate performance considerations

### Phase 3: Refactoring
1. Address code smells and duplication
2. Improve documentation where lacking
3. Add missing error handling
4. Optimize performance bottlenecks

### Phase 4: Maintenance
1. Regular dependency audits
2. Technical debt tracking
3. Architecture evolution planning
4. Team knowledge sharing

## Tools and Automation

### Static Analysis
- **ESLint/Prettier** (JavaScript/TypeScript) - Style and quality
- **Flake8/Black/Pylint** (Python) - Style and complexity
- **SonarQube** - Comprehensive code quality analysis
- **CodeClimate** - Automated code review

### Complexity Analysis
- **ESLint complexity rules** - Cyclomatic complexity
- **Xenon** (Python) - Code complexity monitoring
- **CodeMetrics** (VS Code) - Complexity visualization

### Duplication Detection
- **jscpd** - Copy-paste detector for multiple languages
- **PMD CPD** - Copy-paste detector
- **SonarQube duplication detection**

### Architecture Analysis
- **madge** (JavaScript) - Dependency graph visualization
- **dependency-cruiser** - Dependency validation
- **pyreverse** (Python) - UML diagram generation

### Testing
- **Jest/Mocha** (JavaScript) - Testing frameworks
- **pytest** (Python) - Testing framework
- **Istanbul/nyc** - Code coverage
- **Stryker** - Mutation testing

## Priority Matrix for Code Review

When reviewing AI-generated code, prioritize in this order:

### Critical (Fix Immediately)
1. **Error handling gaps** - Cause production bugs
2. **Code duplication** - Technical debt multiplier
3. **Security vulnerabilities** - Already covered by security skill

### High Priority (Fix Before Merge)
4. **Insufficient documentation** - Blocks future maintenance
5. **Architecture violations** - Slows future changes
6. **Performance issues** - Scalability problems

### Medium Priority (Fix in Sprint)
7. **Naming inconsistencies** - Reduces readability
8. **Test coverage gaps** - Refactoring risk
9. **Dependency bloat** - Increases attack surface

### Low Priority (Address in Refactoring)
10. **Style inconsistencies** - Automated by linters
11. **Minor optimizations** - Profile first

## Red Flags Reference

| Problem | Red Flag |
|---------|----------|
| Duplication | Same 5+ lines in 2+ places |
| Documentation | No comments explaining "why" |
| Error Handling | Missing try/catch in risky operations |
| Edge Cases | Tests only with "happy path" values |
| Naming | Variables named `data`, `temp`, `result` |
| Coupling | Changing X breaks unrelated Y |
| Performance | Queries in loops, no pagination |
| Modularity | Module handles 5+ responsibilities |
| Testing | <70% code coverage |
| Dependencies | 3+ levels of transitive imports |

## Conclusion

AI is excellent for generating functional boilerplate quickly, but requires expert review for maintainability. Treat AI-generated code as junior developer code: fast and functional, but needs architect review.

**Key Principles:**
- Review for duplication, documentation, and error handling first
- Maintain consistent architecture and naming
- Test thoroughly including edge cases
- Minimize dependencies and technical debt
- Document business context and decisions

**Remember:** Code is read 10x more than it's written. Optimize for readability and maintainability over cleverness or brevity.

---

*This skill should be consulted for every code generation task, every code review, and every refactoring effort. Maintainability is a competitive advantage.*
