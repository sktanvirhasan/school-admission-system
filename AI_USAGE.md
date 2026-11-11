# AI Usage & Collaboration Report

This document details the usage of AI assistance during the design, development, and testing of the School Admission System, in compliance with the recruitment assignment guidelines.

---

## 1. Tools & Scope of Use

- **Primary Tool:** claude opus 4.6, Gemini 3.8
- **Primary Areas of Use:**
  - Initial scaffolding for .NET 10 Web API and React/Vite TypeScript project structure.
  - Generating standard Entity Framework Core migration configurations.
  - Writing boilerplate test setups (Testcontainers PostgreSQL runner, Vitest component harness).
  - Draft implementations of repetitive UI components and Tailwind layout styles.

---

## 2. Key Mistakes Made by the AI & How They Were Caught

Throughout the pair-programming process, I acted as the technical lead and code reviewer. Several critical architectural, syntactic, and testing errors made by the AI were caught and corrected by me:

### Mistake 1: Hardcoding Localized Strings in Component & Test Code
- **The AI Error:** During the UI build and frontend test implementation, the AI directly hardcoded Bengali and English string literals into JSX and test assertions (e.g., `'মিনিট'`, `'সেকেন্ড'` in `ApplicationView.tsx`, `'আসন বরাদ্দ'` in `ClassList.tsx`, `'২০২৬'` in `Navbar.tsx`, and button labels in `App.test.tsx`).
- **How It Was Caught:** During manual code inspection, I noticed hardcoded strings outside `i18n/bn.ts` and `i18n/en.ts`. This violated the project's bilingual architecture and prevented dynamic language switching.
- **The Correction:** I instructed the AI to eliminate all hardcoded user-facing strings, expand the dictionary keys in `bn.ts` and `en.ts`, and run an automated AST/regex scan ensuring zero non-ASCII literals remain outside the `i18n` directory.

### Mistake 2: Concurrency Claim in Test Logs
- **The AI Error:** Claude told me that the 5-seat / 50-request concurrency result (5 created, 45 conflicts) could be seen in the test logs.
- **How It Was Caught:** I asked where that came from and inspected the logs, finding that the logs only show SQL queries, not status codes.
- **The Correction:** I verified that the real evidence is the assertions inside the test (`HoldTests.cs`), which passed.

### Mistake 3: PowerShell Quoting with curl.exe Commands
- **The AI Error:** Several suggested `curl.exe` commands with inline JSON failed because of quoting rules in Windows PowerShell.
- **How It Was Caught:** Running the commands directly in PowerShell resulted in command-line argument parsing errors.
- **The Correction:** I replaced them with `Invoke-RestMethod` or a JSON file body.

### Mistake 4: .NET Version Mismatch
- **The AI Error:** The plan and setup targeted .NET 8, but my machine has .NET 10.
- **How It Was Caught:** Building and restoring the project against the installed .NET SDK surfaced version incompatibilities.
- **The Correction:** I updated package versions and Docker base images to target .NET 10.

### Mistake 5: Wrong Expectation in Docker Volume Data
- **The AI Error:** Claude said `GET /classes` would return an empty list after the first Docker run.
- **How It Was Caught:** It did not return an empty list because the Docker volume still held data from earlier local runs.
- **The Correction:** This turned out to be a useful check that data persists across restarts, and I used `docker compose down -v` to clear state when verifying from scratch.

### Mistake 6: Database Credentials Mismatch in Compose Healthcheck
- **The AI Error:** I changed the database user to `admin`, but the compose healthcheck still used `app`.
- **How It Was Caught:** The container logs showed `role "app" does not exist` repeating every 3 seconds.
- **The Correction:** I found the mismatch from the logs and updated the healthcheck command in `docker-compose.yml` to `admin`.

### Mistake 7: Instructions Without Folder Context and Numbering Error
- **The AI Error:** Some commands were given without saying which folder to run them in, and one step number was mislabelled.
- **How It Was Caught:** I noticed the missing directory context and asked for clarification each time.
- **The Correction:** I verified the correct execution directories and step sequences before running the commands.

### Mistake 8: Windows CRLF Line Endings in Alpine Entrypoint Script
- **The AI Error:** When creating `frontend/nginx/40-config.sh` on Windows, standard file creation utilities produced CRLF (`\r\n`) line endings.
- **How It Was Caught:** I recognized that Alpine Linux containers fail when running shell scripts containing carriage returns (`/bin/sh: \r: not found`).
- **The Correction:** I directed an explicit byte-level UTF-8 write with pure LF (`\n`) line endings, guaranteeing seamless Docker container execution on both Windows and Linux hosts.

### Mistake 9: Vitest Query Collisions & Unescaped Regex in Test Matchers
- **The AI Error:** In frontend unit tests (`App.test.tsx`), the AI used `screen.getByText(studentId)` which threw multiple element errors because the student ID was rendered in both the Navbar and the Identity Card. Furthermore, regex matchers failed on strings containing parentheses like `pay_fee_btn` (`'ভর্তি ফি দিন (Confirm Admission)'`).
- **How It Was Caught:** Automated execution via `npm test` failed with element collision and regex syntax errors.
- **The Correction:** I diagnosed the test failures, instructed the AI to use disambiguated queries (`screen.getAllByText(...).length >= 1`), and replaced unescaped regex patterns with direct dictionary string comparisons.

### Mistake 10: Concurrency Architecture & Database Locking Strategy
- **The AI Error:** The AI initially considered an in-memory lock (`SemaphoreSlim` or `lock (object)`) for controlling seat reservations.
- **How It Was Caught:** I evaluated the bonus specification requirement: *"What happens if two backend processes run against the same database?"* An in-memory lock only protects requests within a single process and fails completely in a distributed or multi-container environment.
- **The Correction:** I directed the implementation of PostgreSQL row-level locks (`SELECT ... FROM "Classes" WHERE "Id" = @id FOR UPDATE`) inside an explicit database transaction. This ensures strict serializability directly at the database layer regardless of the number of backend instances.

### Mistake 11: Role Distinction in a "No Login" Architecture
- **The AI Error:** The AI initially placed the class creation form on the same plane as the student application form without considering accidental guardian interaction.
- **How It Was Caught:** During end-to-end UI testing, I recognized that while the spec prohibits a login system, administrative operations must be visually and functionally separated from the guardian flow.
- **The Correction:** I restructured the navigation into a dedicated "School Admin" tab with distinct styling and guidance, keeping the evaluator's test barrier-free while maintaining clean UX separation.

### Mistake 12: Inaccurate Dependency Version in Tech Stack Documentation
- **The AI Error:** The AI mistakenly documented the frontend as `React 19` in the `README.md` tech stack table.
- **How It Was Caught:** I cross-referenced `frontend/package.json` where `react` is explicitly pinned to `^18.3.1` (complying strictly with the assignment's `React 18+` requirement) and caught the inaccuracy.
- **The Correction:** I corrected the version in `README.md` to `React 18 (18.3.1)` to ensure 100% fidelity between documentation and codebase dependencies.

---

## 3. Engineering Reflections

AI proved to be an effective accelerator for boilerplate code generation, Docker configuration syntax, and repetitive test setup. However, it required constant technical vigilance, architectural direction, and rigorous manual verification. 

Critical aspects—such as database-level concurrency guarantees, clean bilingual abstraction, cross-platform container portability, and edge-case error handling—depended entirely on my engineering judgment and oversight.
