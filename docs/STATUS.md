# MoneyMatters Project Status

## Current milestone

Core models: create the `accounts` app with Household and UserProfile models, then set up household-scoped middleware.

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
- Created the `accounts` Django app and implemented the `Household` model.
- Added `UserProfile` relationships, descriptive financial-role choices, and an optional avatar field.
- Installed Pillow 12.3.0 and recorded the backend dependencies in `requirements.txt`.
- Created `docs/TEACH.md` as the mandatory seven-step, learner-led teaching contract.

## Next action

Teach and register `accounts` in `INSTALLED_APPS`, then run Django's system check before proposing migrations or admin registration.

## Important state

- The `accounts` model code exists, but the app is not yet registered in `INSTALLED_APPS` and no accounts migration has been created or applied.
- `docs/PRD.md` remains the living product requirements document.
- `docs/TEACH.md` is the authoritative teaching contract. Its seven-step block method and learner-owned terminal practice are mandatory.
- Every future command and instruction must be recorded in `docs/LEARNING_GUIDE.md` before or as it is introduced.

## Blockers

None.
