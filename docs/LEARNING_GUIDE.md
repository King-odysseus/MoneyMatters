# MoneyMatters Development and Learning Guide

This is the permanent step-by-step record for building MoneyMatters with Django and React. It is written so the setup and engineering decisions can be reused in future projects.

For every development step, record:

- **Goal:** the outcome we want.
- **What:** what the command or code does.
- **Why:** why the project needs it.
- **When:** when this technique is useful.
- **Command:** the exact command to run.
- **Expected result:** how to know it worked.
- **Common problems:** likely errors and how to investigate them.
- **Verification:** the check performed before continuing.

## Teaching agreement

The authoritative teaching method is [TEACH.md](TEACH.md). Every agent must read it before teaching, proposing code, or asking the learner to run a command. Its section **The seven required teaching steps** lists the exact seven checks that must be completed for every meaningful code block.

This learning guide is the chronological record: it keeps the seven-step explanations for individual code blocks, exact commands, learner modifications, answers, errors, and verification results. `TEACH.md` defines how those lessons must be taught, including the mandatory seven-step block method and learner-owned terminal practice.

## Project foundation

- Backend: Django and Django REST Framework
- Frontend: React with TypeScript
- Product model: users collaborate inside isolated households
- Financial source of truth: an auditable transaction ledger
- UI direction: the TijhaBooks midnight-navy and bronze design system
- Product requirements: `docs/PRD.md`

## Step 0: Clean restart

The previous generated backend, frontend, and virtual environment were removed. Git history was retained so earlier work remains recoverable. The PRD was retained as a living product document.

This clean restart has not yet been committed or pushed.

## Step 1: Create the Python virtual environment

### Prerequisite discovered on this computer

The first attempt produced:

```text
py: The term 'py' is not recognized
```

Inspection showed that `python.exe` and `python3.exe` point only to Microsoft Store aliases with version `0.0.0.0`. This means a working Python installation is not currently available from the terminal.

The activation command also failed because `.venv` was never created. Activation cannot happen until the environment-creation command succeeds.

Typing a quoted path such as:

```powershell
"C:\path\to\activate"
```

only creates and displays a PowerShell string. It does not run the referenced script. PowerShell executes a relative script using a path beginning with `.\`, as shown below.

### Step 1A: Install and verify Python

On this computer, the official **Python Install Manager** was installed. The manager is not itself the Python runtime; it downloads and manages Python runtimes.

Close and reopen PowerShell after installing the manager. First run its configuration check:

```powershell
py install --configure
```

Then install the current default Python runtime:

```powershell
py install
```

The manager may ask for confirmation or offer to add its commands directory to the user `PATH`. Read the prompt and allow the recommended per-user configuration. Do not install a prerelease or a free-threaded/experimental runtime for this project.

#### Legacy launcher conflict discovered

Running `py install --configure` produced a warning that the legacy `py.exe` command was active. It also revealed an existing Python 3.13 interpreter at:

```text
C:\Users\Mega-Mind\AppData\Local\Programs\Python\Python313\python.exe
```

Therefore, do not run `py install` yet and do not reinstall Python. First verify the existing runtime:

```powershell
py --version
py -m pip --version
py -c "import sys; print(sys.executable)"
```

If these commands report Python 3.13, a working runtime already exists and can create the project environment. The legacy launcher conflict affects the Install Manager's management commands, but it does not necessarily prevent ordinary Python execution.

The conflict can later be resolved from Windows **Installed apps** by removing the entry named **Python Launcher**, then reopening PowerShell. Do not remove **Python 3.13** or **Python Install Manager**. This cleanup is not required before creating the virtual environment if the three verification commands succeed.

#### Git Bash versus PowerShell

The next attempt was made in Git Bash (`MINGW64`) rather than PowerShell. Shells interpret commands and paths differently:

- PowerShell normally uses the Windows `py` launcher and `.\.venv\Scripts\Activate.ps1`.
- Git Bash may not expose the `py` launcher in its `PATH`.
- Git Bash activates a virtual environment with `source .venv/Scripts/activate`.
- `venv` and `.venv` are different directory names. This project standardizes on `.venv`.

Before creating the environment from Git Bash, verify the known Python 3.13 executable directly:

```bash
"/c/Users/Mega-Mind/AppData/Local/Programs/Python/Python313/python.exe" --version
"/c/Users/Mega-Mind/AppData/Local/Programs/Python/Python313/python.exe" -m pip --version
```

If both commands succeed, create and activate the environment from the repository root:

```bash
"/c/Users/Mega-Mind/AppData/Local/Programs/Python/Python313/python.exe" -m venv .venv
source .venv/Scripts/activate
python --version
```

Verification completed successfully on this machine:

```text
Python 3.13.14
pip 26.1.2 (Python 3.13)
```

This confirms that the base interpreter and its package installer work. The next checkpoint is to create `.venv`, activate it, and verify that `python` now resolves to the project-specific interpreter.

The quotes are necessary because other project paths may contain spaces. Here the quoted value is immediately used as a command in Bash; this differs from PowerShell, where a quoted executable path requires the call operator `&`.

Then run:

```powershell
py --version
py -m pip --version
where.exe python
where.exe py
```

Expected results:

- `py --version` displays a real Python 3 version.
- `py -m pip --version` displays the installed `pip` version and location.
- `where.exe py` finds the Python Install Manager command.
- `where.exe python` may resolve through the manager's global alias; the version commands above are the decisive checks.

If `python` still opens the Microsoft Store or points only to `WindowsApps`, stop and inspect the installation/PATH rather than continuing.

### Goal

Create an isolated place for MoneyMatters' Python dependencies.

### What

A virtual environment is a project-specific Python installation area. Packages installed inside it do not become global dependencies.

### Why

Different Python projects may require different versions of Django or other packages. Isolation makes installations repeatable and prevents one project from breaking another.

### When

Create a virtual environment when starting almost any Python application and recreate it when setting up the repository on another computer.

### Commands

After Step 1A succeeds, run these commands from the MoneyMatters repository root. The Python Install Manager provides the `py` command:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python --version
```

Command meanings:

- `-m venv` runs Python's built-in virtual-environment module.
- `.venv` is the environment directory we are creating.
- `Activate.ps1` adjusts the current PowerShell session to use that environment.
- `python --version` verifies which Python executable is active.

### Expected result

The PowerShell prompt normally starts with `(.venv)`, and `python --version` prints the installed Python version.

### Common problems

If PowerShell blocks `Activate.ps1`, do not disable security globally. Record the exact error and choose a narrowly scoped solution.

The `.venv` directory must not be committed to Git. Each developer creates their own environment from the recorded dependency file.

## Step 2: Install the initial backend frameworks

This step should be performed only after Step 1 is verified.

Step 1 was verified successfully: Git Bash resolved `python` to `.venv/Scripts/python`, and both Python and pip reported locations inside the project environment.

### Version decision

Use the Django 5.2 long-term-support release line and Django REST Framework 3.16 release line:

```bash
python -m pip install "Django~=5.2.0" "djangorestframework~=3.16.0"
```

`~=` is the compatible-release operator. `Django~=5.2.0` permits later bug-fix/security releases in the 5.2 series but will not silently upgrade the project to Django 5.3 or 6.0. This balances reproducibility with receiving maintenance fixes.

Django 5.2 is chosen because it is an LTS release supported through April 2028 and officially supports Python 3.13. Django REST Framework 3.16 officially supports Django 5.2 and Python 3.13.

After installation, verify the actual resolved versions:

```bash
python -m django --version
python -c "import rest_framework; print(rest_framework.VERSION)"
python -m pip list
```

Expected result:

- Django reports a `5.2.x` version.
- Django REST Framework reports a `3.16.x` version.
- `pip list` shows both packages inside the active `.venv`.

```powershell
python -m pip install Django djangorestframework
```

The unbounded command above is retained as a general example, but MoneyMatters uses the bounded Git Bash command for controlled version upgrades.

- `python -m pip` runs `pip` using the currently active Python interpreter. This is safer than assuming a standalone `pip` command points to the correct environment.
- `Django` supplies the web framework, ORM, migrations, authentication foundations, administration site, routing, and security utilities.
- `djangorestframework` helps us build JSON APIs consumed by React.

Do not create the Django project until installation output and installed versions have been checked.

## Maintaining continuity across chats

The repository—not chat memory—should be the durable source of truth. Keep these files current:

- `docs/PRD.md`: what the product must do.
- `docs/TEACH.md`: the mandatory teaching method, seven-step block workflow, and learner-owned terminal practice.
- `docs/LEARNING_GUIDE.md`: commands, explanations, and lessons.
- `docs/STATUS.md`: current milestone, completed work, next action, decisions, and blockers.
- Git commits: exact, recoverable code checkpoints.

At the end of a work session, update `docs/STATUS.md` and commit the coherent work. In a new chat, open the same MoneyMatters workspace and ask the assistant to read the teaching contract, PRD, learning guide, status file, and recent Git history before continuing.

A reusable new-chat prompt is:

```text
Continue the MoneyMatters project. First read docs/PRD.md,
docs/TEACH.md, docs/LEARNING_GUIDE.md, docs/STATUS.md, and the recent Git history.
Tell me the current milestone and next step before changing anything.
Keep recording every command and instruction in docs/LEARNING_GUIDE.md.
```

Use the same existing thread when it is convenient, but start a new one at a clean milestone when the conversation becomes unwieldy. Do not repeatedly paste the entire history; point the new chat to the repository documents. Keep steps focused, summarize decisions in files, and commit regularly. This reduces dependence on conversation context while making the project understandable to both you and future collaborators.

### Step 2 verification (completed 28 July 2026)

The bounded installation was run from Git Bash:

```bash
source .venv/Scripts/activate
python -m pip install "Django~=5.2.0" "djangorestframework~=3.16.0"
```

Verification outputs:

```text
(.venv)
$ python -m django --version
5.2.16

$ python -c "import rest_framework; print(rest_framework.VERSION)"
3.16.1

$ python -m pip list
Package             Version
------------------- -------
asgiref             3.12.1
Django              5.2.16
djangorestframework 3.16.1
pip                 26.1.2
sqlparse            0.5.5
tzdata              2026.3
```

All three checks passed. The project scaffold was created:

```bash
django-admin startproject config .
```

This created `manage.py` and the `config/` package (settings, urls, wsgi, asgi) at the repository root. The trailing dot places files in the current directory rather than nesting them inside a second `config/` directory.

## Step 3: Create the accounts app and core models

### Goal

Create the first Django app (`accounts`) containing the `Household` and `UserProfile` models — the multi-tenancy foundation that every other module depends on.

### What

A Django app is a self-contained Python package with models, views, and URL configuration. `accounts` will hold:

- `Household`: the top-level container for all financial data. Every user belongs to exactly one household, and every model inherits a `household` foreign key for data isolation.
- `UserProfile`: extends Django's built-in `User` model with a `household` foreign key, a descriptive role label (Primary User, Secondary User, Joint), and an optional avatar.

### Why

Authentication and household membership are the first P0 module in the PRD. Without a user model linked to a household, no other module can scope its queries correctly. Building this first establishes the multi-tenancy pattern that every subsequent viewset will follow.

### When

Create `accounts` immediately after the project scaffold exists, before any financial models.

### Commands

```powershell
.\.venv\Scripts\python.exe manage.py startapp accounts
```

Then register `accounts` in `config/settings.py` under `INSTALLED_APPS`.

### Expected result

A new `accounts/` directory with `models.py`, `views.py`, `admin.py`, and other app scaffolding files. After adding models and running `makemigrations` + `migrate`, the `accounts_household` and `accounts_userprofile` tables should appear in the database.

### Common problems

- Forgetting to add the app to `INSTALLED_APPS` means Django will not detect the models or run their migrations.
- The `UserProfile` model should use a `OneToOneField` to Django's `User`, not subclass it. Subclassing locks you into a specific auth model early; `OneToOneField` keeps the door open.
## Step 3: Create the accounts app and core models

### Goal

Create the first Django app (`accounts`) containing the `Household` and `UserProfile` models — the multi-tenancy foundation that every other module depends on.

### What

A Django app is a self-contained Python package with models, views, and URL configuration. `accounts` will hold:

- `Household`: the top-level container for all financial data. Every user belongs to exactly one household, and every model inherits a `household` foreign key for data isolation.
- `UserProfile`: extends Django`'`s built-in `User` model with a `household` foreign key, a descriptive role label (Primary User, Secondary User, Joint), and an optional avatar.

### Why

Authentication and household membership are the first P0 module in the PRD. Without a user model linked to a household, no other module can scope its queries correctly. Building this first establishes the multi-tenancy pattern that every subsequent viewset will follow.

### When

Create `accounts` immediately after the project scaffold exists, before any financial models.

---

### Step 3A: Start the accounts app

**Command:**

```powershell
python manage.py startapp accounts
```

**What this does:** `startapp` is a Django management command that generates a directory with boilerplate files: `models.py`, `views.py`, `admin.py`, `apps.py`, `tests.py`, and a `migrations/` folder. It is the standard way to create a new app inside a Django project.

**Analogy:** If the Django project (`config`) is the building, `startapp` is the command that rooms off a new wing. The wing comes with empty walls (the boilerplate files), and you decide what goes in them.

**Why not just make the folder by hand?** You could, but `startapp` also creates `apps.py` with a properly named `AppConfig` class — this is what Django uses to discover and register the app. Getting the naming right by hand is fiddly and error-prone.

---

### Step 3B: Write the models

The code goes in `accounts/models.py`. Replace the entire file with the following, then we will walk through every line.

```python
from django.conf import settings
from django.db import models


class Household(models.Model):
    """Top-level container for all financial data. Every model in the project
    carries a foreign key back to this table so data stays isolated per household."""

    name = models.CharField(max_length=100)
    base_currency = models.CharField(max_length=3, default="GBP")
    fiscal_year_start_month = models.PositiveSmallIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    """Extends Django`'`s built-in User model with household membership and a
    descriptive role label. Linked via OneToOneField, not subclassing."""

    class Role(models.TextChoices):
        PRIMARY = "PRIMARY", "Primary User"
        SECONDARY = "SECONDARY", "Secondary User"
        JOINT = "JOINT", "Joint"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    household = models.ForeignKey(
        Household, on_delete=models.CASCADE, related_name="members"
    )
    descriptive_role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.SECONDARY
    )
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    class Meta:
        ordering = ["user__username"]

    def __str__(self):
        return f"{self.user.username} ({self.get_descriptive_role_display()})"
```

---

### Household model — line by line

```python
from django.conf import settings
from django.db import models
```

`settings` gives us access to `AUTH_USER_MODEL` — the configured user model Django is using. We import it here rather than hardcoding `auth.User` because the project might swap user models later. `models` is Django`'`s ORM module; every field type (`CharField`, `ForeignKey`, etc.) lives there.

```python
class Household(models.Model):
```

Every Django model inherits from `models.Model`. Under the hood, this gives the class a metaclass that scans the attributes, maps Python types to SQL column types, and generates the `CREATE TABLE` statement for you.

```python
name = models.CharField(max_length=100)
```

A short text column for the household name. `max_length=100` is required for `CharField` — Django needs to know the column size to generate the correct `VARCHAR` type.

```python
base_currency = models.CharField(max_length=3, default="GBP")
```

The ISO 4217 currency code for the household`'`s default currency. Three characters covers all standard currency codes (GBP, USD, NGN, KES, EUR). A `default` means new households start as GBP unless the user picks something else.

```python
fiscal_year_start_month = models.PositiveSmallIntegerField(default=1)
```

Which month the household`'`s fiscal year starts. Default is 1 (January). `PositiveSmallIntegerField` stores a number from 0 to 32,767 — more than enough for months 1-12, and it takes less space than a regular integer.

```python
created_at = models.DateTimeField(auto_now_add=True)
```

A timestamp set automatically when the row is first created. `auto_now_add=True` means Django sets this once on `INSERT` and never touches it again. This is the analogue of the "Created" column you`'`d add to a spreadsheet — automatic, forgettable, and useful when debugging.

```python
class Meta:
    ordering = ["name"]
```

The `Meta` inner class holds model-level configuration that is not a database field. `ordering = ["name"]` tells Django to sort query results alphabetically by household name by default. Without it, the database returns rows in whatever physical order it finds them.

```python
def __str__(self):
    return self.name
```

Controls how the object appears in the Django admin, shell, and debug output. Without `__str__`, you would see `Household object (1)` instead of an actual name — unreadable and frustrating.

---

### UserProfile model — line by line

```python
class Role(models.TextChoices):
    PRIMARY = "PRIMARY", "Primary User"
    SECONDARY = "SECONDARY", "Secondary User"
    JOINT = "JOINT", "Joint"
```

A `TextChoices` class is Django`'`s modern way to define a fixed set of allowed values for a field. Each entry is `(DB_VALUE, HUMAN_LABEL)`. The database stores `"PRIMARY"`; the admin shows `"Primary User"`. `TextChoices` also auto-generates helper methods — for example `UserProfile.Role.choices` returns the list of tuples Django fields expect.

**Important:** These roles are descriptive labels for display and transaction attribution. They do not govern access control. Permission roles (Admin, Member, Viewer) are a separate system using Django`'`s built-in permissions, added later.

```python
user = models.OneToOneField(
    settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
)
```

This is the link to Django`'`s built-in `User` model. Breaking it down:

- `OneToOneField` means each `User` gets exactly one `UserProfile` and each `UserProfile` points to exactly one `User`. Under the hood, Django creates a `UNIQUE` constraint on the `user_id` column.
- `settings.AUTH_USER_MODEL` resolves to whatever user model the project is configured to use (by default `auth.User`). We never hardcode `User` because a future migration to a custom user model would break every import.
- `on_delete=models.CASCADE` means if the `User` is deleted, the `UserProfile` is deleted too. A profile without a user is meaningless.
- `related_name="profile"` lets you access the profile from the user side: `user.profile` instead of the default `user.userprofile`. More readable, and it matches the mental model: a user *has a* profile.

**Analogy:** Think of Django`'`s `User` as a passport — it proves who you are. `UserProfile` is the visa page stamped inside it — it adds details about where you belong (your household) without changing the passport itself.

```python
household = models.ForeignKey(
    Household, on_delete=models.CASCADE, related_name="members"
)
```

- `ForeignKey` creates a many-to-one relationship: many `UserProfile` rows can point to the same `Household`.
- `on_delete=models.CASCADE` means deleting a `Household` deletes all its members`'` profiles. This is intentional — a household`'`s data is meaningless without the household.
- `related_name="members"` lets you call `household.members.all()` to get every user in that household.

```python
descriptive_role = models.CharField(
    max_length=20, choices=Role.choices, default=Role.SECONDARY
)
```

A `CharField` with `choices` renders as a dropdown in the Django admin and forms. The database stores the short code (`"PRIMARY"`), but anywhere you call `.get_descriptive_role_display()` you get the human label (`"Primary User"`). Django auto-generates that method for any field with `choices`.

```python
avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
```

An optional profile picture. `upload_to="avatars/"` tells Django to store uploaded files in `MEDIA_ROOT/avatars/`. `blank=True` means the field is optional in forms; `null=True` means the database column allows `NULL`. Both are needed for an optional `ImageField` — `blank` covers validation, `null` covers the database.

```python
class Meta:
    ordering = ["user__username"]
```

Sort profiles by their linked user`'`s username. The double underscore `user__username` is Django`'`s syntax for following a relationship in a query — it means "the username field on the related User row." This is the same syntax used in queryset `.filter()` and `.order_by()` calls.

```python
def __str__(self):
    return f"{self.user.username} ({self.get_descriptive_role_display()})"
```

Produces a readable representation like `"alice (Primary User)"`. `get_descriptive_role_display()` is the auto-generated method mentioned above — Django creates it for any field with `choices`.

---

### Step 3C: Register the app in settings

Open `config/settings.py` and find the `INSTALLED_APPS` list. Add `"accounts"` to the end (or right after the `django.contrib.*` entries — position does not matter for our app):

```python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "accounts",  # <-- add this line
]
```

**What this does:** `INSTALLED_APPS` is Django`'`s registry. Adding `"accounts"` tells Django to:

1. Look for `accounts/apps.py` and load the `AppConfig`.
2. Scan `accounts/models.py` for model classes.
3. Make those models available for migrations, queries, and admin registration.

**Why a string and not an import?** `"accounts"` is the shorthand. Django resolves it to `accounts.apps.AccountsConfig` automatically. For more complex configurations you can use the full dotted path (`"accounts.apps.AccountsConfig"`), but the shorthand works fine here.

**Analogy:** `INSTALLED_APPS` is like telling the building manager which rooms exist. If a room is not on the list, the manager pretends it does not exist — no lights, no heating, no access.

---

### Step 3D: Make and run migrations

**Commands:**

```powershell
python manage.py makemigrations accounts
python manage.py migrate
```

**What `makemigrations` does:** Django scans your `models.py`, compares it to the last migration file in `accounts/migrations/`, and generates a new migration file describing the differences. This file is a Python script with an ordered list of operations — it is essentially a recipe for transforming the database schema. You can read it: it says things like "create table X with columns A, B, C."

**Why `accounts` is specified:** You can run `makemigrations` without an app name and it scans everything. Specifying `accounts` is just faster and more focused — fewer things to check for changes.

**What `migrate` does:** Reads the migration files and executes them against the actual database. If a migration has already been applied, Django skips it (it tracks applied migrations in a `django_migrations` table). If the migration is new, Django runs the SQL and records that it ran.

**Analogy:** `makemigrations` is writing the blueprint. `migrate` is handing it to the builders and watching them pour concrete.

**What you should see:** After `makemigrations`, a new file appears in `accounts/migrations/0001_initial.py`. After `migrate`, output lines like `Applying accounts.0001_initial... OK`.

---

### Step 3E: Register models in the admin

Open `accounts/admin.py` and replace it with:

```python
from django.contrib import admin

from .models import Household, UserProfile


@admin.register(Household)
class HouseholdAdmin(admin.ModelAdmin):
    list_display = ["name", "base_currency", "fiscal_year_start_month", "created_at"]


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "household", "descriptive_role"]
    list_filter = ["household", "descriptive_role"]
    search_fields = ["user__username", "user__email"]
```

**What `@admin.register(Household)` does:** This is a decorator — syntactic sugar that replaces calling `admin.site.register(Household, HouseholdAdmin)` at the bottom of the file. Both forms do the same thing: they tell the Django admin "here is a model and here is how to display it."

**`list_display`:** Controls which columns appear in the admin list view. Without it, Django shows only `__str__`, which means one column. With `list_display`, you get a table with sortable headers for each field listed.

**`list_filter`:** Adds a sidebar filter panel in the admin. For `UserProfile`, filtering by `household` and `descriptive_role` lets an admin quickly find "all Primary Users in the Smith household."

**`search_fields`:** Adds a search box. `user__username` and `user__email` let the admin search by login name or email address. The double underscore follows the relationship to the `User` model — same syntax as in querysets.

**Analogy:** If the Django admin is a filing cabinet with folders (models) and sheets of paper (rows), `list_display` chooses which columns are printed on each sheet, `list_filter` adds colour-coded tabs, and `search_fields` is the index at the front.

---

### Expected result

After completing all five sub-steps:

- `accounts/migrations/0001_initial.py` exists and describes the two tables.
- `python manage.py showmigrations` shows `[X]` next to `accounts.0001_initial`.
- Running `python manage.py createsuperuser` and logging into `/admin/` shows `Households` and `User profiles` sections.

### Common problems

- Forgetting to add `"accounts"` to `INSTALLED_APPS` means `makemigrations` will not detect the models. Django will silently ignore them.
- Using `from django.contrib.auth.models import User` instead of `settings.AUTH_USER_MODEL` works initially but breaks if the project ever switches to a custom user model. Always use the setting.
- The `UserProfile` model should use a `OneToOneField` to Django`'`s `User`, not subclass it. Subclassing locks you into a specific auth model early; `OneToOneField` keeps the door open.
- If `makemigrations` says "No changes detected," double-check that `accounts` is in `INSTALLED_APPS` and that the `accounts` directory has an `__init__.py` (it does — `startapp` creates one).

---

### What comes next

After the models are built and verified, the next step is household-scoped middleware. Every request that comes in from an authenticated user will have `request.household` stamped on it. Every viewset will scope its queryset by `request.household`. This single pattern — middleware stamps the household, viewsets filter by it — is the safety net that keeps every household`'`s data private.
### How to edit the file (practical steps)

You are editing from Git Bash inside VS Code. Two ways to open the file:

**Option A — VS Code (recommended):**
```bash
code accounts/models.py
```
If `code` is not in your PATH, VS Code can install it: open VS Code, press `Ctrl+Shift+P`, type "Shell Command: Install 'code' command in PATH", and select it. Then close and reopen your terminal.

**Option B — Notepad (fallback):**
```bash
notepad accounts/models.py
```

Once the file is open:
1. Select everything with `Ctrl+A`.
2. Press `Delete` (or `Backspace`) — the file should now be completely empty.
3. Paste the full model code from the section above.
4. Save with `Ctrl+S`.
5. Close the editor.

---

### Step 3B: Write the models

---

### Step 3B: Write the models — imports

Start with an empty `accounts/models.py`. Replace everything with these two lines:

```python
from django.conf import settings
from django.db import models
```

**Line-by-line explanation:**

**`from django.conf import settings`** — Django has a central settings object that holds every configuration value: the database connection, installed apps, the user model being used, secret keys. Importing `settings` gives your code access to all of that. We need it because later we will use `settings.AUTH_USER_MODEL` to link our `UserProfile` to whatever user model Django is configured to use. We never hardcode `auth.User` because if the project ever swaps to a custom user model, every hardcoded import would break. Instead, we always read the setting and let Django resolve the correct model at runtime.

**Analogy:** `settings` is like the control panel on a washing machine. Your code does not need to know whether the machine is set to cotton or delicates — it just reads the dial and adapts.

**`from django.db import models`** — This imports Django`'`s ORM (Object-Relational Mapper) module. Every field type you will use — `CharField`, `ForeignKey`, `DateTimeField`, `OneToOneField` — lives inside `models`. When you write `models.CharField(...)`, you are telling Django "I want a text column in the database." Django translates that Python class into the correct SQL column type (`VARCHAR`, `INTEGER`, `TIMESTAMP`, etc.) depending on which database engine you are using (SQLite for development, PostgreSQL for production).

**Analogy:** `models` is a universal remote. You press the same button (`CharField`) and Django figures out whether it needs to send an infrared signal to PostgreSQL, SQLite, or MySQL.

**Verification:** After saving these two lines, there should be no errors. You cannot test imports in isolation yet — they will be exercised when we write the model classes next and run `makemigrations`.

### Step 3B: Add the household fiscal-year starting month

The `Household` model already has its `name` and `base_currency` fields. The next field records which month begins that household's financial year.

**What:** `fiscal_year_start_month` stores a month number. For example, `1` means January and `4` means April.

**Why:** Not every household organizes its financial records from January to December. MoneyMatters will eventually use this value when it groups transactions, creates yearly ledger views, and calculates reports. Storing the choice on the household also prevents us from hardcoding January throughout the application.

**How:** `models.PositiveSmallIntegerField` tells Django to create a database column for a small, non-negative whole number. `default=1` means Django uses January when a new household is created without an explicitly selected starting month. A later validation step must restrict accepted values to the real month range of 1 through 12, because the field type alone also accepts other non-negative numbers.

**Analogy:** A school can begin its academic year in September even though the calendar begins in January. In the same way, this field is the household's bookmark showing where its financial year begins.

**Learner action:** In `accounts/models.py`, type this directly beneath `base_currency`:

```python
    fiscal_year_start_month = models.PositiveSmallIntegerField(default=1)
```

Save the file with `Ctrl+S`. We will inspect the saved result before adding the next field.

### Step 3B verification: Keep related model fields together

The `fiscal_year_start_month` field was added correctly. Inspection found extra blank lines containing spaces between `base_currency` and `fiscal_year_start_month`, plus another blank line after it.

**What:** Blank lines visually separate sections of code. Inside this short group of database fields, the fields should remain together with no blank lines between them.

**Why:** Consistent spacing makes the model easy to scan and keeps Git diffs focused on meaningful changes. Spaces on otherwise empty lines are invisible in the editor, but formatting tools and code review checks can still detect them as trailing whitespace.

**How:** Python normally ignores blank lines inside a class, so this is not a syntax error. We remove them as a readability and maintenance improvement before adding another field.

**Analogy:** These fields are items in one short shopping list. Empty rows between every item do not change the list, but they make it unnecessarily harder to scan.

**Learner action:** Remove the blank lines around `fiscal_year_start_month` so the three fields appear on consecutive lines. Do not remove their four-space indentation.

### Step 3B verification: Remove trailing whitespace

The three `Household` fields are now together correctly, and Python successfully compiles the file. One small formatting issue remains: the `fiscal_year_start_month` line has three invisible spaces after the closing parenthesis.

**What:** Trailing whitespace is spaces or tabs left after the final visible character on a line.

**Why:** Python accepts it, so this is not a syntax error. Removing it keeps the source clean and prevents formatting checks and Git diffs from flagging an otherwise meaningless change.

**How:** Put the cursor immediately after the final `)` on the `fiscal_year_start_month` line, press `Delete` until there is nothing after it, and save the file. Do not remove the four spaces before the field name; those are required indentation.

**Analogy:** It is like erasing pencil marks beyond the edge of a form: the form still works, but the clean edge makes later review easier.

**Learner action:** Remove only the three spaces after the final `)` on the `fiscal_year_start_month` line, then save with `Ctrl+S`. We will verify the cleanup before adding `created_at`.

### Step 3B: Add the household creation timestamp

The spacing cleanup is complete and `accounts/models.py` compiles successfully. The final database field on `Household` records when each household row is first created.

**What:** `created_at` stores a date and time for the moment Django inserts a new household into the database.

**Why:** Creation timestamps are useful for auditing, debugging, onboarding reports, and understanding the age of a household account. Django fills this value automatically, so users do not type or maintain it.

**How:** `models.DateTimeField` creates a date-and-time column. The option `auto_now_add=True` tells Django to set the value once when the object is first saved. Later edits do not change it. This differs from `auto_now=True`, which updates the timestamp on every save and is normally used for a field such as `updated_at`.

**Analogy:** It works like the original issue date printed on a passport. Changing the address associated with the passport later does not rewrite the date on which it was first issued.

**Learner action:** In `accounts/models.py`, add this directly beneath `fiscal_year_start_month`, keeping the same four-space indentation:

```python
    created_at = models.DateTimeField(auto_now_add=True)
```

Save with `Ctrl+S`. We will inspect the result before adding model metadata or methods.

### Step 3B verification: Space around the assignment operator

The `created_at` field was added with valid Python syntax, and the file compiles. Its current form, `created_at =models.DateTimeField(...)`, is missing the conventional space after the assignment operator.

**What:** The equals sign in this class body assigns the Django field object on the right to the model attribute named `created_at` on the left.

**Why:** Python permits uneven spacing here, but standard Python style uses one space on each side of `=` for an assignment. Consistent spacing makes code easier to scan and prevents automated formatters or code-quality checks from producing avoidable changes later.

**How:** Change `=models` to `= models`. This spacing rule applies to assignment statements. It does not apply in the same way to keyword arguments such as `auto_now_add=True`, where Python style deliberately uses no spaces around the equals sign.

**Analogy:** An assignment is like a label connected to a box. Leaving equal space on both sides of the connector makes the relationship easy to see; keyword arguments are compact settings printed inside the box.

**Learner action:** On the `created_at` line in `accounts/models.py`, insert one space between `=` and `models`. The completed line should be:

```python
    created_at = models.DateTimeField(auto_now_add=True)
```

Save with `Ctrl+S`. We will verify the formatting before moving to the model's `Meta` class.

### Step 3B: Finish the `Household` model with metadata and a readable name

The learner requested a faster pace, so related code will now be taught in coherent blocks rather than one line at a time. This block corrects the `created_at` spacing and completes `Household` with its default ordering and string representation.

**What:** The `Meta` inner class configures model behaviour that is not stored as a database field. `ordering = ["name"]` makes household query results alphabetical by default. The `__str__` method tells Python and Django to represent a household using its actual name.

**Why:** Predictable ordering keeps lists stable across the admin, shell, and future API queries. A readable string prevents Django from displaying vague labels such as `Household object (1)` in dropdowns, logs, and the admin interface.

**How:** Django discovers the specially named `Meta` class when it builds the model. The list `[`"name"`]` tells the ORM to add an ascending `ORDER BY name` unless a query requests another order. Python calls the specially named `__str__` method whenever code converts a `Household` object to text; returning `self.name` reads the `name` field from that particular household instance. Both `Meta` and `__str__` remain indented inside `Household`, while their contents receive one additional indentation level.

**Analogy:** Think of `Household` as a set of contact cards. `Meta.ordering` tells the filing cabinet to arrange the cards alphabetically, while `__str__` tells it to print the household name on each tab instead of an internal card number.

**Learner action:** In `accounts/models.py`, correct the `created_at` line and add the following block directly beneath the four field lines. Keep four spaces before `class Meta` and `def __str__`, and eight spaces inside each one:

```python
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
```

Replace the existing `created_at =models...` line rather than adding a second `created_at` field. Save with `Ctrl+S`; then the whole `Household` model will be checked as one unit.

### Step 3B: Start `UserProfile` and define descriptive roles

The `Household` model now compiles as a complete unit. The next coherent block starts the profile that will extend Django's authentication user and defines the labels MoneyMatters uses to attribute financial activity.

**What:** `UserProfile` is a separate Django model for MoneyMatters-specific user information. Its nested `Role` class defines three allowed text choices: Primary User, Secondary User, and Joint. Each choice contains a database value such as `"PRIMARY"` and a human-readable label such as `"Primary User"`.

**Why:** Django's built-in user already handles identity, passwords, and authentication. Keeping household membership and finance-specific labels in `UserProfile` avoids duplicating or prematurely replacing that secure authentication model. Fixed choices also prevent inconsistent data such as `primary`, `Primary`, and `main user` representing the same concept. These labels describe display and transaction attribution only; Admin, Member, and Viewer permissions will be implemented separately.

**How:** Like every Django model, `UserProfile` inherits from `models.Model`. `models.TextChoices` converts the constants in `Role` into a reusable choices collection. Django will later use `Role.choices` to validate a model field and render a dropdown. The first string in each tuple is stored in the database; the second is shown to people. Nesting `Role` inside `UserProfile` keeps the choices grouped with the model that owns them.

**Analogy:** Django's built-in user is a person's passport: it establishes identity. `UserProfile` is the household membership card attached to that passport. The `Role` choices are the preprinted labels available on the card, preventing everyone from inventing a different title.

**Learner action:** At the bottom of `accounts/models.py`, leave two blank lines after `return self.name`, then add this block:

```python
class UserProfile(models.Model):
    """Adds household membership and financial attribution to a Django user."""

    class Role(models.TextChoices):
        PRIMARY = "PRIMARY", "Primary User"
        SECONDARY = "SECONDARY", "Secondary User"
        JOINT = "JOINT", "Joint"
```

Save with `Ctrl+S`. We will verify the class and choices together before adding the relationship fields.

#### Clarification: Read `TextChoices` as a controlled dropdown

This block combines several unfamiliar Python ideas, so pause before typing it. The simplest mental model is a form dropdown whose options are defined once and reused everywhere.

Start with one entry:

```python
PRIMARY = "PRIMARY", "Primary User"
```

Read it from left to right:

- `PRIMARY` is the Python name developers use in code, such as `UserProfile.Role.PRIMARY`.
- The first `"PRIMARY"` is the compact value saved in the database.
- `"Primary User"` is the friendly label displayed to a person in a dropdown or admin page.

The other two lines follow exactly the same pattern. `Role` is placed inside `UserProfile` because these choices belong specifically to user profiles. It acts like a small labelled box kept inside the larger profile box; it is not another database table.

For example, if Alice is selected as Primary User, the page shows `Primary User`, the database stores `PRIMARY`, and Python code can compare the value with `UserProfile.Role.PRIMARY`. These three forms refer to the same choice but serve different audiences: person, database, and developer.

The words Primary, Secondary, and Joint do not control access. They only describe whose finances a record belongs to. Permission levels such as Admin, Member, and Viewer remain a separate feature.

#### Line-by-line explanation of the implemented `UserProfile` role block

```python
class UserProfile(models.Model):
```

`class` tells Python to define a new type of object. `UserProfile` is the name chosen for that type. The parentheses mean it inherits capabilities from `models.Model`; Django therefore recognizes it as a database model and will eventually create a table for it through migrations. This line defines the model but does not create an individual user profile yet. Individual rows will be instances of the model.

```python
    """Adds household membership and financial attribution to a Django user."""
```

This is a docstring: documentation stored inside the class. Python and developer tools can inspect it, but Django does not turn it into a database column. It explains the class's responsibility to future readers.

```python
    class Role(models.TextChoices):
```

This defines a second, smaller class named `Role` inside `UserProfile`. It is nested because the choices belong specifically to profiles. It inherits from Django's `TextChoices`, which knows how to turn the following constants into values suitable for a text-field dropdown and validation. `Role` is not a model and will not receive its own database table.

```python
        PRIMARY = "PRIMARY", "Primary User"
```

`PRIMARY` is the constant name used by Python code. The right side is a two-item tuple: `"PRIMARY"` is the stable value stored in the database, and `"Primary User"` is the friendly label displayed to people. Code can later use `UserProfile.Role.PRIMARY` instead of repeatedly typing a raw string, reducing spelling mistakes.

```python
        SECONDARY = "SECONDARY", "Secondary User"
        JOINT = "JOINT", "Joint"
```

These repeat the same pattern for the other allowed labels. Together, the three lines allow Django to generate `Role.choices`, which a later `CharField` will use. Defining choices alone does not yet add a role column; that field is the next separate concept.

**Whole-block analogy:** `UserProfile` is a blank membership-card design. The docstring is a note explaining what the card is for. `Role` is the approved list of stickers that may be placed on the card. The three constants define each sticker's inventory code and printed label. We have designed the card and its allowed stickers, but we have not yet printed a card for anyone or added the place where the sticker is attached.

### Step 3B: Connect each profile to a user and household

The `UserProfile` and `Role` block now compiles successfully. The next proposed block adds the two relationships that give a profile its identity and household membership. It must be reviewed and approved before the AI implements it.

**What:** `user` creates a one-to-one relationship between a `UserProfile` and Django's authentication user. `household` creates a many-to-one relationship: each profile belongs to one household, while one household can contain many profiles.

**Why:** Authentication data such as passwords and login identity should remain in Django's proven user model. MoneyMatters adds its own details through one profile per user. The household relationship is the foundation of data isolation: later queries will use the signed-in user's profile to determine which household's financial records they may access.

**How:** `settings.AUTH_USER_MODEL` refers to whichever authentication user model Django is configured to use, avoiding a fragile hardcoded import. `OneToOneField` behaves like a foreign key with a uniqueness rule, so two profiles cannot point to the same user. `ForeignKey` permits many profiles to point to the same household. `on_delete=models.CASCADE` removes the dependent profile if its user or household is deleted, preventing an orphaned profile. `related_name="profile"` enables `user.profile`; `related_name="members"` enables `household.members.all()`.

**Analogy:** The Django user is a passport, and the profile is its single attached household membership card—one passport cannot have two such cards. The household is a club: every membership card belongs to one club, but the club can have many members. If the passport or the club is permanently removed, its dependent membership card no longer has meaning and is removed too.

**Proposed code:** Add this inside `UserProfile`, directly after the `Role` choices and aligned with `class Role`:

```python
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile"
    )
    household = models.ForeignKey(
        Household, on_delete=models.CASCADE, related_name="members"
    )
```

After learner approval, the AI will implement this exact block and verify the file before any additional fields are proposed.

#### Architecture review of the profile relationships

**Purpose:** These fields connect MoneyMatters profile data to Django's authenticated identity and to the household that owns the financial data.

**Location:** They belong in the data-model layer, inside `UserProfile` in `accounts/models.py`, because they describe persistent relationships between database records. Authentication middleware will later identify the Django user; application code can then follow `user.profile.household` to find the correct tenant.

**Important path:** A person logs in and Django sets `request.user`. MoneyMatters reads `request.user.profile`, then reads `.household`. Household-scoped middleware will place that household on the request, and API querysets will filter financial records by it. The final safety path will be `session cookie -> request.user -> user.profile -> profile.household -> filtered queryset`.

**Business rules:** One user may have only one profile; every profile must reference one user and one household; many profiles may reference the same household. Deleting a parent user or household deletes the dependent profile. Household deletion will eventually require additional safeguards because cascading financial data is destructive even though the database relationship supports it.

**Common failures:** Using `ForeignKey` instead of `OneToOneField` for `user` would allow duplicate profiles. Omitting `related_name` would produce awkward reverse names. Hardcoding Django's default `User` class would make a future user-model change harder. Assuming that the relationship alone protects data would be dangerous: every financial queryset must still be household-filtered.

**Tests to understand:** Model tests should prove that a second profile for the same user is rejected, multiple users can join one household, `user.profile` and `household.members.all()` work, required relationships cannot be empty, and deletion follows the agreed policy. Later API tests must prove cross-household access is denied.

**Learner modification after verification:** Once the relationship block is implemented and tested, the learner will inspect the reverse access names in the Django shell and make a small related test or naming change with guidance rather than altering a security-sensitive relationship blindly.

#### Deeper breakdown: the `user` one-to-one relationship

Pause the full relationship block and consider only this field:

```python
user = models.OneToOneField(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name="profile",
)
```

The field will appear on every `UserProfile` row. Although Python calls it `user`, the database normally stores a numeric reference such as `user_id = 7`. That number points to the row with ID 7 in Django's user table. Django's ORM hides the manual lookup, so Python code can write `profile.user` and receive the complete related user object.

`models.OneToOneField` selects the relationship type. It means every profile points to exactly one user, and the database adds a uniqueness rule so the same user cannot be referenced by two different profiles. This direction is important: the field is declared on `UserProfile`, so the profile table stores the reference.

`settings.AUTH_USER_MODEL` selects the destination model. Instead of assuming the project will always use Django's default user class, it reads the configured user model from settings. This makes the relationship compatible with a future custom authentication model.

`on_delete=models.CASCADE` defines what happens to the profile if the referenced user is deleted. The profile is dependent information with no meaning after its login identity is gone, so Django deletes the profile as part of the same operation. Deleting the profile does not cascade backwards and delete the user; the dependency runs from profile to user.

`related_name="profile"` names the reverse route. The field already provides the forward route `profile.user`. The related name adds `user.profile`, allowing code that starts with the authenticated Django user to reach the MoneyMatters profile directly.

Example data:

| Django user table | User profile table |
|---|---|
| `id=7, username="alice"` | `id=12, user_id=7, ...` |

From the profile, `profile.user` follows `user_id=7` to Alice. From Alice, `user.profile` uses the reverse relationship to find profile 12.

**Analogy:** The user row is a passport and the profile row is a supplementary card. The card records the passport number it belongs to. The uniqueness rule allows only one such card for that passport, while `related_name` gives the passport office a labelled index for finding the card in reverse.

**Learner check correction:** The relationship is stored in the user-profile table, not the user table. A relationship field is physically stored on the table for the model where the field is declared. Because `user = models.OneToOneField(...)` is written inside `UserProfile`, Django creates a `user_id` column on the profile table. `related_name="profile"` makes `user.profile` possible in Python, but it does not add a profile column to Django's user table.

**Learner check passed:** The learner correctly explained that `OneToOneField` is required because each user should have only one profile and several profiles must not reference the same user.

**Implementation checkpoint approved:** The learner approved the implemented `user` and `household` relationship block after syntax and project checks passed. Full Django model discovery still awaits registration of the `accounts` app in `INSTALLED_APPS`.

#### Deeper breakdown: the `household` foreign-key relationship

Now consider the second proposed field:

```python
household = models.ForeignKey(
    Household,
    on_delete=models.CASCADE,
    related_name="members",
)
```

Like the `user` field, this is declared inside `UserProfile`, so the profile table will store the reference—normally a numeric column such as `household_id = 3`. It points to the row with ID 3 in the household table.

`models.ForeignKey` deliberately allows the same household ID to appear in many profile rows. Each profile still points to only one household, but a household can have many member profiles. This is called a many-to-one relationship when viewed from profiles to households, or one-to-many when viewed from a household to its profiles.

`Household` is the destination model. It can be referenced directly because it is defined earlier in the same `models.py` file.

`on_delete=models.CASCADE` means deleting a household also deletes its dependent profiles. This is the database behaviour in the current design; the application must later protect household deletion with permissions, confirmation, and a deliberate deletion policy because financial records make it a destructive operation.

`related_name="members"` provides the reverse path `household.members.all()`. The word `members` is plural because the reverse result can contain several profiles. The forward path from one profile remains `profile.household`.

Example data:

| Household table | User profile table |
|---|---|
| `id=3, name="Smith Household"` | `id=12, household_id=3` |
| | `id=18, household_id=3` |

Both profiles belong to household 3. `profile.household` retrieves the one household for a profile, while `household.members.all()` retrieves both member profiles.

**Analogy:** The household is a club and each profile is a membership card. Every card names one club, but many cards may name the same club. The club's `members` index collects all cards that point back to it.

### Step 3B: Store the selected financial label and optional avatar

The next proposed block adds two profile details: the selected descriptive label and an optional profile image. It must be reviewed and approved before implementation.

**Purpose:** `descriptive_role` stores one selection from the previously defined `Role` choices. `avatar` stores a reference to an optional uploaded profile image.

**Location:** Both fields belong in the data-model layer inside `UserProfile`. The role is ordinary structured database data. The avatar field stores a file path in the database while the image bytes live in configured media storage; local development and production storage configuration will be added separately.

**Important paths:** For the role, a form or API submits a value such as `"PRIMARY"`; Django validates it against `Role.choices` in forms and serializers, then stores the text value in the profile row. Code can display the friendly label through `profile.get_descriptive_role_display()`. For an avatar, an upload passes through request parsing and file validation, the storage backend saves the image beneath `avatars/`, and the database records its relative path.

**Business rules:** The role defaults to Secondary User when no explicit selection is supplied and remains descriptive rather than permission-bearing. Its maximum stored length must fit every database value. An avatar is optional. Image type, size, and safe serving rules must be enforced before production; `ImageField` alone is not a complete upload-security policy.

**How:** `CharField` stores short text. `choices=Role.choices` supplies allowed values to Django forms and enables the display helper; application-level validation must actually run for the choice check to occur. `default=Role.SECONDARY` gives new profiles a valid initial label. `ImageField` records an uploaded image path and uses Pillow to inspect images. `upload_to="avatars/"` selects a subdirectory within media storage. `blank=True` allows forms and serializers to omit the field; `null=True` permits a database `NULL` in the current design.

**Analogy:** The role field is the space on a membership card where one approved sticker is attached; the sticker list was designed earlier, and this field is the actual attachment point. The avatar field is like a catalogue entry: the database records where the photograph is filed rather than placing the photograph itself inside the catalogue row.

**Common failures:** Confusing the descriptive role with permissions could create an authorization bug. Bypassing model/form/serializer validation can allow a raw invalid choice into the database because Django `choices` are not automatically a database check constraint. Image uploads can fail if Pillow or media settings are missing. Unrestricted uploads can create security and storage problems. Using both `blank=True` and `null=True` on string-like fields can create two representations of emptiness, so the avatar behaviour should be tested deliberately.

**Tests to understand:** Tests should prove the default role is Secondary, accepted choices expose the expected database values and labels, the display helper returns the friendly label, invalid roles are rejected by the validation path used by the app, a profile can exist without an avatar, and an uploaded image uses the expected storage path. Upload tests should use temporary media storage and a small generated fixture rather than real user files.

**Proposed code:** Add this inside `UserProfile`, below the `household` field:

```python
    descriptive_role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.SECONDARY,
    )
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
```

After learner approval, the AI will implement only this block and verify syntax. Full Django validation of `ImageField`, including the Pillow dependency, will be performed once `accounts` is registered.

#### Learner modification review: Describe the profile without implying permissions

The learner proposed this docstring:

```python
"""tells django what user role they have within a household."""
```

This correctly recognizes that a profile connects a user with household-related information. However, the word `role` can imply access control. In MoneyMatters, Primary User, Secondary User, and Joint are descriptive labels for display and financial attribution; Admin, Member, and Viewer will govern permissions separately. `UserProfile` will also hold household membership and an optional avatar, so its purpose is broader than one role label.

A more accurate sentence should say that the profile stores MoneyMatters-specific information for a Django user, especially household membership and a descriptive financial label. Docstrings conventionally begin with a capital letter and describe what the class represents or does.

#### Block-by-block lesson: add only the descriptive financial label

This lesson deliberately separates `descriptive_role` from `avatar`. Complete and verify this field before introducing the image field.

##### 1. Purpose

The nested `Role` class defines the approved options, but it does not create a database column or remember which option a profile selected. The `descriptive_role` field creates that storage place on every `UserProfile` row. It records financial attribution such as Primary User, Secondary User, or Joint; it does not grant permissions.

##### 2. Location

This field belongs in the data-model layer inside `UserProfile` in `accounts/models.py`. Place it immediately below the `household` field and keep it indented by four spaces so Python treats it as part of the model.

##### 3. Important execution and data path

Later, a form or API will submit a database value such as `"PRIMARY"`. Django uses `Role.choices` while validating that input, the ORM writes the accepted text into the profile table, and `profile.get_descriptive_role_display()` can turn it back into the friendly label `"Primary User"` for a page. The path is `form or API -> choice validation -> UserProfile object -> database column -> display helper`.

##### 4. Main business rules

- A profile uses one of the three values defined by `Role`.
- The stored value is the stable code, such as `"PRIMARY"`, rather than the display label.
- A profile defaults to Secondary User when no choice is supplied.
- The field describes financial attribution only. Permission roles such as Admin, Member, and Viewer remain separate.

##### 5. Common failure cases

- Treating this label as an authorization check could expose household data.
- Typing a raw default string repeatedly would make spelling mistakes easier; `Role.SECONDARY` reuses the defined constant.
- Omitting `choices=Role.choices` would prevent Django forms and serializers from automatically presenting and validating the approved options.
- Assuming `choices` protects every database write would be unsafe. Django choice validation occurs through validation paths such as forms, serializers, or `full_clean()`; a careless direct save can bypass it.

##### 6. Tests to understand

Later model tests should prove that the default is `Role.SECONDARY`, each approved value can be selected, the display helper returns the friendly label, and the application's validation path rejects an unsupported value. These tests protect the distinction between descriptive labels and permissions.

##### 7. Learner modification

From the MoneyMatters project terminal, run:

```powershell
code accounts/models.py
```

This asks Visual Studio Code to open the existing model file; it does not execute or change the Python code. If the file is already open, select its tab instead. Find the closing line of the `household` field. Directly below it, add this block with four spaces before `descriptive_role`:

```python
    descriptive_role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.SECONDARY,
    )
```

Save the file with `Ctrl+S`, but do not add the avatar yet. We will inspect this block, explain each argument, and run a focused syntax check before moving forward.

**Analogy:** `Role` is the sheet of approved stickers. `descriptive_role` is the labelled space on each household membership card where exactly one of those stickers is placed. The sticker changes how the card is described, not which locked doors its owner may open.

##### Verification checkpoint

The learner added the `descriptive_role` block in the correct location and with the intended indentation and arguments. Running `python -m py_compile accounts/models.py` completed successfully, which proves Python can parse the file without a syntax or indentation error.

This focused check does not yet prove that Django can discover the model, create its database column, or enforce the expected validation path. Those behaviours require registering `accounts` in `INSTALLED_APPS`, creating a migration, and running model tests in later approved steps. The current block is accepted at the syntax level; the avatar remains unimplemented.

**Learner understanding check:** The learner correctly identified that no database structure has been created. One wording correction is important: `py_compile` proves that Python can parse the module without syntax errors; it does not prove that Django can discover or validate the model. Django-level checks begin after the app is registered and loaded.

**Teaching-process correction:** The AI ran the first `py_compile` verification instead of asking the learner to run it. That reduced the learner's hands-on terminal practice. From this checkpoint onward, the learner should personally run important development and verification commands after they have been explained, unless the learner explicitly asks the AI to run one or is blocked by an error. The AI should review and explain the learner's output rather than silently performing the command first.

To repeat this check personally, use the terminal opened at the MoneyMatters project root and run:

```powershell
python -m py_compile accounts/models.py
```

`python` starts the active Python interpreter. `-m py_compile` asks Python to run its built-in compilation checker as a module. `accounts/models.py` is the file to parse. A successful check normally returns to the prompt without printing anything; an error would show a traceback and the affected line. This command does not run Django, create a database table, or change the source file.

**Learner-run verification:** The learner personally ran `python -m py_compile accounts/models.py`. The command returned to the prompt with no output, confirming that the updated model file has valid Python syntax and indentation. This replaces observation-only verification with hands-on terminal practice; Django discovery and database creation remain untested.

#### Block-by-block lesson: add the optional avatar reference

This lesson covers only the avatar model field. Media settings, upload security, and dependency installation remain separate blocks that must be explained and approved later.

##### 1. Purpose

The avatar field gives a profile an optional picture. The database stores a reference such as `avatars/alice.jpg`; the storage system holds the image bytes themselves. A profile must still work when no picture is supplied.

##### 2. Location

The field belongs in the data-model layer inside `UserProfile` in `accounts/models.py`, immediately below `descriptive_role`. It belongs on the profile because the image describes a person rather than the whole household.

##### 3. Important execution and data path

Later, the browser will send an image as multipart form data. Django's upload handling receives the file, `ImageField` uses Pillow when image validation runs, the configured storage backend saves it under `avatars/`, and the database stores the resulting relative path. A response can later turn that reference into an image URL. The path is `browser upload -> Django upload handling -> image validation -> media storage -> database path -> displayed URL`.

##### 4. Main business rules

- The avatar is optional; lack of a picture must not prevent profile creation.
- The database stores a path or storage key, not the image bytes.
- Files belong under the `avatars/` storage prefix.
- File type, size, safe naming, access, replacement, and deletion policies must be defined before production uploads are enabled.
- An avatar never changes a user's permissions or household membership.

##### 5. Common failure cases

- Django's `ImageField` needs the Pillow package for image support. Pillow is not currently installed in the active environment, so full Django validation would fail until a later dependency step is approved.
- Missing `MEDIA_ROOT` or `MEDIA_URL` settings can prevent local saving or display.
- Trusting a filename or extension without validating the actual image content can be unsafe.
- Replacing or deleting a profile may leave an unused file in storage unless cleanup behaviour is designed.
- Assuming `blank=True` and `null=True` mean the same thing is incorrect: `blank` controls form/model validation while `null` controls database storage.

##### 6. Tests to understand

Later tests should prove that a profile can exist without an avatar, a valid small image is saved under the expected storage prefix, invalid image content is rejected by the application's validation path, and tests use temporary media storage rather than real user folders. Replacement and deletion behaviour also need tests once their policy is chosen.

##### 7. Learner modification

In the already-open `accounts/models.py`, place the following line directly below the closing parenthesis of `descriptive_role`, aligned with that field:

```python
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
```

Save with `Ctrl+S`. This step declares the field only; it does not install Pillow, configure media storage, create a migration, or upload a file. We will first inspect the line and repeat the focused syntax check.

**Analogy:** The database is a library catalogue. The avatar field is the catalogue entry saying which shelf holds a photograph; the actual photograph remains on the storage shelf. `blank=True` allows a membership form with no photograph attached, while `null=True` allows the catalogue entry itself to say that no photograph has been filed.

##### Avatar formatting inspection and Python formatter question

The learner added the avatar block in the correct location with the intended arguments. A read-only Git inspection found that the final blank line contains four spaces and the file still does not end with a newline. This is not a Python syntax error, but it is undesirable invisible whitespace that formatters and Git checks are designed to catch.

Python has automatic formatters comparable to Prettier in frontend development. Black is a well-known dedicated Python formatter. Ruff includes a Black-compatible formatter as well as a Python linter, making it a good candidate for MoneyMatters. Installing and configuring Ruff will be taught later as its own seven-step block; it should not be introduced silently during the avatar lesson.

For the immediate hands-on correction, place the cursor on the blank line after the avatar field, remove its four spaces so the cursor is at column one, and save. The file should end after the newline that follows the closing parenthesis, without an extra whitespace-filled line.

From the MoneyMatters project root, run:

```powershell
git diff --check -- accounts/models.py
```

`git diff` examines uncommitted changes. `--check` reports trailing whitespace and missing-newline problems instead of changing the file. The second `--` separates Git options from the file path, and `accounts/models.py` limits the check to the model file. This is a read-only command: it does not format, stage, commit, or otherwise modify the file. Success normally produces no output; a remaining problem prints the file and line number.

**Learner-run whitespace verification:** The learner removed the whitespace-only final line and ran `git diff --check -- accounts/models.py`. The command returned with no output, proving that Git found no whitespace errors in the uncommitted `accounts/models.py` diff. This check does not validate Python syntax or Django model behaviour; those require separate checks.

**Learner-run avatar syntax verification:** The learner ran `python -m py_compile accounts/models.py` after adding the avatar field. The command returned with no output, proving that Python can parse the complete file without syntax or indentation errors. The command may create ignored bytecode under `accounts/__pycache__/`, but it does not run Django, validate Pillow support, register the app, create a migration, or change the database. The `descriptive_role` and `avatar` blocks are accepted at the Python-syntax level.

### Step 3C: Check the Pillow image dependency

Treat dependency readiness as its own block before registering `accounts` with Django.

#### 1. Purpose

`models.ImageField` relies on the Pillow library for Python image support. Declaring `ImageField` is valid Python without Pillow, which is why `py_compile` passed, but Django's model checks will report that image support is unavailable when the registered app is loaded unless Pillow is installed.

#### 2. Location

Pillow belongs in the project's Python virtual environment, alongside Django and Django REST Framework. It is an environment dependency rather than a line imported directly into `accounts/models.py`. A later dependency-manifest block must also record it so another computer can reproduce the environment.

#### 3. Important execution path

The path is `ImageField declared -> accounts app loaded by Django -> Django system check examines the field -> Pillow supplies image support -> later upload validation can inspect image data`. The first diagnostic step asks the same Python interpreter used for the project whether its package installer knows about Pillow.

#### 4. Main business rules

- Inspect the active project interpreter before installing anything.
- Use `python -m pip` so `pip` belongs to the same Python interpreter that will run Django.
- Record runtime dependencies in a reproducible project manifest rather than relying permanently on one computer's environment.
- Installing Pillow enables image support but does not by itself make uploads secure; file-size, content, storage, and access rules remain separate work.

#### 5. Common failure cases

- A standalone `pip` command may target a different Python installation.
- An inactive virtual environment may cause the package to be inspected or installed globally.
- A package can be installed but omitted from the project manifest, causing another computer or deployment to fail.
- Successful installation does not configure `MEDIA_ROOT`, `MEDIA_URL`, or production storage.

#### 6. Checks and later tests

`python -m pip show Pillow` is a read-only environment check. If installed, it prints package metadata including its version and location. If absent, it normally prints a warning that the package was not found. Later, after an approved installation and app registration, `python manage.py check` should confirm Django can load `ImageField`; upload tests will separately prove real validation and storage behaviour.

#### 7. Learner terminal action

From the MoneyMatters project root, with the project virtual environment active, run:

```powershell
python -m pip show Pillow
```

`python` selects the active interpreter, `-m pip` runs that interpreter's package manager, `show` requests installed-package information without changing anything, and `Pillow` is the package being inspected. Report the exact output. Do not install anything yet; installation and dependency recording require their own explanation and approval.

**Analogy:** `ImageField` is a camera workstation specified on a blueprint, while Pillow is the image technician needed to operate it. The Python syntax check confirms the blueprint is readable; `pip show` checks whether the technician is actually present in this project's workshop.

**Learner-run dependency check:** The learner ran `python -m pip show Pillow` from the project environment and reported that Pillow was not found. This proves the active interpreter does not currently have the image library required by Django's `ImageField`. No package or project file was changed by the diagnostic command.

### Step 3D: Install the bounded Pillow dependency

The official Django 5.2 field reference states that `ImageField` requires Pillow. PyPI lists Pillow 12.3.0 as the current release on 15 August 2026 and states that it requires Python 3.10 or newer, which is compatible with this project's Python 3.13 environment. Official references: `https://docs.djangoproject.com/en/5.2/ref/models/fields/#imagefield` and `https://pypi.org/project/pillow/`.

#### 1. Purpose

Install the image-processing library Django needs to load and validate `ImageField`. This closes the dependency gap discovered by the learner's `pip show` check; it does not yet configure media storage or create a database column.

#### 2. Location

Pillow belongs in the active MoneyMatters virtual environment. It is a runtime dependency used by the backend. The installation changes that environment, not `accounts/models.py`. A following block must record all backend dependencies in a project manifest for reproducibility.

#### 3. Important execution path

The command path is `active project Python -> that interpreter's pip -> Python Package Index -> compatible Pillow distribution -> project virtual environment`. Later the application path becomes `Django loads ImageField -> Pillow is importable -> Django system check passes the image-library requirement -> upload validation can inspect image content`.

#### 4. Main business rules

- Use the active project Python rather than an unrelated global interpreter.
- Use the compatible-release constraint `Pillow~=12.3.0`, allowing maintenance releases in the 12.3 series without silently moving to a new feature series.
- Treat Pillow as a backend runtime dependency and record it in the dependency manifest in the next approved block.
- Installing Pillow does not replace upload size, type, storage, or authorization rules.

#### 5. Common failure cases

- An inactive virtual environment can install Pillow into the wrong location.
- Network or package-index errors can interrupt the download.
- A platform without a compatible prebuilt wheel may attempt a source build and require system libraries.
- Seeing a successful install but failing to record the dependency can make another machine fail later.

#### 6. Checks and later tests

The installation output should report a successful Pillow installation. A learner-run `python -m pip show Pillow` check afterward should display its version and location. Later `python manage.py check`, after `accounts` is registered, will prove Django can load the image field without its missing-Pillow error. Upload tests remain separate.

#### 7. Learner terminal action

From the MoneyMatters project root with the project virtual environment active, run:

```powershell
python -m pip install "Pillow~=12.3.0"
```

`python` selects the active interpreter. `-m pip` uses that interpreter's package manager. `install` changes the active environment by adding a package. `"Pillow~=12.3.0"` requests Pillow 12.3.0 or a compatible maintenance release below 12.4. The command may download files and update pip's local cache; it does not edit project source code, create migrations, or change the database. Report the complete final success line or the complete error output.

**Analogy:** The project workshop has specified an image station but discovered that its technician is absent. The bounded installation hires a technician trained for the approved 12.3 toolset; the following manifest step will add that role to the official staffing list so another workshop knows whom to hire.

**Learner-run installation verification:** The learner ran `python -m pip show Pillow` after installation. It reported Pillow 12.3.0 at `C:\Users\Mega-Mind\Documents\WebDev Projects\MoneyMatters\.venv\Lib\site-packages`, proving the approved version is installed inside the MoneyMatters virtual environment rather than an unrelated global interpreter. `Required-by` was empty; this does not indicate a problem because Django checks for Pillow when using `ImageField` rather than installing it as an unconditional Django dependency. The environment is ready for Django's image-library check, but the dependency still needs to be recorded in a project manifest.

### Step 3E: Record backend dependencies in requirements.txt

The pip documentation describes a requirements file as a list of items for `pip install`; `requirements.txt` is the conventional filename. MoneyMatters currently has no dependency manifest, so another computer cannot reliably recreate the Django, DRF, and Pillow environment from the repository alone. Official reference: `https://pip.pypa.io/en/stable/reference/requirements-file-format/`.

#### 1. Purpose

Create a readable project file listing the backend packages MoneyMatters directly depends on. The virtual environment answers “what is installed on this computer”; `requirements.txt` answers “what should be installed for this project.”

#### 2. Location

Place `requirements.txt` at the repository root beside `manage.py`. It belongs to project/dependency configuration rather than the Django `config` package or an individual app because it describes the backend environment required by the whole project.

#### 3. Important execution path

On a new computer, the path will be `clone repository -> create and activate virtual environment -> pip reads requirements.txt -> pip resolves allowed package versions -> packages are installed -> Django project can start`. Pip treats each non-comment line as a requirement specifier.

#### 4. Main business rules

- List direct runtime dependencies intentionally rather than copying every unrelated package from the computer.
- Use compatible-release bounds matching the versions already selected for the project.
- Keep package names and version constraints free of shell quotes inside the file.
- Update the manifest whenever a new runtime dependency is approved.
- Never place passwords, tokens, or machine-specific virtual-environment paths in the file.

#### 5. Common failure cases

- Forgetting Pillow would make `ImageField` fail on another machine.
- Writing only unbounded package names could allow an unexpected future feature or major release.
- Using `pip freeze` without review can capture unrelated or transitive environment details that obscure the project's direct dependencies.
- Saving the file inside `.venv` would keep it out of the project and Git history.
- Adding shell quotation marks inside the file can make the requirement specifiers incorrect.

#### 6. Checks and later tests

First inspect the saved file and use Git's whitespace check. A later learner-run pip command can read the manifest and confirm the active environment satisfies it. Ultimately, a clean virtual environment or CI job should install from the file and run Django checks and tests; that is the strongest reproducibility test.

#### 7. Learner modification

From the MoneyMatters project root, run:

```powershell
code requirements.txt
```

This asks Visual Studio Code to open a root-level file named `requirements.txt`. Because it does not exist yet, the file is created only when saved. Add exactly these three direct dependencies:

```text
Django~=5.2.0
djangorestframework~=3.16.0
Pillow~=12.3.0
```

Save with `Ctrl+S`. Do not run an installation command from the file yet; the AI will first inspect the filename, location, content, and final newline.

**Analogy:** The virtual environment is the food already present in one kitchen. `requirements.txt` is the recipe's ingredient list. A recipe should name the ingredients the meal depends on, not blindly inventory every object found in the kitchen cupboards.

#### Learner question: How do we know which Django and Django REST Framework versions to record, and can pip generate the requirements file automatically?

The proposed Django and Django REST Framework ranges came from the earlier learner-run installation recorded in this guide: `Django~=5.2.0` and `djangorestframework~=3.16.0`. The status record later reported installed maintenance versions Django 5.2.16 and DRF 3.16.1. Historical documentation is useful, but the active virtual environment should be inspected before creating its manifest.

Pip can produce an automatic installed-package list. The official pip user guide documents `python -m pip freeze > requirements.txt` as a way to create a requirements file for repeatable installs. The `>` PowerShell redirection writes the command's output into the named file and overwrites an existing file, so it must not be used casually. `pip freeze` also lists resolved transitive dependencies such as packages Django needs internally, not only the three packages MoneyMatters chose directly.

Before choosing between an exact frozen environment and a shorter direct-dependency manifest, display the automatic list without redirecting it:

```powershell
python -m pip freeze
```

Run this from the MoneyMatters project root with `.venv` active. `python` selects the active interpreter, `-m pip` runs that interpreter's package manager, and `freeze` prints installed packages in requirement-file syntax. Without `> requirements.txt`, this command is read-only: it prints to the terminal and does not create or overwrite a file. The learner should paste the complete output so each direct and transitive dependency can be identified before the manifest strategy is approved.

**Analogy:** `pip freeze` photographs every labelled ingredient currently in the kitchen, including ingredients brought in automatically by other ingredients. A hand-written direct-dependency file is the recipe's shopping list. Both are useful, but they answer different questions.

**Learner-created frozen manifest:** The learner used the automatic freeze approach before the Git checkpoint. `requirements.txt` now records the exact active environment: `asgiref==3.12.1`, `Django==5.2.16`, `djangorestframework==3.16.1`, `pillow==12.3.0`, `sqlparse==0.5.5`, and `tzdata==2026.3`. Django, DRF, and Pillow are the direct project dependencies; asgiref, sqlparse, and tzdata are resolved supporting dependencies. This exact manifest favours repeatable installation. Future dependency upgrades must deliberately regenerate and review the frozen versions rather than editing the environment without updating the file.

### Step 3F: Register accounts in Django's app registry

The `accounts` Python package and its models now exist, but Django does not automatically treat every folder as an application. This block connects the app to the project through `INSTALLED_APPS`.

#### 1. Purpose

Register `accounts` so Django loads its `AccountsConfig`, discovers `accounts/models.py`, includes its models in system checks and migrations, and can later connect its admin, signals, and other app-level features. Registration makes Django aware of the app; it does not create database tables.

#### 2. Location

The change belongs in the project-configuration layer inside `INSTALLED_APPS` in `config/settings.py`. `config` controls the whole Django project, while `accounts/apps.py` already defines the app-specific `AccountsConfig` class that the setting will reference.

#### 3. Important execution path

The startup path is `manage.py command -> DJANGO_SETTINGS_MODULE selects config.settings -> Django reads INSTALLED_APPS -> imports accounts.apps.AccountsConfig -> AccountsConfig names the accounts package -> Django imports accounts.models -> Household and UserProfile enter the app registry -> system checks and migration discovery can inspect them`.

#### 4. Main business rules

- Register the explicit dotted path `accounts.apps.AccountsConfig` once.
- Keep the entry inside the `INSTALLED_APPS` list and include its trailing comma.
- Place the local app after Django's built-in `django.contrib.*` apps so the list remains easy to scan.
- Registration enables discovery but does not create or apply a migration.
- The descriptive role remains separate from permissions; app registration does not change that boundary.

#### 5. Common failure cases

- A misspelled dotted path raises an import or module-not-found error during Django startup.
- Placing the string outside the list leaves the app unregistered or creates invalid Python.
- Omitting quotes makes Python treat the dotted path as code rather than text.
- Registering the app twice can create duplicate app-label errors.
- Running migrations before reviewing the generated migration can hide an unintended database design.
- Without Pillow, Django would report an `ImageField` system-check error; the learner has already installed Pillow 12.3.0 in the project environment.

#### 6. Checks and later tests

After the edit, first use Python syntax and Git whitespace checks. Then run `python manage.py check`. A successful Django check should report `System check identified no issues (0 silenced).` That proves Django can load the registered app and its current models without a detected configuration error. It does not create a migration, create tables, or prove model business behaviour. Migration inspection and model tests remain later blocks.

#### 7. Learner modification

From the MoneyMatters project root, open the settings file:

```powershell
code config/settings.py
```

Find `INSTALLED_APPS`. Directly below `'django.contrib.staticfiles',` and before the closing `]`, add:

```python
    'accounts.apps.AccountsConfig',
```

Save with `Ctrl+S`. Do not run Django yet. The AI will inspect the location, spelling, indentation, comma, and surrounding list before explaining the learner-run verification commands.

**Analogy:** Creating the `accounts` folder built a new department and gave it a manager named `AccountsConfig`. `INSTALLED_APPS` is the building's official department directory. Until the new department is listed there, Django's building manager does not visit it, inspect its models, or include it in project operations.

**Learner modification review:** The learner added `'accounts.apps.AccountsConfig',` directly after Django's built-in apps and before the closing `INSTALLED_APPS` bracket. Read-only inspection confirmed the dotted path, quotes, indentation, trailing comma, and list placement are correct. The edit is ready for learner-run syntax and Django checks.

#### Learner question: Why are we registering AccountsConfig when we did not add it to models.py?

`AccountsConfig` is not a model and does not belong in `accounts/models.py`. Django created it automatically in `accounts/apps.py` when `python manage.py startapp accounts` generated the app scaffold:

```python
from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
```

Read the dotted path `accounts.apps.AccountsConfig` from left to right: `accounts` is the Python package, `apps` is the `apps.py` module inside it, and `AccountsConfig` is the class defined in that module. `INSTALLED_APPS` imports this class first. Its `name = 'accounts'` setting identifies the package whose models Django should then discover.

`AccountsConfig` provides metadata and startup configuration for the whole app. `Household` and `UserProfile` represent database data, so they belong separately in `models.py`. The project-level package also happens to be named `config`, but that is different from Django's generic term “app config” and from the specific `AccountsConfig` class.

**Analogy:** `models.py` contains the department's forms and records. `AccountsConfig` is the department manager's registration card, created when the department was scaffolded. `INSTALLED_APPS` lists that manager's full address so Django knows which department to open and inspect.

**Learner understanding correction:** The learner initially understood `accounts.apps.AccountsConfig` as pointing directly to the models. The path actually points to the `AccountsConfig` class inside `accounts/apps.py`, not to `models.py`. Django loads that class, reads `name = 'accounts'` to identify the app package, builds the app registry, and then imports the app's models as part of setup. The models are reached indirectly through Django's app-loading process.

**Learner understanding check passed:** The learner correctly identified that `AccountsConfig` is located in the `accounts` folder inside `apps.py`. The filename is plural: `apps.py`. The learner is ready to resume verification of the `INSTALLED_APPS` change.

**Learner-run settings syntax verification:** The learner ran `python -m py_compile config/settings.py` and reported that it passed with no output. This proves Python can parse the updated settings file without a syntax or indentation error. It does not prove that the dotted app path can be imported or that Django can load the models; the Django system check is required next.
