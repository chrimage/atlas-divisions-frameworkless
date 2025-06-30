# Production Readiness TODO List

This document outlines tasks to be completed to ensure the Atlas Divisions website and contact system is fully production-hardened.

## High Priority

### 1. Implement Non-Blocking Email Notifications
- **File:** `src/features/contact/contact-routes.ts` (in `handleSubmit`)
- **Issue:** Currently, `await sendAdminNotification(...)` blocks the HTTP response to the user.
- **Action:**
    - Modify the main `fetch` handler in `src/index.ts` to accept `ctx: ExecutionContext`. The signature should be `async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>`.
    - Pass the `ctx` object down through the routing mechanism to `ContactRoutes.handleSubmit`.
    - Wrap the email sending call: `ctx.waitUntil(sendAdminNotification(env, submission))`.
    - Ensure `Env` type and `ExportedHandler` in `src/index.ts` are updated if necessary to reflect the `ctx` parameter.

### 2. Enhance Test Coverage
- **Files:** `test/` directory, potentially new spec files.
- **Issue:** Current test suite (`basic.spec.ts`) is likely insufficient for production confidence.
- **Action:**
    - **Authentication & Authorization:** Write tests to ensure the admin panel (`/admin`, `/admin/update`) is properly secured.
        - Verify Cloudflare Access integration (if enabled).
        - Verify basic email authentication (if enabled).
        - Test unauthorized access attempts.
    - **Input Validation:** Add tests for all form inputs, including edge cases and malicious inputs for:
        - Contact form (`/submit`)
        - Admin status update (`/admin/update`)
    - **Error Handling:** Test error responses for different failure scenarios (e.g., database errors, email sending failures if mockable).
    - **Feature Logic:** Test core logic in `contact-routes.ts` and `website-routes.ts`.
    - **Database Utilities:** Consider tests for `src/utils/database.ts` functions if not covered by integration tests.

## Medium Priority

### 3. Refine Configuration Validation
- **File:** `src/config/index.ts` (in `validateConfig`)
- **Issue:** The company name validation might produce warnings in dev/staging if names like "Atlas Divisions (DEV)" are used.
- **Action:**
    - Adjust the condition `config.company.name.includes("(DEV)") || config.company.name.includes("(STAGING)")` to only trigger a warning or error if `env?.ENVIRONMENT === 'production'`.
    - Ensure all configuration warnings/errors are clear about the environment they apply to.

### 4. Perform Dependency Audit
- **File:** `package.json`
- **Issue:** Dependencies might be outdated or have known vulnerabilities.
- **Action:**
    - Run `npm audit` to identify vulnerabilities and review them.
    - Update critical dependencies where safe and necessary.
    - Verify that `three.js` (currently v0.177.0) is the latest stable or a version without known issues relevant to its usage here.

### 5. Review and Enhance Logging
- **Files:** Throughout `src/`
- **Issue:** Logging could be more structured and detailed for production monitoring.
- **Action:**
    - Implement consistent log levels (e.g., INFO, WARN, ERROR).
    - Ensure critical errors (e.g., database failures, unexpected exceptions in route handlers) are logged with sufficient detail for debugging.
    - Avoid logging sensitive information.

## Low Priority

### 6. Explicit Transaction Handling (If Needed)
- **File:** `src/utils/database.ts`
- **Issue:** Currently, database operations are simple and likely don't require transactions.
- **Action:**
    - Review if any future multi-step database operations might require explicit transaction management to ensure data consistency. For now, this is likely not an immediate issue.

### 7. Verify `getSessionId` Robustness for CSRF
- **File:** `src/utils/csrf.ts` (used in `src/features/contact/contact-routes.ts`)
- **Issue:** Ensure `getSessionId` is robust for CSRF token generation, especially if not using Cloudflare Access (where `user.email` might be the primary identifier).
- **Action:**
    - Confirm that `user.email || 'anonymous_admin_session'` provides a sufficiently unique and stable session identifier for CSRF purposes when basic auth is used.

## Documentation & Process

### 8. Follow Deployment & Security Checklists
- **Files:** `DEPLOYMENT_CHECKLIST.md`, `SECURITY.md`
- **Issue:** These documents are comprehensive but must be meticulously followed.
- **Action:**
    - Ensure every relevant item in `DEPLOYMENT_CHECKLIST.md` is completed before and after deployment.
    - Regularly review practices against `SECURITY.md`.

By addressing these points, the project will be significantly more robust and ready for a production environment.
