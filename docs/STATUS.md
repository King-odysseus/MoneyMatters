# MoneyMatters Project Status

## Current milestone

Foundation setup: learn the generated Django configuration and begin the first
feature app.

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

## Next action

Review `config/settings.py` and `config/urls.py` together, then let the learner
create the first focused identity/workspace app one small step at a time.

## Important state

- No feature app or database migration has been created yet.
- The working tree contains only the requested PRD, UX, learning, and status
  documentation updates.
- `docs/PRD.md` remains the living product requirements document.
- Every future command and instruction must be recorded in `docs/LEARNING_GUIDE.md` before or as it is introduced.

## Blockers

No active blocker. The legacy Windows Python Launcher conflict remains a machine-specific cleanup item and does not block development.
