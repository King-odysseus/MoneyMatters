# MoneyMatters Project Status

## Current milestone

Identity foundation: convert the declared custom user into the final email-based
user model before the first migration.

## Completed

- Agreed to build a production-minded household finance application.
- Selected Django, Django REST Framework, React, and TypeScript.
- Selected the TijhaBooks midnight-navy and bronze UI direction.
- Removed the previous generated application while preserving Git history.
- Created the living development and learning guide.
- Verified Python 3.13.14 and pip 26.1.2 from Git Bash.
- Created and activated `.venv`; the `python` command resolves inside the project environment.
- Recreated the ignored `.venv` for the current Linux environment with Python 3.12.3.
- Installed and verified Django 5.2.16 and Django REST Framework 3.16.1.
- Generated the Django project in `backend` with the project package named `config`.
- Verified the project with `manage.py check`; Django reported no issues.
- Verified that the Django test runner loads; zero tests exist at this stage.
- Expanded the PRD to cover the full personal/shared finance product and all
  workbook-derived modules.
- Recorded the agreed navigation, dashboard, onboarding, and Universal Add flows
  in `docs/UX_SPEC.md`.
- Created and registered the learner-written `identity` Django app.
- Declared `identity.User` by inheriting from Django's `AbstractUser`.
- Configured `AUTH_USER_MODEL` before the first database migration.
- Verified the registered app and custom user declaration with `manage.py check`.

## Next action

Teach and implement email-based login on `identity.User`, including its user
manager and tests, before generating or applying the first migration.

## Important state

- The `identity` feature app exists and is registered.
- The custom user is currently a deliberate `AbstractUser` placeholder; username
  removal and email login are the next step.
- No database migration has been generated or applied.
- `docs/PRD.md` remains the living product requirements document.
- Every future command and instruction must be recorded in `docs/LEARNING_GUIDE.md` before or as it is introduced.

## Blockers

No active blocker. The legacy Windows Python Launcher conflict remains a machine-specific cleanup item and does not block development.
