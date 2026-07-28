# MoneyMatters Project Status

## Current milestone

Household middleware and authentication: build the household-scoping middleware, create auth views (sign-up, login, logout), and set up the invite flow.

## Completed

- Agreed to build a production-minded household finance application.
- Selected Django, Django REST Framework, React, and TypeScript.
- Selected the TijhaBooks midnight-navy and bronze UI direction.
- Removed the previous generated application while preserving Git history.
- Created the living development and learning guide.
- Verified Python 3.13.14 and pip 26.1.2 from Git Bash.
- Created and activated `.venv`; the `python` command resolves inside the project environment.
- Installed Django 5.2.16 and Django REST Framework 3.16.1 (`~=` bounded).
- Ran `django-admin startproject config` to scaffold the project.
- Created the `accounts` app with `Household` and `UserProfile` models.
- Ran `makemigrations` and `migrate` — tables created.
- Registered models in Django admin.

## Next action

Build the household-scoping middleware so that `request.household` is available on every authenticated request. Then create the auth views: sign-up with household creation, login, logout, and invite acceptance.

## Important state

- The `accounts` app is the first custom app in the project.
- `docs/PRD.md` remains the living product requirements document.
- Every future command and instruction must be recorded in `docs/LEARNING_GUIDE.md` before or as it is introduced.

## Blockers

None.
