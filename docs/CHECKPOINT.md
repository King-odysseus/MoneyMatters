# Money Matters — Development Checkpoint

Date: 13 July 2026

## Current position

The product-planning and Django project-foundation checkpoint is complete. The
learner has started the first Django feature app.

The repository is intentionally learner-led: the learner types important commands
and writes focused application code. AI explains concepts, breaks work into small
steps, reviews code and output, provides hints, and diagnoses errors. AI implements
application code only when explicitly requested or when the learner is blocked.

## Completed

- Reset the earlier generated project while preserving Git history.
- Selected Django, Django REST Framework, React, TypeScript, and PostgreSQL.
- Created and verified the local Python virtual environment.
- Installed Django 5.2.16 and Django REST Framework 3.16.1.
- Generated the Django project in `backend` with configuration package `config`.
- Verified `manage.py check` and the empty Django test runner.
- Expanded `docs/PRD.md` to describe the complete personal/shared finance product.
- Created `docs/UX_SPEC.md` for navigation, dashboard, onboarding, and Universal
  Add behaviour.
- Confirmed that the generated project currently uses SQLite, exposes Django Admin
  at `/admin/`, and uses UTC as its server timezone.
- Created the `identity` app and inspected every generated file.
- Registered `identity.apps.IdentityConfig` in `INSTALLED_APPS`.
- Declared the custom `identity.User` model using `AbstractUser`.
- Configured `AUTH_USER_MODEL = 'identity.User'` before any migration.
- Ran `manage.py check`; Django reported no issues.

## Important decisions

- Money Matters supports either one user or multiple workspace members.
- A personal workspace can become shared later without migrating financial data.
- Users can create their own accounts, pots, categories, recurring commitments,
  portfolios, projects, and other configurable records.
- Actual expenses, committed savings, transfers, unallocated money, and pot
  balances are distinct concepts.
- Accounts represent where money exists; pots represent reserved money; goals
  represent desired outcomes.
- Historical recurring amounts and FX conversion rates must remain reproducible.
- Business finances remain isolated from household reporting.
- Every workbook-derived module remains within the full product scope.

## Repository state at checkpoint

The latest published commit is:

```text
a64a7df Expand product and UX specifications
```

That commit preceded the learner-written identity work recorded by this checkpoint.
No database migration has been generated or applied.

## Next learner step

Continue the custom user lesson. The current `User(AbstractUser)` declaration is a
safe placeholder that still contains Django's username field. The learner will
next implement email-based login and a compatible user manager, then write and run
focused tests.

Do not run `makemigrations` or `migrate` until the email-based user design has been
completed and verified. Changing Django's user model after migrations and foreign
keys exist is difficult.

## Continuity documents

- `docs/PRD.md`: complete product requirements
- `docs/UX_SPEC.md`: agreed user experience and interaction patterns
- `docs/LEARNING_GUIDE.md`: commands, explanations, and verification history
- `docs/STATUS.md`: current milestone and immediate next action
- `docs/CHECKPOINT.md`: concise handoff state for resuming development

---

End of checkpoint
