# MoneyMatters Chronological Learning Record

This file records lessons, questions, explanations, commands, errors, corrections, learner actions, and verification results in the order they occur. Permanent project context, technology choices, architecture, and teaching rules belong in [TEACH.md](TEACH.md); detailed product requirements belong in [PRD.md](PRD.md); changing implementation progress belongs in [STATUS.md](STATUS.md).

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

**Learner-run Django system check:** The learner ran `python manage.py check` and reported no issues. This proves Django could load `config/settings.py`, import `AccountsConfig`, discover `Household` and `UserProfile`, and accept the Pillow-backed `ImageField` without a detected system-check error. It does not create a migration, create database tables, or test the models' business behaviour.

### Step 3G: Generate the initial accounts migration

The registered models currently exist only as Python declarations. This block asks Django to translate their intended database structure into a reviewable migration file. It deliberately generates the plan without applying it to the database.

#### 1. Purpose

Create the first migration for `accounts`. A migration is version-controlled Python code describing how the database schema should change. It lets Django reproduce and track the `Household` and `UserProfile` tables consistently across development, testing, and deployment environments.

#### 2. Location

Django will create a numbered file inside `accounts/migrations/`, normally `0001_initial.py`. This is the schema-migration layer: it sits between model declarations and the physical database. It belongs with the app because it describes the database history of the `accounts` app.

#### 3. Important execution path

The generation path is `manage.py -> load registered apps and models -> read existing migration history -> compare model state with migration state -> build migration operations -> write accounts/migrations/0001_initial.py`. The later application path is separate: `migrate command -> read migration operations -> generate SQL -> change database schema`.

#### 4. Main business rules

- Generate a migration only after Django's system check passes.
- Scope this command to `accounts` so the learning step remains focused.
- Review the generated operations before applying them.
- Commit migration files because they are shared project history, not disposable local output.
- Do not edit the database manually to imitate the migration.
- `makemigrations` creates a plan; `migrate` performs the plan. They must not be confused.

#### 5. Common failure cases

- An unregistered app can produce “No installed app with label” or no detected changes.
- A model import or field error prevents migration generation.
- Running `migrate` immediately without inspection can apply an unintended schema.
- Deleting or casually editing migration files later can break environments that have already applied them.
- Assuming the generated file proves the database changed confuses schema planning with schema execution.

#### 6. Checks and later tests

Expected output should identify `accounts/migrations/0001_initial.py` and list operations creating `Household` and `UserProfile`. After generation, inspect the entire migration, its dependency on Django's configured user model, every created field, relationship, option, and delete rule. Git's whitespace check and a second Django system check can verify file quality, but only the later `migrate` step and model tests will prove database execution and behaviour.

#### 7. Learner terminal action

From the MoneyMatters project root with `.venv` active, run:

```powershell
python manage.py makemigrations accounts
```

`python` selects the active project interpreter. `manage.py` loads MoneyMatters' Django settings. `makemigrations` compares registered model state with migration history and writes a migration plan. `accounts` limits generation to this app. This command changes the repository by creating a Python migration file, but it does not apply SQL or modify the database. Paste the complete output and do not run `migrate` yet.

**Analogy:** The models are an architect's finished design. `makemigrations` turns the design into numbered construction instructions and files the blueprint with the project. `migrate` is the separate future step where builders follow those instructions and alter the building. We inspect the blueprint before calling the builders.

**Learner-run migration generation:** The learner ran `python manage.py makemigrations accounts`. Django created `accounts/migrations/0001_initial.py` and reported two operations: create `Household` and create `UserProfile`. This is the expected initial schema plan. The command created a repository file but did not apply the plan to the database.

#### Initial migration inspection

Read-only inspection confirmed that the generated file:

- is marked `initial = True`;
- depends on `settings.AUTH_USER_MODEL` through `migrations.swappable_dependency`, ensuring the configured Django user table exists before `UserProfile` is created;
- creates `Household` with its automatically generated primary key, name, currency, fiscal-year month, creation timestamp, and name ordering;
- creates `UserProfile` with its generated primary key, descriptive-role choices and default, optional avatar reference, household foreign key, and user one-to-one relationship;
- preserves both `CASCADE` deletion behaviours and the `members` and `profile` reverse names;
- contains no Git-detected whitespace errors.

The migration does not include a `UserProfile` ordering option because the current `accounts/models.py` does not define one. It also does not create a separate database field for the nested `Role` class: Django expands those choices into the `descriptive_role` field definition. No database table exists from this file until a later approved `migrate` command applies it.

### Step 3H: Apply the initial accounts migration

The initial migration has been generated and reviewed. This block applies that approved schema plan to the local development database.

#### 1. Purpose

Create the physical database tables represented by `Household` and `UserProfile`, including their columns, relationships, uniqueness rule, and deletion behaviour. Applying the migration also records `accounts.0001_initial` in Django's migration-history table so Django knows the schema step has been completed.

#### 2. Location

The migration source remains in `accounts/migrations/0001_initial.py`. The resulting schema and migration-history record belong to the configured local database, currently `db.sqlite3`. This is the database layer: unlike `makemigrations`, this step changes local database state rather than creating another source blueprint.

#### 3. Important execution path

The application path is `manage.py -> load config.settings -> connect to configured database -> migration executor reads accounts.0001_initial and its auth dependency -> generate database-specific SQL -> run operations in dependency order -> create accounts tables and constraints -> record migration as applied in django_migrations`.

#### 4. Main business rules

- Apply only a migration that has been generated, inspected, and accepted.
- Use the project virtual environment and configured development database.
- Scope this learning command to `accounts`; Django will still respect any required dependencies.
- Do not manually edit an applied migration merely to change future schema; create a new migration for later model changes.
- Treat migration output as evidence and record it before continuing.
- Remember that database tables enable persistence but do not prove model business rules or access isolation.

#### 5. Common failure cases

- Running against the wrong settings or database can alter unintended data.
- A locked SQLite database can prevent schema changes.
- Inconsistent or manually edited migration history can cause dependency or “table already exists” errors.
- Interrupting a migration can require careful investigation before retrying.
- Assuming successful table creation means security and validation are tested would be unsafe.

#### 6. Checks and later tests

Expected output is `Applying accounts.0001_initial... OK`. Afterward, a learner-run migration-status command should show `[X] 0001_initial`, and `python manage.py check` should still report no issues. Later model tests must prove defaults, relationships, uniqueness, reverse names, choice display, and deletion behaviour. API tests will separately prove household isolation.

#### 7. Learner terminal action

From the MoneyMatters project root with `.venv` active, run:

```powershell
python manage.py migrate accounts
```

`python` selects the active interpreter. `manage.py` loads MoneyMatters settings. `migrate` executes database migration operations. `accounts` scopes the target to this app while Django preserves dependency order. This command changes the local `db.sqlite3` schema and migration-history rows; it does not edit model or migration source files. Paste the complete output and stop if any error appears.

**Analogy:** `0001_initial.py` is the inspected construction blueprint. `migrate accounts` gives that blueprint to the builders, who construct the two database rooms and stamp the project ledger to show blueprint 0001 has been completed.

**Learner-run migration result:** The learner ran `python manage.py migrate accounts`. Django reported `No migrations to apply` instead of applying `accounts.0001_initial`. This is not a command failure. It means the configured `db.sqlite3` migration-history table already records the migration name as applied, likely because the local database survived an earlier version of the accounts work while the source migration file was later removed and recreated.

Do not delete the database, remove migration-history rows, use `--fake`, or edit the migration to force execution. First inspect the recorded state with `showmigrations`, then separately confirm that the expected physical tables exist. Migration history and database schema are related evidence but are not the same fact.

#### Learner diagnostic: inspect accounts migration history

From the MoneyMatters project root with `.venv` active, run:

```powershell
python manage.py showmigrations accounts
```

`showmigrations` reads Django's migration graph and the configured database's migration-history records without changing either one. `accounts` limits the display to this app. `[X] 0001_initial` means the database history marks it as applied; `[ ] 0001_initial` means it is known but unapplied. This command does not create, remove, or modify tables. Paste the complete output before any recovery decision is considered.

**Learner-run migration-history result:** The learner ran `python manage.py showmigrations accounts` and received `[X] 0001_initial`. This confirms `db.sqlite3` contains an applied-migration record for `accounts.0001_initial`. It does not yet prove the `accounts_household` and `accounts_userprofile` tables exist or match the current model fields.

#### Learner diagnostic: inspect physical database tables

From the MoneyMatters project root with `.venv` active, run:

```powershell
python manage.py shell -c "from django.db import connection; print(connection.introspection.table_names())"
```

`shell` starts Django with the MoneyMatters settings and app registry loaded. `-c` runs the quoted Python statement and exits. `from django.db import connection` obtains Django's configured database connection. `connection.introspection.table_names()` asks the database for its table names, and `print(...)` displays them. “Introspection” means examining a system's structure without changing it. The command is read-only; it does not create, delete, or update tables or rows.

The output should include `accounts_household` and `accounts_userprofile`. Paste the complete list. If either table is missing, stop; migration history and physical schema would be inconsistent and require a separate recovery plan.

**Learner terminal correction:** The learner accidentally entered the previous output line, `[X] 0001_initial`, as a new PowerShell command. PowerShell returned a `ParserError` because migration-status output is not executable syntax. The error occurred before Python, Django, or SQLite ran, so it did not change project files, migration history, or database state. Output should be copied into the chat for review, not re-entered at the terminal prompt unless it is explicitly presented as a command.

**Learner-run table introspection result:** The learner ran the Django table-introspection command. The output included both `accounts_household` and `accounts_userprofile`, together with Django's built-in auth, admin, content-type, migration, and session tables. This confirms the physical accounts tables exist. The message `8 objects imported automatically` is normal Django shell startup information and is not an error.

Table presence alone does not prove that a retained table has the same columns as the recreated migration. Inspect the higher-risk `accounts_userprofile` table next:

```powershell
python manage.py shell -c "from django.db import connection; cursor = connection.cursor(); print([column.name for column in connection.introspection.get_table_description(cursor, 'accounts_userprofile')])"
```

`connection.cursor()` opens a database cursor, which is an object Django uses to communicate with the database. `get_table_description(...)` asks SQLite for the named table's column descriptions without changing it. The list comprehension `[column.name for column in ...]` extracts only each column name, and `print` displays the resulting list. This command is read-only.

The expected profile columns are `id`, `descriptive_role`, `avatar`, `household_id`, and `user_id`. A missing or additional column would require investigation before model tests or further schema work.

**Schema mismatch discovered:** Learner-run introspection returned `id`, `display_name`, `descriptive_role`, `permission_role`, `avatar_url`, `household_id`, and `user_id`. The retained table does not match the recreated `0001_initial.py`: it contains three columns from an older profile design and lacks the current `avatar` column. Django reports no pending migration because its history identifies migrations only by app label and migration name; the database already records `accounts.0001_initial`, even though the earlier file with that name described a different schema.

Do not run model tests, create another automatic migration, delete the database, edit `django_migrations`, or use `--fake`. First determine whether the retained accounts and user tables contain data that must be preserved. A disposable empty development database can usually be rebuilt cleanly; a database containing learner or user data requires a preservation plan.

From the MoneyMatters project root with `.venv` active, run this read-only count diagnostic:

```powershell
python manage.py shell -c "from accounts.models import Household, UserProfile; from django.contrib.auth import get_user_model; print({'households': Household.objects.count(), 'profiles': UserProfile.objects.count(), 'users': get_user_model().objects.count()})"
```

The imports load the two accounts models and Django's configured user model. Each `.objects.count()` asks the database for a row count without loading or changing the rows. The dictionary labels the three results. Because SQL `COUNT(*)` does not select every profile field, the missing `avatar` column should not prevent this diagnostic. If an error appears, paste it in full and stop. The counts determine whether a reset can even be considered; they do not authorize deletion.

**Learner-run data count result:** The learner reported `households: 0`, `profiles: 0`, and `users: 1`. The stale accounts tables contain no rows, but the database is not entirely disposable because Django's auth table contains one user. A whole-database deletion would unnecessarily destroy that user. The repair must target only the empty accounts tables and preserve the auth tables.

### Step 3I: Repair the empty stale accounts schema while preserving the user

Read-only migration-file inspection found no other project migration depending on `accounts`. `db.sqlite3` is ignored by Git and is 147,456 bytes. The safe recovery is to create a recoverable copy of the database, reverse only the empty accounts migration, confirm the auth user remains, and reapply the reviewed current migration.

#### 1. Purpose

Replace the mismatched empty `accounts_household` and `accounts_userprofile` tables with tables built from the current reviewed `0001_initial.py`, while preserving the existing `auth_user` row and all unrelated Django tables.

#### 2. Location

All destructive schema work is limited to the configured local `db.sqlite3` and the two accounts tables recorded under `accounts.0001_initial`. A separate ignored backup file beside the database provides recovery. Model and migration source files are not rewritten during the database repair.

#### 3. Important execution path

The recovery path is `verify backup name is unused -> copy db.sqlite3 -> unapply accounts to zero -> Django drops only the empty accounts tables and removes their migration-history record -> confirm auth user remains -> apply current accounts.0001_initial -> inspect corrected columns -> run Django checks`.

#### 4. Main business rules

- Never begin the destructive unapply step without a verified database backup.
- Proceed only because both accounts tables contain zero rows.
- Preserve the existing auth user and all unrelated Django tables.
- Do not delete the complete database, edit `django_migrations`, use `--fake`, or write manual SQL.
- Stop immediately on any unexpected output or count.
- Keep the backup until the rebuilt schema and preserved user are verified.

#### 5. Common failure cases

- Reusing a backup filename could overwrite the recovery copy.
- Targeting the wrong database or app could destroy unrelated data.
- A dependent migration could expand the unapply scope; repository inspection found none, but Django's printed plan must still be read before accepting the result.
- A locked or interrupted SQLite operation can stop the repair.
- Skipping the post-unapply user count could hide unintended auth data loss.

#### 6. Checks and later tests

Verify the backup exists and has a nonzero size before unapplying anything. Expected unapply output is `Unapplying accounts.0001_initial... OK`. Then confirm `users` remains 1 and the two accounts tables are absent. Expected reapply output is `Applying accounts.0001_initial... OK`. Finally confirm the corrected profile columns are `id`, `descriptive_role`, `avatar`, `household_id`, and `user_id` and rerun Django's system check.

#### 7. Learner terminal action: verify a safe backup destination

The first action is read-only. From the MoneyMatters project root, run:

```powershell
Test-Path -LiteralPath .\db.before-accounts-rebuild-20260815.sqlite3
```

`Test-Path` asks whether a filesystem item exists. `-LiteralPath` treats the exact supplied name without wildcard interpretation. `False` means the backup destination is unused and safe for the next copy step. `True` means stop and choose another name; do not overwrite it. This command changes nothing.

**Analogy:** Two empty rooms were built from an outdated blueprint, while a valuable person remains elsewhere in the building. We first photocopy the building records, then demolish and rebuild only the two empty rooms. We do not demolish the whole building merely because those rooms are wrong.

#### Learner question: Is this mismatch normal for a new Django app, or did it happen because an earlier AI-generated backend already existed?

This is not normal for a genuinely new app using a clean database. In the normal path, Django generates `0001_initial.py`, applies that exact file once, and the migration history and physical tables match.

Here, an earlier version of the backend had already applied a different `accounts.0001_initial` containing fields such as `display_name`, `permission_role`, and `avatar_url`. Later, the source app and migration were removed, reverted, or recreated during the guided reset, but the ignored local `db.sqlite3` survived. The recreated migration reused the same app label and migration name, so Django saw the old `(accounts, 0001_initial)` history record and assumed the new file had already run.

The earlier AI-written schema contributed the old table design, but the underlying technical cause is persistent database state becoming inconsistent with rewritten migration-source history. Django cannot compare a previously applied migration file's old contents with a newly recreated file of the same name because its database history records the app and migration name, not a full copy of every operation. Preserving source migrations together with database history—or deliberately rebuilding a disposable development database during a reset—prevents this situation.

**Learner-run backup-name check:** `Test-Path -LiteralPath .\db.before-accounts-rebuild-20260815.sqlite3` returned `False`. The proposed backup destination does not exist, so the next copy command will create a new recovery file rather than overwrite an earlier backup.

From the MoneyMatters project root, create the backup:

```powershell
Copy-Item -LiteralPath .\db.sqlite3 -Destination .\db.before-accounts-rebuild-20260815.sqlite3 -ErrorAction Stop
```

`Copy-Item` copies a filesystem item. `-LiteralPath` identifies the exact source database without wildcard expansion. `-Destination` supplies the already-checked unused backup name. `-ErrorAction Stop` makes PowerShell stop immediately if copying fails instead of continuing after a non-terminating error. The command creates a separate backup file but does not modify the original database or its tables. Success normally produces no output; any error must be pasted in full and no recovery command should follow it.

**Learner-run backup copy:** The learner ran the exact `Copy-Item` command and PowerShell returned to the prompt with no output, indicating that no copy error was reported. File existence alone is not enough for a destructive recovery checkpoint; compare cryptographic hashes to prove the backup contains the same bytes as the original database.

```powershell
Get-FileHash -Algorithm SHA256 .\db.sqlite3, .\db.before-accounts-rebuild-20260815.sqlite3 | Select-Object Path, Hash
```

`Get-FileHash` reads each file and calculates a fingerprint. `-Algorithm SHA256` selects a strong fingerprint algorithm. The comma supplies both exact file paths, the pipeline sends both results to `Select-Object`, and `Path, Hash` limits display to the identifying fields. The command is read-only. Both printed hashes must match exactly before unapplying the accounts migration; a missing file, error, or different hash means stop.

#### AI-assisted recovery completed at the learner's request

The learner explicitly asked the AI to complete the recovery so coding could continue. This is an allowed exception to learner-owned terminal practice; hands-on command ownership returns to the learner after the recovery.

The first automated attempt verified the backup hash but stopped before any database change because the automation shell's plain `python` command was not using the activated project virtual environment and could not import Django. The stop condition worked correctly. The AI then validated and used the exact project interpreter at `.venv\Scripts\python.exe`.

The completed recovery produced the following evidence:

- The original database and backup had the same SHA-256 hash.
- Pre-recovery counts were zero households, zero profiles, and one auth user.
- `accounts.0001_initial` unapplied successfully.
- Immediately afterward, no `accounts_*` tables remained and the auth user count was still one.
- The reviewed current `accounts.0001_initial` reapplied successfully.
- Post-rebuild counts remained zero households, zero profiles, and one auth user.
- `accounts_userprofile` now contains exactly `id`, `descriptive_role`, `avatar`, `household_id`, and `user_id`.
- `python manage.py check` reported `System check identified no issues (0 silenced).`

The recovery backup `db.before-accounts-rebuild-20260815.sqlite3` remains available and should not be deleted until a later cleanup decision after additional model tests. The schema mismatch is resolved without losing the existing auth user.

### Step 4A: Test Household default values

The database schema now matches the current models. Begin behaviour testing with one focused rule: a household created without explicit currency or fiscal-year values should receive the model defaults.

#### 1. Purpose

Prove that `Household.base_currency` defaults to `"GBP"` and `Household.fiscal_year_start_month` defaults to `1`. These defaults are part of the product behaviour, so a future model edit should not change them silently.

#### 2. Location

The test belongs in `accounts/tests.py`, in the test layer of the `accounts` app. The model definition remains in `accounts/models.py`; the separate test file creates controlled examples and checks observable behaviour without adding production behaviour to the model itself.

#### 3. Important execution and data path

The path is `Django test runner -> create isolated test database -> apply migrations -> run test method -> Household.objects.create sends an INSERT -> omitted fields receive model defaults -> ORM returns Household object -> assertions compare actual values with expected rules -> test database is discarded`. The normal development database and its existing user are not used by `TestCase`.

#### 4. Main business rules

- A new household still requires a name.
- Omitting `base_currency` should produce `"GBP"`.
- Omitting `fiscal_year_start_month` should produce integer `1`.
- Tests must be repeatable and independent of existing local rows.
- This test checks defaults only; it does not prove currency-code validation or that the month is restricted to 1–12.

#### 5. Common failure cases

- A method not beginning with `test_` will not be discovered by Django's test runner.
- Incorrect indentation can place the method outside the test class.
- Forgetting to import `Household` causes a name error.
- Comparing the month with string `"1"` instead of integer `1` tests the wrong type.
- Using the normal database manually would make tests depend on local data; `TestCase` provides isolation.

#### 6. What the test should prove

The focused test should pass only when both defaults match. If either default changes, `assertEqual` should report the expected and actual values. A passing result proves object creation and these two defaults work in the migrated test database. It does not yet test `__str__`, ordering, timestamps, field validation, relationships, or deletion behaviour; those remain separate blocks.

#### 7. AI implementation and learner review

The learner has asked the AI to enter approved code rather than requiring copy-and-paste. The AI will replace the boilerplate in `accounts/tests.py` with this focused block after the seven-step explanation:

```python
from django.test import TestCase

from .models import Household


class HouseholdModelTests(TestCase):
    def test_default_values(self):
        household = Household.objects.create(name="Smith Household")

        self.assertEqual(household.base_currency, "GBP")
        self.assertEqual(household.fiscal_year_start_month, 1)
```

`from .models` uses a relative import: the leading dot means “from the current `accounts` package.” `HouseholdModelTests` groups tests for this model. Django discovers `test_default_values` because its name begins with `test_`. `objects.create` inserts one row into the isolated test database. Each `assertEqual` compares an actual value on the left with the expected business rule on the right.

The AI will inspect and show the resulting block. The learner will retain hands-on terminal ownership by running the explained focused test command and reporting its output.

**Analogy:** The model is a factory design. This test places one sample order without specifying currency or fiscal month, then checks whether the factory automatically attaches the correct `GBP` and January labels. Django conducts the inspection in a temporary workshop and clears it afterward.

**Teaching preference update:** The learner requested that the AI enter code directly instead of asking the learner to copy and paste it. The mandatory seven-step explanation and learner review remain in place. The learner continues to run lesson-related terminal commands unless they explicitly request assistance.

**Learner-run defaults test:** The learner ran `python manage.py test accounts.tests.HouseholdModelTests.test_default_values` and reported that it ran successfully with `OK`. This proves Django created an isolated migrated test database, inserted a household, and observed the expected `"GBP"` and integer `1` defaults. It does not test the learner's normal `db.sqlite3` or any other Household behaviour.

### Step 4B: Test Household string representation

#### 1. Purpose

Prove that converting a `Household` object to text returns its real name. Readable object text improves Django admin choices, shell output, logs, and debugging compared with a generic value such as `Household object (1)`.

#### 2. Location

The test method belongs inside `HouseholdModelTests` in `accounts/tests.py`. It tests the `Household.__str__` production method in `accounts/models.py`; it does not add another model or database field.

#### 3. Important execution and data path

The path is `test creates Household -> test calls str(household) -> Python looks for household.__str__ -> __str__ returns self.name -> assertEqual compares returned text with the expected household name`.

#### 4. Main business rules

- The displayed text must be the household's actual name.
- `__str__` must return a Python string.
- Different household names should produce their corresponding text rather than a hardcoded label.
- This representation improves readability but does not register the model in Django admin.

#### 5. Common failure cases

- Misspelling the special method prevents Python from calling it through `str()`.
- Returning an ID or hardcoded label hides the meaningful household name.
- Returning a non-string value raises a `TypeError` when Python requests text.
- Testing only a generic object representation would fail to protect the product's readable naming rule.

#### 6. What the test should prove

The test should pass when `str(household)` equals `"Smith Household"` and fail if `__str__` stops returning `self.name`. It does not test alphabetical ordering, name validation, timestamps, relationships, or admin registration.

#### 7. AI implementation and learner review

With `accounts/tests.py` open and the learner's approval, the AI adds this focused method inside the existing `HouseholdModelTests` class:

```python
    def test_string_representation(self):
        household = Household.objects.create(name="Smith Household")

        self.assertEqual(str(household), "Smith Household")
```

The learner will review the resulting file and run the focused test command personally.

**Analogy:** A database ID is like a warehouse serial number, while the household name is the label a person expects to read. `__str__` prints the useful label, and the test checks that the correct label remains attached.

**Learner-run string-representation test:** The learner ran `python manage.py test accounts.tests.HouseholdModelTests.test_string_representation` and reported that it passed. This proves `str(household)` calls `Household.__str__` and returns the household's actual name in an isolated migrated test database. It does not test admin registration or other Household behaviour. This completes the final coding verification for the session.

### Step 4C: Test the UserProfile default role

#### 1. Purpose

Prove that a new `UserProfile` receives the `SECONDARY` descriptive role when no role is supplied. This protects a deliberate product default from being changed accidentally.

#### 2. Location

The test belongs in `accounts/tests.py` in a new `UserProfileModelTests` class. It checks the default declared by the `UserProfile.descriptive_role` field in `accounts/models.py`.

#### 3. Important execution and data path

The path is `Django test runner -> isolated test database -> create Django user -> create Household -> create UserProfile linked to both -> model supplies the omitted role default -> assertion compares the stored value with UserProfile.Role.SECONDARY -> discard test database`.

#### 4. Main business rules

- Every profile must be linked to one Django user.
- Every profile must belong to one household.
- When `descriptive_role` is omitted, it must default to `SECONDARY`.
- The test should use `UserProfile.Role.SECONDARY` rather than repeating the raw string so it refers to the model's named choice.
- One user cannot have two profiles because the user relationship is one-to-one.

#### 5. Common failure cases

- Creating a profile without a user or household violates required relationships.
- Importing Django's concrete `User` class directly can make the test incompatible with a future custom user model.
- Reusing the same user for another profile would violate the one-to-one constraint.
- Comparing against the human-readable label `"Secondary User"` would test the display label rather than the stored value `"SECONDARY"`.

#### 6. What the test should prove

A pass proves that Django can create the required related objects and that an omitted `descriptive_role` becomes `UserProfile.Role.SECONDARY` in the isolated test database. It does not prove the other role choices, display labels, reverse relationships, uniqueness error behaviour, or deletion rules.

#### 7. AI implementation and learner review

After the learner opens `accounts/tests.py`, the AI will add the required imports and this focused test class:

```python
class UserProfileModelTests(TestCase):
    def test_default_role(self):
        user = get_user_model().objects.create_user(username="alex")
        household = Household.objects.create(name="Smith Household")
        profile = UserProfile.objects.create(user=user, household=household)

        self.assertEqual(profile.descriptive_role, UserProfile.Role.SECONDARY)
```

`get_user_model()` asks Django for the currently configured user model. `create_user` creates a valid test user. The household supplies the required parent relationship. The profile omits `descriptive_role` deliberately so the assertion can observe the default.

The learner will review the resulting diff and personally run:

```powershell
python manage.py test accounts.tests.UserProfileModelTests.test_default_role
```

**Analogy:** Creating the profile is like submitting a membership form with the required person and household filled in but leaving the role box empty. The system should apply its agreed `SECONDARY` label automatically, and the test checks that label before discarding the temporary paperwork.

**Learner-run default-role test:** The learner ran `python manage.py test accounts.tests.UserProfileModelTests.test_default_role`. Django found one test, created an isolated test database, reported no system-check issues, ran the test successfully, and destroyed the temporary database. The passing result proves that a profile linked to a valid user and household receives the stored role `UserProfile.Role.SECONDARY` when `descriptive_role` is omitted. It does not prove the other role choices, display labels, relationship constraints, reverse lookups, or deletion behaviour.

### If I were writing the code myself, would I always need to write automated tests?

No separate test is required for every line of code. Tests should protect meaningful behaviour: something the application promises to users or something that would cause a real problem if it broke.

Important examples in MoneyMatters include:

- a household defaults to the expected currency and fiscal-year month;
- a profile defaults to the expected role;
- one user cannot accidentally receive multiple profiles;
- household relationships and deletion rules behave safely;
- one household cannot access another household's financial data;
- permissions prevent an unauthorised person from changing protected information;
- financial calculations produce correct results.

A simple import or assignment normally does not need its own test. It becomes covered naturally when a behaviour test executes the code that depends on it. Testing implementation details too narrowly can make tests noisy and fragile without protecting useful product behaviour.

Use this practical rule:

> If breaking the behaviour would affect users, money, permissions, saved data, security, or an explicit product requirement, protect it with an automated test.

During development, run the smallest focused test that covers the block being changed. Focused feedback is faster and makes a failure easier to understand. For example:

```powershell
python manage.py test accounts.tests.UserProfileModelTests.test_default_role
```

Before committing or pushing, run the complete relevant app suite so nearby behaviour is checked as well:

```powershell
python manage.py test accounts
```

Larger projects may also run the complete project suite automatically in continuous integration after a push. A passing focused test proves only its stated behaviour; it never means the whole application is correct.

Automated tests require a little extra work when a feature is written, but they become a repeatable safety net. Instead of manually checking the same rule after every future change, the computer can reproduce the setup, check the expected result, and report regressions consistently.

**Analogy:** A test is like a reusable smoke alarm. It does not prove that every possible danger is absent, and a separate alarm is not installed beside every object. It is placed where an important risk needs dependable warning, then checked repeatedly as the building changes.

**Learner-run accounts test suite:** The learner ran `python manage.py test accounts`. Django found three tests, created an isolated test database, reported no system-check issues, ran all three tests successfully, and destroyed the temporary database. This proves the two `Household` tests and the `UserProfile` default-role test pass together. It does not yet test profile relationships, uniqueness failures, deletion behaviour, API permissions, or household data isolation.

### Documentation responsibility clarified

The learner requested a clearer separation so future AI agents can be directed to one permanent onboarding document without treating the chronological lesson history as project policy.

- `docs/TEACH.md` now owns stable project context, the technology stack, the architectural execution path, document responsibilities, and the mandatory teaching method.
- `docs/LEARNING_GUIDE.md` now serves only as the chronological record of learning activity and outcomes.
- `docs/PRD.md` continues to own detailed product requirements.
- `docs/STATUS.md` continues to own the changing implementation state and next action.

All historical learning entries were preserved during this housekeeping change; only the duplicated introductory policy and project-summary sections were replaced with a concise scope statement.

### Step 4D: Test the UserProfile reverse relationships

#### 1. Purpose

Prove that the relationship names declared on `UserProfile` work in both reverse directions: a Django user can find their profile through `user.profile`, and a household can find its member profiles through `household.members`. Later authentication, API filtering, and household permissions will rely on these paths.

#### 2. Location

The test belongs inside `UserProfileModelTests` in `accounts/tests.py`. It tests the `related_name="profile"` and `related_name="members"` declarations in `accounts/models.py`. This is still the model-test layer; no production model field or database migration changes.

#### 3. Important execution and data path

The path is `Django test runner -> isolated test database -> create user -> create household -> create linked UserProfile -> user.profile follows the reverse one-to-one relation -> household.members queries the reverse foreign-key relation -> assertions compare both results with the created profile -> discard test database`.

#### 4. Main business rules

- A user must be able to reach their single profile through `user.profile`.
- A household must be able to reach its associated profiles through `household.members`.
- Both reverse paths must return the same saved profile created by the test.
- `profile` is singular because the user relationship is one-to-one.
- `members` is a related manager because one household can contain multiple profiles.

#### 5. Common failure cases

- Misspelling or changing a `related_name` breaks code that uses the agreed reverse path.
- Trying to use `household.members` as one object fails because it is a manager; a query such as `.get()` or `.all()` is required.
- Accessing `user.profile` before a profile exists raises `UserProfile.DoesNotExist`.
- Creating related objects only in memory without saving them would leave nothing for a reverse database query to find.
- A passing relationship test does not by itself prevent a future API from exposing another household's data.

#### 6. What the test should prove

A pass proves that both named reverse ORM paths resolve to the saved profile in Django's isolated test database. It does not prove multiple-member behaviour, duplicate-profile rejection, cascade deletion, API authentication, permissions, or household isolation.

#### 7. AI implementation and learner review

After the learner opens `accounts/tests.py`, the AI will add this focused method inside the existing `UserProfileModelTests` class:

```python
    def test_reverse_relationships(self):
        user = get_user_model().objects.create_user(username="alex")
        household = Household.objects.create(name="Smith Household")
        profile = UserProfile.objects.create(user=user, household=household)

        self.assertEqual(user.profile, profile)
        self.assertEqual(household.members.get(), profile)
```

The first assertion uses the singular reverse one-to-one attribute. The second calls `.get()` on the household's reverse related manager and confirms that its database query returns the same profile.

The learner will review the diff and personally run:

```powershell
python manage.py test accounts.tests.UserProfileModelTests.test_reverse_relationships
```

Run this command from the MoneyMatters project root with `.venv` active. `python` uses the active project interpreter, `manage.py test` starts Django's test runner, and the dotted path selects only this test method. It creates and destroys an isolated test database but does not modify the normal `db.sqlite3`, source files, dependencies, or Git history. Expected success output includes `Found 1 test(s)` and `OK`; paste any failure or traceback in full.

**Analogy:** The profile is a contact card filed in two indexes. Looking up the person should reveal their one card, while opening the household's member index should reveal the same card. This test checks both index labels before later features rely on them.

**Learner-run reverse-relationships test:** The learner ran `python manage.py test accounts.tests.UserProfileModelTests.test_reverse_relationships` and reported that the test completed with `OK` in 0.002 seconds before Django destroyed the isolated test database. This proves `user.profile` and `household.members.get()` both resolve to the saved `UserProfile`. It does not prove multiple-member behaviour, duplicate-profile rejection, cascade deletion, API permissions, or household data isolation.

**Reverse-relationships test restored and reverified:** At the start of the next session, repository inspection found that `docs/LEARNING_GUIDE.md` contained the earlier passing result but the uncommitted `test_reverse_relationships` method was no longer present in `accounts/tests.py`, likely because an older editor buffer had later replaced the file contents. The AI restored only the previously approved method. The learner reran the same focused command, and it completed with `OK` in 0.002 seconds before Django destroyed the isolated test database. The source and recorded verification are aligned again.

### Step 4E: Test household cascade deletion

#### 1. Purpose

Prove that deleting a `Household` removes its dependent `UserProfile` records while preserving the independent Django users. A profile cannot meaningfully remain attached to a household that no longer exists, but deleting a household must not silently delete login accounts.

#### 2. Location

The test belongs inside `UserProfileModelTests` in `accounts/tests.py`. It checks the `on_delete=models.CASCADE` rule on `UserProfile.household` in `accounts/models.py`. No production model or migration change is required.

#### 3. Important execution and data path

The path is `Django test runner -> isolated test database -> create user, household, and profile -> call household.delete() -> Django follows the household foreign key's CASCADE rule -> delete the dependent profile -> query for both original primary keys -> assertions confirm profile absent and user present -> discard test database`.

#### 4. Main business rules

- A profile cannot survive without its household.
- Deleting a household must cascade to every profile belonging to it.
- The linked Django user is not owned by the household foreign key and must remain.
- The test must query by saved primary keys after deletion instead of trusting an in-memory Python object.
- This behaviour is destructive and must be explicitly protected because future financial data will also be household-scoped.

#### 5. Common failure cases

- Changing the foreign key to another deletion rule can leave orphaned profiles or block deletion unexpectedly.
- Checking only the old in-memory `profile` variable does not prove its database row was deleted.
- Assuming cascade travels in both directions could lead someone to expect the user to be deleted incorrectly.
- Reusing `household.pk` after `delete()` is unreliable because Django clears the deleted object's primary key, so the test must save required IDs first.
- This focused test does not prove that deleting a user has the correct effect on their profile.

#### 6. What the test should prove

A pass proves that deleting the household removes the saved profile row and leaves the saved Django user row in the isolated test database. It does not prove deletion permissions, confirmation screens, audit history, recovery, API behaviour, or cascading rules for financial models that have not been created yet.

#### 7. AI implementation and learner review

After the learner opens `accounts/tests.py`, the AI will add this focused method inside `UserProfileModelTests`:

```python
    def test_deleting_household_deletes_profile_but_preserves_user(self):
        user = get_user_model().objects.create_user(username="alex")
        household = Household.objects.create(name="Smith Household")
        profile = UserProfile.objects.create(user=user, household=household)
        user_id = user.pk
        profile_id = profile.pk

        household.delete()

        self.assertFalse(UserProfile.objects.filter(pk=profile_id).exists())
        self.assertTrue(get_user_model().objects.filter(pk=user_id).exists())
```

The saved IDs let the test query database state after deletion. `.filter(...).exists()` performs an efficient true-or-false database check without requiring the deleted object to load successfully.

The learner will review the diff and personally run:

```powershell
python manage.py test accounts.tests.UserProfileModelTests.test_deleting_household_deletes_profile_but_preserves_user
```

Run this from the MoneyMatters project root with `.venv` active. The dotted path selects only this method. Django creates and destroys an isolated test database; the command does not delete anything from the normal `db.sqlite3`, change source files, install packages, or alter Git history. Expected success output includes `Found 1 test(s)` and `OK`; report any traceback in full.

**Analogy:** A household profile is like a membership card issued by a club. Closing the club invalidates and removes its membership cards, but it does not erase the people who once held them. The test checks both outcomes.

**Learner-run household cascade-deletion test:** The learner ran `python manage.py test accounts.tests.UserProfileModelTests.test_deleting_household_deletes_profile_but_preserves_user`. Django reported no system-check issues, ran the focused test successfully in 0.002 seconds, and returned `OK`. This proves that deleting a household removes its dependent profile while preserving the linked Django user in the isolated test database. It does not prove deletion permissions, confirmation, auditing, recovery, API behaviour, or deletion rules for future financial models.

#### Accounts model-test checkpoint

Five focused accounts tests now cover Household defaults, Household text representation, the UserProfile default role, both reverse relationship names, and the household-to-profile cascade rule that preserves the user. Before leaving this model-testing block, run all accounts tests together:

```powershell
python manage.py test accounts
```

Run this command from the MoneyMatters project root with `.venv` active. `python` selects the project interpreter, `manage.py test` starts Django's test runner, and `accounts` selects every discovered test in that app. Django creates and destroys an isolated test database; it does not alter the normal `db.sqlite3`, source files, dependencies, or Git history.

Expected success output includes `Found 5 test(s)`, five dots, and `OK`. A failure means the complete accounts set does not work together even if an individual focused test passed; paste the full traceback before proceeding to Django admin registration.

**Learner-run accounts model-test checkpoint:** The learner ran `python manage.py test accounts` and reported that all five tests passed. This confirms the Household default and text tests and the UserProfile default-role, reverse-relationship, and cascade-deletion tests work together in Django's isolated test database. It does not prove admin configuration, API behaviour, permissions, or household isolation.

### Step 5A: Register Household and UserProfile in Django admin

#### 1. Purpose

Register `Household` and `UserProfile` with Django's built-in admin site so authorised staff can inspect and manage their database records through `/admin/`. This creates an internal raw-management interface; it is not the future customer-facing React interface.

#### 2. Location

The registration belongs in `accounts/admin.py`, the accounts app's admin-configuration layer. Model definitions remain in `accounts/models.py`, and public API behaviour will later belong in serializers, views, and permissions rather than in this file.

#### 3. Important execution and data path

The path is `Django starts -> app registry imports accounts.admin -> admin.site.register stores both model classes in the admin registry -> authorised staff requests /admin/ -> Django admin reads the registry -> generates model pages -> admin actions use the Django ORM -> database changes are saved`.

#### 4. Main business rules

- Only authenticated users with staff permissions can enter Django admin.
- Register both models so their records are available to authorised administrators.
- Admin registration does not make the models publicly accessible through an API.
- The initial registration uses Django's default generated admin pages; custom lists, filters, search, and restrictions can be added in later focused blocks.
- Django admin is for internal raw management, while the planned React interface will provide safer product workflows.

#### 5. Common failure cases

- Forgetting to import a model causes a Python name error.
- Forgetting to register a model keeps it absent from the admin index.
- Registering the same model twice raises `AlreadyRegistered` when Django loads the app.
- Treating admin registration as household data isolation would be unsafe; API permissions still need separate implementation and testing.
- Allowing ordinary users staff access accidentally could expose sensitive financial information.

#### 6. What verification should prove

`python manage.py check` should prove Django can import `accounts.admin`, register both models once, and load the admin configuration without a detected system error. It does not prove that a particular user has staff permission, that the admin pages look correct, or that future household access restrictions work. A later admin-client or browser check can verify access and presentation.

#### 7. AI implementation and learner review

After the learner opens `accounts/admin.py`, the AI will replace its placeholder comment with:

```python
from django.contrib import admin

from .models import Household, UserProfile

admin.site.register(Household)
admin.site.register(UserProfile)
```

Line by line:

- `from django.contrib import admin` imports Django's built-in admin tools and the default admin site object.
- The blank line separates a framework import from the app's local model import.
- `from .models import Household, UserProfile` imports the two model classes from the current `accounts` package.
- The next blank line separates imports from executable registration statements.
- `admin.site.register(Household)` places the Household model in the default admin site's registry.
- `admin.site.register(UserProfile)` does the same for UserProfile.

After reviewing the diff, the learner will personally run:

```powershell
python manage.py check
```

Run this from the MoneyMatters project root with `.venv` active. `python` uses the project interpreter, `manage.py` loads the MoneyMatters settings, and `check` runs Django's configured system checks. The command reads and imports project code but does not change source files, dependencies, Git history, or database records. Expected output is `System check identified no issues (0 silenced).`; paste any error or traceback in full.

**Analogy:** The models are products stored in a warehouse, and the admin site is a staff-only inventory desk. Registration adds those product types to the desk's catalogue; it does not open the warehouse to the public.

**Learner-run admin system check:** After the AI registered `Household` and `UserProfile` in `accounts/admin.py`, the learner ran `python manage.py check`. Django reported `System check identified no issues (0 silenced).` This proves Django imported the admin configuration and accepted both registrations without a detected system error. It does not prove staff access, admin-page appearance, model permissions, or household isolation.

**Editor-command correction:** Before the successful check, the learner entered `code manage.py check`. The `code` command asks VS Code to open the following arguments as files or paths, so it does not run Django's system checks. The command was harmless and did not change the database or Git history. The correct execution command is `python manage.py check`: `python` runs `manage.py`, and `check` is then interpreted by Django as the system-check subcommand.

### Step 5B: Inspect existing admin access before creating another user

The local database previously contained one preserved Django user. Before considering `createsuperuser` or launching the admin login, inspect that user's access flags without changing any records.

Run from the MoneyMatters project root with `.venv` active:

```powershell
python manage.py shell -c "from django.contrib.auth import get_user_model; print(list(get_user_model().objects.values('username', 'is_staff', 'is_superuser')))"
```

Line by line and left to right:

- `python manage.py shell` starts a Django-aware Python shell using the MoneyMatters settings and database.
- `-c` tells the shell to run the quoted Python statement and exit.
- `from django.contrib.auth import get_user_model` imports the safe helper for retrieving the configured user model.
- `get_user_model().objects` accesses that model's database manager.
- `.values('username', 'is_staff', 'is_superuser')` asks only for the three named fields rather than passwords or complete user objects.
- `list(...)` executes the query and converts its rows into a printable list of dictionaries.
- `print(...)` displays the result.

This command is read-only: it does not create a user, change permissions, edit source files, install dependencies, or alter Git history. `is_staff: True` means the user may enter Django admin; `is_superuser: True` means the user bypasses ordinary per-model permission checks. If either required flag is false, stop before changing it. Paste the complete output, but never paste a password.

**Analogy:** Registering models stocked the staff inventory desk. This command checks whether the existing employee badge is authorised to enter that desk before issuing another badge.

**Learner-run admin-access inspection:** The learner ran the read-only Django shell query. It returned one existing user with both `is_staff: True` and `is_superuser: True`. The username is intentionally not repeated in this learning record. This proves the preserved local user has permission to enter Django admin and manage registered models, so creating another superuser or changing permission flags is unnecessary. It does not prove the learner remembers the password or that the admin pages render correctly.

### Step 5C: Launch Django and inspect the registered models in admin

Run the local Django development server from the MoneyMatters project root with `.venv` active:

```powershell
python manage.py runserver
```

- `python` uses the active project interpreter.
- `manage.py` loads the MoneyMatters settings and applications.
- `runserver` starts Django's development-only HTTP server, normally at `http://127.0.0.1:8000/`.
- Django performs system checks before accepting requests.
- The command keeps running and occupies that terminal until the learner presses `Ctrl+C`.

Expected startup output includes `System check identified no issues`, `Starting development server at http://127.0.0.1:8000/`, and a warning that this is a development server. Leave that terminal running, open `http://127.0.0.1:8000/admin/` in a browser, and sign in with the existing administrator credentials. Never paste the password into chat.

After login, the admin index should contain an `Accounts` section listing `Households` and `User profiles`. Seeing both proves that the earlier registration statements are reflected in Django's generated interface. It does not prove public API permissions or household isolation.

This command does not edit source files, install dependencies, change Git history, or create database records by itself. Logging in may update session-related database rows and the user's last-login timestamp. Stop and paste any terminal traceback, browser error, or unexpected page description. When finished inspecting, return to the server terminal and press `Ctrl+C` to stop it.

**Analogy:** The system check confirmed that the inventory desk was assembled correctly. `runserver` opens the building locally so the authorised employee can walk to the desk and confirm that both registered catalogues are visible.

#### Learner question: What should I do if I cannot remember the local Django administrator password?

Do not create a duplicate administrator and do not reveal or reuse a password from an important real account. Django provides the interactive `changepassword` management command for the existing local user.

If `runserver` is occupying the terminal, press `Ctrl+C` to stop it first. From the MoneyMatters project root with `.venv` active, run:

```powershell
python manage.py changepassword "<existing-username>"
```

Replace `<existing-username>` with the username shown by the earlier read-only query. Keep the quotation marks because the username may contain characters such as `@`.

- `python` uses the active virtual environment.
- `manage.py` loads the MoneyMatters settings and local database.
- `changepassword` selects Django's secure interactive password-change command.
- The final argument identifies the existing user whose password hash will change.
- Django prompts for the new password twice. PowerShell intentionally displays no characters while a password is typed; this is normal.

This command changes the password hash stored for that user in the local `db.sqlite3`. It does not reveal the old password, edit source files, create another user, install packages, or change Git history. Use a strong development password that is not reused for email, banking, GitHub, or another real service. Never paste either password into chat.

Expected success output ends with `Password changed successfully`. If Django says the user does not exist or the two entries do not match, paste only the error text, never the password. After success, restart `python manage.py runserver` and sign in at `http://127.0.0.1:8000/admin/` with the existing username and new local password.

**Analogy:** This replaces the local staff badge's secret code after verifying which badge already exists; it does not issue a second badge or recover the unreadable old code.

**Learner-run local admin password change:** The learner ran Django's interactive `changepassword` command for the existing local administrator and reported that it succeeded. No password value is recorded. This means the local password hash was replaced and the existing staff/superuser account can now be used for the browser verification. It does not change source code or Git history.

**Git Bash environment note:** The learner switched from PowerShell to Git Bash. When `(.venv)` is not already visible, the project environment is activated in Git Bash with `source .venv/Scripts/activate`; the Django server command remains `python manage.py runserver`. `Ctrl+C` stops the development server in either shell.

**Learner-run Django admin browser verification:** The learner started the local Django development server from Git Bash, signed in successfully with the existing local administrator, and confirmed that the admin index contains an `Accounts` section with both `Households` and `User profiles`. This proves the admin URL, session login, account access, model registration, and generated index presentation work together locally. Empty model lists are normal because no household or profile rows have been created. This does not prove public API behaviour, household isolation, customised admin presentation, or production deployment.

### Step 6A: Resolve the current household in request middleware

#### 1. Purpose

Create middleware that gives every request a predictable `request.household` attribute. For an authenticated user with a `UserProfile`, it resolves that profile's household. Anonymous visitors and authenticated users without a profile receive `None`. Later API views will use this value to restrict database queries to the current household.

This middleware is one part of the isolation boundary, not the complete security rule. Every household-owned API queryset must still explicitly filter by `request.household`.

#### 2. Location

The new class belongs in `accounts/middleware.py`, the request-processing layer of the accounts app. It does not belong in `models.py` because it does not define persistent data, and it does not belong in a view because the household must be resolved consistently before many different views execute.

The file does not exist yet. This block creates it but does not activate the middleware in `config/settings.py`; settings registration and middleware ordering will be a separate reviewed block after focused tests.

#### 3. Important execution and data path

The eventual path is `browser sends session cookie -> SessionMiddleware loads the session -> AuthenticationMiddleware sets request.user -> CurrentHouseholdMiddleware sets request.household to None -> authenticated user follows request.user.profile.household -> resolved Household is stored on request.household -> view executes -> viewset filters its queryset by request.household`.

The middleware must eventually be listed after `django.contrib.auth.middleware.AuthenticationMiddleware`. If it runs earlier, `request.user` has not been attached yet.

#### 4. Main business rules

- Every processed request receives a `household` attribute, even when no household can be resolved.
- An authenticated user with a profile receives that profile's household.
- An anonymous user receives `None` without causing an error.
- An authenticated user without a profile receives `None` without breaking Django admin or onboarding.
- Catch only the expected `UserProfile.DoesNotExist` condition; unrelated programming or database errors must remain visible.
- Middleware resolution does not authorise access by itself; later viewsets must filter household-owned records and reject missing household context where appropriate.

#### 5. Common failure cases

- Registering the middleware before AuthenticationMiddleware causes `request.user` access to fail.
- Assuming every authenticated user already has a profile would break the preserved superuser and incomplete onboarding accounts.
- Catching every exception would hide real defects and database failures.
- Leaving `request.household` undefined for anonymous users forces every later view to guess whether the attribute exists.
- Trusting a household ID supplied by the browser would allow users to request another household; resolution must follow the authenticated server-side profile.
- Stamping the request but forgetting queryset filtering would still permit cross-household data exposure.

#### 6. What the tests should prove

The next focused test block should prove three branches: an authenticated user with a profile receives the correct household, an authenticated user without a profile receives `None`, and an anonymous user receives `None`. It should also prove the wrapped response callable still runs. These tests will exercise the middleware directly before it is activated globally.

A syntax check in this block proves only that Python can parse the new file. It does not prove request behaviour, middleware ordering, settings registration, API filtering, or household isolation.

#### 7. AI implementation and learner review

After the learner opens `accounts/middleware.py`, the AI will create this class:

```python
from .models import UserProfile


class CurrentHouseholdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.household = None

        if request.user.is_authenticated:
            try:
                request.household = request.user.profile.household
            except UserProfile.DoesNotExist:
                pass

        return self.get_response(request)
```

Line by line:

- `from .models import UserProfile` imports the profile model from the current `accounts` package so the middleware can catch its specific missing-profile exception.
- Two blank lines separate the import section from the top-level class, following normal Python layout.
- `class CurrentHouseholdMiddleware:` defines the middleware class; the name describes the request value it resolves.
- `def __init__(self, get_response):` is called once when Django builds the middleware chain. `self` is this middleware instance, and `get_response` is the next callable in the chain.
- `self.get_response = get_response` stores that next callable so each request can continue after this middleware finishes its work.
- The blank line separates middleware setup from per-request behaviour.
- `def __call__(self, request):` makes the instance callable. Django invokes it for every request and supplies the current request object.
- `request.household = None` establishes a safe default so the attribute always exists.
- The blank line separates default setup from conditional resolution.
- `if request.user.is_authenticated:` checks the boolean-like authentication property attached by Django's AuthenticationMiddleware. The following block runs only for a logged-in user.
- `try:` starts a narrow operation that may fail only because the user has no related profile.
- `request.household = request.user.profile.household` follows the reverse one-to-one path from user to profile and then the foreign-key path from profile to household before storing the result on the request.
- `except UserProfile.DoesNotExist:` catches only the expected missing-profile condition raised by `request.user.profile`.
- `pass` intentionally leaves the earlier `None` default unchanged.
- The final blank line separates household resolution from continuation of the request chain.
- `return self.get_response(request)` passes the enriched request to the next middleware or view and returns its eventual HTTP response.

After reviewing the created file, the learner will run this syntax check from the MoneyMatters project root with `.venv` active:

```bash
python -m py_compile accounts/middleware.py
```

- `python` uses the active project interpreter.
- `-m py_compile` runs Python's built-in byte-compilation and syntax-check module.
- `accounts/middleware.py` is the exact file to parse.

Success normally produces no terminal output. The command may create ignored bytecode under `accounts/__pycache__/`, but it does not alter the normal database, install dependencies, or change Git history. A syntax or indentation problem produces a traceback with a filename and line number; paste it in full. Behaviour tests are required next even after this check passes.

**Analogy:** AuthenticationMiddleware checks the person's badge. CurrentHouseholdMiddleware then uses the badge to find the staff member's assigned building and writes that building on the request clipboard. A visitor or an employee awaiting assignment receives a blank building field rather than crashing the front desk. Every department must still check the clipboard before showing records.

### Teaching method correction: combine recap, analogy, seven steps, and line-by-line code explanation

#### Learner request

The learner asked: **“Can you update `TEACH.md` and the learning record so every lesson combines a recap, a clearly presented analogy, the seven teaching steps, and a line-by-line code explanation? Please recap the middleware lesson but do not implement it yet.”**

The middleware analogy had been written at the bottom of the recorded Step 6A entry, but the conversational seven-step summary omitted it. That separation made the live explanation harder to understand. An analogy stored only in documentation does not satisfy the learner's teaching method; it must be presented, mapped to the real code, and connected to the technical explanation during the conversation.

`docs/TEACH.md` was updated so every meaningful code block now follows this combined order:

- recap verified previous work and connect the new block;
- present a clearly labelled analogy directly in the conversation;
- map the analogy to the real components and state the real technical path;
- complete all seven required teaching steps;
- preview the complete proposed code and explain every line before editing;
- name the exact file, wait for the learner to open it, and apply only the approved change;
- let the learner run the fully explained verification command;
- record the evidence and the limits of the check.

The seven required steps remain the core technical structure. Analogy and line-by-line explanation are integrated into those steps rather than treated as optional additions. The analogy supports understanding but never substitutes for precise architecture, business rules, security boundaries, failure analysis, or tests.

#### Explicit Step 6A pause

Step 6A has been designed and documented but is deliberately paused. No `accounts/middleware.py` file has been created, no custom middleware has been added to `config/settings.py`, and no middleware behaviour test has been implemented. The next action is a recap using the corrected combined teaching method. Implementation may begin only after the learner understands and approves that recap.

## Retrospective learning map using the permanent teaching pattern

This section brings every completed learning area under the same method without replacing the detailed chronological evidence above. Each retrospective contains a recap, a mapped analogy, the seven technical checks, and the most important code or commands explained from left to right. Future lessons must use this pattern before implementation rather than needing a retrospective correction.

### Retrospective A: Clean restart, Git continuity, and project documents

**Recap:** The earlier generated application was removed while Git history and the product requirements were preserved. The project was then rebuilt in small verified blocks. `TEACH.md` owns permanent project and teaching guidance, `LEARNING_GUIDE.md` owns chronological learning evidence, `PRD.md` owns product requirements, and `STATUS.md` owns changing progress.

**Analogy:** Rebuilding the project was like renovating a house while keeping the deeds, architectural plans, and photographic history. Git is the recoverable history, the PRD is the architectural plan, TEACH is the working agreement, STATUS is the current job board, and this learning record is the site diary. The analogy stops at recovery mechanics: Git can recover committed files, but it does not automatically preserve ignored databases or uncommitted editor buffers.

1. **Purpose:** Remove confusing generated code and rebuild a system the learner can explain.
2. **Location:** Repository files hold code; the four documents divide stable rules, product requirements, changing status, and chronological evidence.
3. **Path:** inspect repository -> preserve required history -> remove obsolete generated layers -> rebuild one block -> verify -> commit -> push or merge.
4. **Rules:** Never discard user work silently; preserve relevant Git history; keep local databases and environments out of Git; do not confuse planned React architecture with already implemented folders.
5. **Failures:** Deleting a workspace broadly, overwriting uncommitted work, treating ignored files as backed up, or allowing documentation roles to conflict.
6. **Tests:** `git status`, diffs, relevant application checks, and remote branch verification prove different parts of the state; none alone proves the application is correct.
7. **Modification and review:** Every change is scoped, shown, verified, intentionally committed, and published only when requested.

Important Git vocabulary:

- `git status -sb` reads the branch and concise working-tree state; it does not change files.
- `git diff` shows unstaged changes, while `git diff --cached` shows staged changes.
- `git add <paths>` selects changes for the next commit.
- `git commit -m "message"` creates a local history checkpoint from staged content.
- `git push` copies local commits to a remote branch; it does not automatically update `master` when pushing another branch.
- A pull request proposes merging one branch into another. GitHub's main page showed older work until the feature branch was merged into `master`.

### Retrospective B: Python, terminals, and the virtual environment

**Recap:** Python 3.13.14 and pip 26.1.2 were verified. A project-specific `.venv` was created, and the learner used both PowerShell and Git Bash.

**Analogy:** The computer's Python installation is a shared workshop, while `.venv` is a labelled toolbox reserved for MoneyMatters. PowerShell and Git Bash are different doorways into the workshop: they reach the same tools but use different instructions for opening the toolbox.

1. **Purpose:** Isolate MoneyMatters dependencies from other Python projects.
2. **Location:** `.venv` sits in the repository directory locally but is ignored by Git.
3. **Path:** base Python -> create `.venv` -> activate for the current shell -> `python` resolves to the project interpreter -> commands import project packages.
4. **Rules:** Activate the environment before lesson commands; do not commit `.venv`; recreate it from dependency records on another computer.
5. **Failures:** Microsoft Store aliases, confusing `venv` with `.venv`, using PowerShell activation syntax in Git Bash, or running the global interpreter accidentally.
6. **Tests:** `python --version`, `python -m pip --version`, and the displayed executable location prove interpreter selection; they do not prove Django settings load.
7. **Modification and review:** Environment creation was performed once, then verified before dependencies were installed.

Commands explained:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

- `py` selects the Windows Python launcher.
- `-m venv` runs Python's built-in environment-creation module.
- `.venv` is the directory being created.
- `Activate.ps1` changes only the current PowerShell session's command resolution.

Git Bash activates the same environment with:

```bash
source .venv/Scripts/activate
```

- `source` runs the activation script inside the current Bash session so its environment changes persist.
- `.venv/Scripts/activate` is the Git Bash path to the Windows virtual environment's activation script.

### Retrospective C: Django, Django REST Framework, Pillow, and requirements

**Recap:** Django 5.2.16, Django REST Framework 3.16.1, and Pillow 12.3.0 were installed in `.venv`. Exact resolved dependencies were recorded in `requirements.txt`. React and TypeScript remain planned frontend technologies and have not been scaffolded yet.

**Analogy:** Django is the building framework, Django REST Framework is the service counter for structured API requests, Pillow is the image-handling equipment, and `requirements.txt` is the parts manifest needed to reproduce the workshop.

1. **Purpose:** Provide the backend framework, future API tools, and image support required by the profile avatar field.
2. **Location:** Packages live in `.venv`; reproducible version records live in `requirements.txt`.
3. **Path:** active interpreter -> pip reads requested constraints -> packages install into `.venv` -> Django imports them when project code requires them.
4. **Rules:** Use compatible bounded versions when selecting dependencies; record resolved versions; never treat editor spelling warnings in `requirements.txt` as package errors.
5. **Failures:** Installing globally, using a different interpreter's pip, omitting Pillow while using `ImageField`, or editing `pip freeze` output as prose.
6. **Tests:** `pip show`, import/version commands, and `python manage.py check` verify different levels; package presence does not prove product behaviour.
7. **Modification and review:** Dependencies were installed by learner-run terminal commands and verified before dependent model work continued.

Key command structure:

```bash
python -m pip install "Django~=5.2.0" "djangorestframework~=3.16.0"
```

- `python -m pip` guarantees pip runs under the selected Python interpreter.
- `install` requests package installation.
- `~=` allows compatible maintenance releases within the selected release line.
- Quotes keep the version expression together for the shell.

### Retrospective D: Django project, accounts app, and app registration

**Recap:** Django's `config` project and `accounts` app were created. `accounts.apps.AccountsConfig` was added to `INSTALLED_APPS`, allowing Django to discover the app's models, migrations, admin configuration, and tests.

**Analogy:** The Django project is a shopping centre, an app is one specialised shop, `AccountsConfig` is the shop's registration certificate, and `INSTALLED_APPS` is the centre directory. A shop folder may physically exist without Django treating it as an active shop until it appears in the directory.

1. **Purpose:** Give household and user-profile responsibilities their own Django app.
2. **Location:** Global configuration belongs in `config`; accounts-domain code belongs in `accounts`.
3. **Path:** `manage.py` loads settings -> Django reads `INSTALLED_APPS` -> imports `AccountsConfig` -> builds the app registry -> discovers models and related components.
4. **Rules:** Use the dotted app-config path; keep domain code in its owning app; registration does not create database tables.
5. **Failures:** Misspelling `apps.py`, using a wrong dotted path, assuming folder existence equals registration, or expecting registration to run migrations.
6. **Tests:** `py_compile` proves settings syntax; `manage.py check` proves Django can load the configured app; neither creates schema.
7. **Modification and review:** The exact settings file was opened, the app-config entry was added, and learner-run checks passed.

Important dotted path:

```python
"accounts.apps.AccountsConfig"
```

- `accounts` identifies the Python package.
- `apps` identifies `accounts/apps.py` without the `.py` suffix.
- `AccountsConfig` identifies the class inside that module.

### Retrospective E: Household and UserProfile models

**Recap:** `Household` became the top-level financial-data owner. `UserProfile` links one Django user to one household, stores a descriptive financial label, and optionally references an avatar.

**Analogy:** A household is a locked financial filing room. A user profile is a membership card connecting one person to that room and carrying their display label. The analogy stops at permissions: owning a membership card does not automatically make every API query secure; server-side filtering is still required.

1. **Purpose:** Represent household ownership and user membership as persistent business data.
2. **Location:** Both declarations belong in `accounts/models.py`, the accounts-domain persistence layer.
3. **Path:** Python model declaration -> migration operations -> database tables -> ORM objects -> future serializers and views.
4. **Rules:** Household defaults are GBP and fiscal month 1; one user has one profile; many profiles may belong to one household; the default descriptive role is SECONDARY; avatar is optional.
5. **Failures:** Confusing descriptive labels with permission roles, choosing the wrong relationship type, unsafe delete behaviour, missing Pillow, or assuming field choices automatically enforce API permissions.
6. **Tests:** Focused model tests protect defaults, readable text, role defaults, reverse names, and cascade behaviour; field-length, choice, permission, and API tests remain separate.
7. **Modification and review:** Models were built in small reviewed blocks, then translated into a migration and tested.

Key relationship lines:

```python
user = models.OneToOneField(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name="profile",
)
```

- `user` is the field stored on `UserProfile`.
- `OneToOneField` permits at most one profile per user.
- `settings.AUTH_USER_MODEL` respects Django's configured user model.
- `on_delete=models.CASCADE` deletes the profile when its user is deleted.
- `related_name="profile"` creates the reverse path `user.profile`.

```python
household = models.ForeignKey(
    Household,
    on_delete=models.CASCADE,
    related_name="members",
)
```

- `ForeignKey` allows several profiles to point to one household.
- `Household` is the related model.
- `CASCADE` removes dependent profiles when the household is deleted.
- `members` creates the reverse query path `household.members`.

### Retrospective F: Migrations, schema inspection, and safe repair

**Recap:** `makemigrations` generated `accounts/migrations/0001_initial.py`. The retained local SQLite database already marked an older migration with the same name as applied, and its profile columns did not match the current source. The empty accounts tables were safely rebuilt while the existing auth user was preserved.

**Analogy:** Models are an architect's design, migration files are numbered construction plans, the database is the actual building, and `django_migrations` is the completed-work ledger. The incident occurred because the ledger said plan 0001 was completed, but the source copy of plan 0001 had been replaced with a different design.

1. **Purpose:** Make database structure reproducible and repair the mismatch without destroying unrelated data.
2. **Location:** Migration history code lives in `accounts/migrations`; applied schema and the history table live in local `db.sqlite3`.
3. **Path:** models -> `makemigrations` creates operations -> review -> `migrate` applies operations -> introspection checks actual tables and columns.
4. **Rules:** Inspect before repairing; verify backups; proceed destructively only because accounts tables were empty; preserve the auth user; avoid manual SQL, `--fake`, and whole-database deletion.
5. **Failures:** Treating `[X]` output as a command, assuming migration history proves physical schema, reusing a migration name for different operations, or deleting the entire database unnecessarily.
6. **Tests:** `showmigrations` checks recorded history; introspection checks physical structure; row counts check preservation needs; hashes verify the backup; `manage.py check` verifies Django configuration afterward.
7. **Modification and review:** The learner created the backup, then explicitly asked the AI to perform the narrowly scoped recovery. Evidence confirmed corrected columns and one preserved auth user.

Command distinction:

```bash
python manage.py makemigrations accounts
python manage.py migrate accounts
```

- `makemigrations` writes a source-controlled schema plan; it does not change database tables.
- `migrate` executes known plans against the configured database and records them as applied.
- `accounts` scopes each command to the app while Django still respects dependencies.

### Retrospective G: Automated model tests

**Recap:** Five accounts tests now pass together. They cover Household defaults, Household text representation, the UserProfile default role, reverse relationships, and household deletion cascading to the profile while preserving the user.

**Analogy:** Models are a factory design and tests are reusable inspectors working in a temporary workshop. Each inspector places a controlled order, checks one promised result, and clears the workshop afterward. A passing inspector report covers only the rule it examined.

1. **Purpose:** Protect meaningful business behaviour against accidental future changes.
2. **Location:** Tests belong in `accounts/tests.py`, separate from production models.
3. **Path:** Django test runner -> isolated test database -> arrange objects -> act -> assert expected result -> reset state -> destroy test database after the run.
4. **Rules:** Tests must be independent; test names begin with `test_`; protect user, money, permission, data, security, and explicit requirement behaviour rather than every trivial line.
5. **Failures:** Depending on normal database rows, confusing actual and expected values, checking only in-memory state after deletion, or assuming one passing test proves the whole app.
6. **Tests:** A focused command gives fast evidence for one method; `python manage.py test accounts` verifies the app's complete current suite works together.
7. **Modification and review:** Each test was explained, added after the file was opened, run by the learner, and recorded with explicit limits.

Core test structure:

```python
class HouseholdModelTests(TestCase):
    def test_default_values(self):
        household = Household.objects.create(name="Smith Household")

        self.assertEqual(household.base_currency, "GBP")
```

- `TestCase` provides isolated database behaviour and assertions.
- `test_` makes the method discoverable.
- `.objects.create(...)` arranges and saves the example.
- `household.base_currency` is the actual value.
- `"GBP"` is the expected value.
- `assertEqual` fails when actual and expected differ.

### Retrospective H: Django admin and local administrator access

**Recap:** `Household` and `UserProfile` were registered in `accounts/admin.py`. Django's system check passed, the existing user was confirmed as staff and superuser, a forgotten local password was changed securely, and both models appeared after browser login.

**Analogy:** The models are products in a warehouse and Django admin is the staff-only inventory desk. Registering models adds product catalogues to that desk; staff credentials control entry. This does not turn the desk into the customer-facing React application or enforce future API household isolation.

1. **Purpose:** Provide authorised internal raw management of accounts records.
2. **Location:** Registration belongs in `accounts/admin.py`; authentication data remains in Django's auth tables.
3. **Path:** Django imports admin configuration -> models enter the admin registry -> staff requests `/admin/` -> session login -> generated model pages use the ORM.
4. **Rules:** Only staff enter admin; use the existing account rather than creating duplicates; never paste passwords; admin is not a public product workflow.
5. **Failures:** Using `code manage.py check` instead of executing Python, duplicate registration, forgotten credentials, ordinary users receiving staff access, or assuming admin registration creates API endpoints.
6. **Tests:** `manage.py check` proves configuration loads; read-only user flags prove access eligibility; browser login proves the integrated local path; none proves production security.
7. **Modification and review:** The two registration calls were added after explanation, learner-run checks passed, and the generated admin index was visually confirmed.

Registration lines:

```python
admin.site.register(Household)
admin.site.register(UserProfile)
```

- `admin` is Django's imported admin module.
- `.site` is the default admin-site object.
- `.register(...)` adds the supplied model class to its internal registry.

### Retrospective I: Current household middleware design — paused

**Recap:** The next block has been designed but not implemented. Its job is to derive `request.household` from the authenticated user's profile. The initial explanation was paused because the analogy was recorded but not delivered clearly in conversation.

**Analogy:** A request is a clipboard moving through a secure office. The session cookie is a badge number, AuthenticationMiddleware identifies the person, CurrentHouseholdMiddleware checks the staff directory for the assigned building, and the view opens only that building's filing cabinet. A visitor or employee without an assignment receives a blank household field. The analogy stops before enforcement: the viewset must still filter the real queryset.

1. **Purpose:** Give later views a predictable, server-derived household context.
2. **Location:** The proposed class belongs in a new `accounts/middleware.py`; later activation belongs after AuthenticationMiddleware in `config/settings.py`.
3. **Path:** session -> `request.user` -> `user.profile` -> `profile.household` -> `request.household` -> filtered queryset.
4. **Rules:** Anonymous and profile-less users receive `None`; never trust a browser household ID; catch only the expected missing-profile condition; queryset filtering remains mandatory.
5. **Failures:** Wrong middleware order, assuming every user has a profile, hiding all exceptions, leaving the attribute undefined, or forgetting view-level filtering.
6. **Tests:** Future focused tests must cover a user with a profile, a user without a profile, an anonymous user, and continuation to the wrapped response.
7. **Modification and review:** No middleware implementation is authorised yet. The learner must first approve the combined recap, analogy, seven steps, and line-by-line preview, then open the exact new file.

Proposed code remains a preview only:

```python
from .models import UserProfile


class CurrentHouseholdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.household = None

        if request.user.is_authenticated:
            try:
                request.household = request.user.profile.household
            except UserProfile.DoesNotExist:
                pass

        return self.get_response(request)
```

The detailed line-by-line explanation remains in Step 6A above. As of this retrospective, `accounts/middleware.py` has not been created and `config/settings.py` has not been changed for custom middleware.

### Permanent continuation rule

For every future code block, the live lesson and chronological entry must contain the same combined structure: recap, visible mapped analogy, seven steps, full code preview, line-by-line explanation, explicit file opening and approval, AI-applied scoped edit, learner-run terminal verification, and a recorded statement of what the result proves and does not prove. If one part is missing or unclear, pause before implementation and repair the explanation first.

**Learner-run middleware syntax check:** The learner ran `python -m py_compile accounts/middleware.py` from Git Bash with `.venv` active. Python returned to the prompt with no output, which means it parsed and byte-compiled the new middleware file without detecting a syntax or indentation error. This does not prove any request behaviour, response continuation, middleware ordering, settings registration, or household isolation.

### Step 6B: Test household resolution for an authenticated user with a profile

#### Recap and connection

Step 6A created `CurrentHouseholdMiddleware` but did not activate it globally. Its syntax check passed. Before editing `config/settings.py`, test the successful branch directly: Django has identified a user, that user has a profile and household, and the middleware must place that exact household on the request before returning the next response.

#### Analogy: test the clipboard at a practice security desk

The middleware is a security desk that receives a clipboard. `RequestFactory` creates a realistic empty clipboard, the test writes the identified employee on it as `request.user`, and the employee's profile acts as the staff-directory entry. The middleware should write the assigned building on the clipboard. A small stand-in response represents the next department's completed paperwork. Receiving that same response proves the security desk forwarded the clipboard rather than stopping the workflow.

The analogy stops at Django's real request chain: this direct test manually supplies `request.user` because AuthenticationMiddleware is not running. A later settings and integration check must prove the real middleware order.

#### 1. Purpose

Prove the primary successful behaviour: an authenticated user with a saved `UserProfile` receives the profile's household as `request.household`, and `CurrentHouseholdMiddleware` returns the response produced by its wrapped callable.

#### 2. Location

The test belongs in `accounts/tests.py` inside a new `CurrentHouseholdMiddlewareTests` class. The production middleware remains in `accounts/middleware.py`. Required framework and middleware imports belong at the top of the existing test file.

#### 3. Important execution and data path

The direct test path is `Django test runner -> isolated test database -> create user -> create household -> create UserProfile link -> RequestFactory creates GET request -> test attaches user -> middleware defaults request.household to None -> authenticated branch follows user.profile.household -> request.household becomes saved Household -> wrapped callable returns expected response -> assertions inspect household and returned object`.

#### 4. Main business rules

- The household must come from the authenticated user's saved profile.
- The object assigned to `request.household` must be the expected `Household`, not a browser-supplied ID or a different household.
- Middleware must continue the request chain and return the wrapped callable's response.
- The test manually attaches the user only because it isolates this middleware from AuthenticationMiddleware.
- The test must use an isolated database and must not depend on the local administrator or normal `db.sqlite3`.

#### 5. Common failure cases

- Forgetting to attach `request.user` makes the direct unit test unlike the eventual ordered middleware chain.
- Creating a user without a profile takes the failure branch rather than the success branch being tested.
- Asserting only that `request.household` is non-null could miss assignment of the wrong household.
- Failing to call `self.get_response(request)` may set the household but prevent Django from producing a response.
- Passing this direct test does not prove global settings registration or queryset filtering.

#### 6. What the test should prove

A pass proves that the middleware's authenticated-profile branch resolves the exact saved household and returns the exact response object produced by the next callable. It does not prove anonymous behaviour, profile-less behaviour, real AuthenticationMiddleware ordering, global activation, API permissions, or household-filtered querysets.

#### 7. AI implementation and learner review

After the learner opens `accounts/tests.py`, the AI will extend the imports and add this focused class:

```python
from django.http import HttpResponse
from django.test import RequestFactory, TestCase

from .middleware import CurrentHouseholdMiddleware
from .models import Household, UserProfile


class CurrentHouseholdMiddlewareTests(TestCase):
    def test_sets_household_for_authenticated_user_with_profile(self):
        user = get_user_model().objects.create_user(username="alex")
        household = Household.objects.create(name="Smith Household")
        UserProfile.objects.create(user=user, household=household)
        request = RequestFactory().get("/")
        request.user = user
        expected_response = HttpResponse("ok")
        middleware = CurrentHouseholdMiddleware(
            lambda _request: expected_response
        )

        response = middleware(request)

        self.assertEqual(request.household, household)
        self.assertIs(response, expected_response)
```

The first existing import, `from django.contrib.auth import get_user_model`, remains unchanged.

Line by line:

- `from django.http import HttpResponse` imports Django's basic HTTP response class so the wrapped callable can return a real response object.
- `from django.test import RequestFactory, TestCase` imports both the realistic request builder and the existing database-aware test base class.
- `from .middleware import CurrentHouseholdMiddleware` imports the production class being tested from the current app.
- `from .models import Household, UserProfile` remains the app's model import.
- Two blank lines separate imports from a top-level class.
- `class CurrentHouseholdMiddlewareTests(TestCase):` groups middleware tests and inherits Django's isolated database and assertion tools.
- `def test_sets_household_for_authenticated_user_with_profile(self):` defines a discoverable focused test; the name states the expected condition and result.
- `user = get_user_model().objects.create_user(username="alex")` creates and saves the authenticated test user.
- `household = Household.objects.create(name="Smith Household")` creates and saves the expected household.
- `UserProfile.objects.create(user=user, household=household)` creates the trusted server-side path between them. No variable is needed because later assertions inspect the request and household.
- `request = RequestFactory().get("/")` creates a Django GET request for the root path without starting a server.
- `request.user = user` performs the part AuthenticationMiddleware would normally perform before custom middleware runs.
- `expected_response = HttpResponse("ok")` creates the exact response object the next callable should return.
- `middleware = CurrentHouseholdMiddleware(` starts construction of the middleware under test.
- `lambda _request: expected_response` is a small anonymous function standing in for the next middleware or view. `_request` receives the forwarded request but the underscore indicates this stand-in does not need to inspect it; it returns `expected_response`.
- The closing `)` ends construction. Splitting the call across lines keeps the lambda readable.
- The blank line separates Arrange from Act.
- `response = middleware(request)` calls the middleware with the prepared request and stores the returned response.
- The next blank line separates Act from Assert.
- `self.assertEqual(request.household, household)` compares the actual household stamped on the request with the expected saved household.
- `self.assertIs(response, expected_response)` proves identity rather than only equal content: the middleware returned the exact object produced by the wrapped callable.

After reviewing the diff, the learner will run from the MoneyMatters root with `.venv` active:

```bash
python manage.py test accounts.tests.CurrentHouseholdMiddlewareTests.test_sets_household_for_authenticated_user_with_profile
```

- `python` uses the active project interpreter.
- `manage.py test` starts Django's test runner.
- The dotted path selects this one class and method.

Django creates and destroys an isolated test database. The command does not change normal `db.sqlite3`, source code, dependencies, or Git history. Expected success output includes `Found 1 test(s)`, one dot, and `OK`. Paste any traceback in full.

**Learner-run authenticated-profile middleware test:** The learner ran `python manage.py test accounts.tests.CurrentHouseholdMiddlewareTests.test_sets_household_for_authenticated_user_with_profile` and reported that it passed. This proves the middleware resolves the exact household through the saved `user.profile.household` path and returns the exact response produced by its wrapped callable in an isolated test database. It does not prove anonymous or profile-less behaviour, real middleware ordering, global activation, API permissions, or queryset filtering.

### Step 6C: Test an authenticated user without a profile

#### Recap and connection

The successful middleware branch now passes. The next branch protects onboarding and Django admin: a person may be authenticated before a `UserProfile` exists. The middleware must leave `request.household` as `None` and continue the request instead of raising an exception.

#### Analogy: an employee badge without a building assignment

The request clipboard contains a valid employee badge, so the person is authenticated. The staff directory has no assignment card for that employee yet. The security desk leaves the “assigned building” box blank and forwards the clipboard to the next department. This keeps reception and onboarding open while signalling that household-owned records must not be shown.

The analogy stops at authorisation: `None` is only a value on the real request object. Later API code must reject or return no household-owned records when that value is missing.

#### 1. Purpose

Prove that an authenticated user without a related `UserProfile` receives `request.household = None` and that the middleware still returns the wrapped callable's response.

#### 2. Location

The method belongs inside the existing `CurrentHouseholdMiddlewareTests` class in `accounts/tests.py`. It uses the imports already added by Step 6B, so no new import is required.

#### 3. Important execution and data path

The path is `test runner -> isolated database -> create Django user only -> RequestFactory creates GET request -> attach authenticated user -> middleware establishes None default -> request.user.is_authenticated is true -> request.user.profile raises UserProfile.DoesNotExist -> narrow except block keeps None -> wrapped callable returns expected response -> assertions inspect both outcomes`.

#### 4. Main business rules

- Authentication may exist before household onboarding is complete.
- A missing profile must not crash the request chain.
- Missing profile context must produce `None`, never a guessed or default household.
- The middleware must still return the next response.
- Later household-owned views must handle `None` securely rather than returning unscoped data.

#### 5. Common failure cases

- Assuming every authenticated user has `user.profile` would raise an exception and could break Django admin.
- Automatically choosing the first household would create a severe cross-household data risk.
- Catching unrelated exceptions would hide genuine bugs.
- Checking only `request.household` would not prove the middleware continued to the response.
- Passing this direct test would not prove settings order or viewset security.

#### 6. What the test should prove

A pass proves the precise missing-profile exception is handled, the safe default remains `None`, and the exact wrapped response is returned. It does not prove anonymous behaviour, global activation, real session authentication, permissions, or queryset filtering.

#### 7. AI implementation and learner review

After the learner opens `accounts/tests.py`, the AI will add only this method below the successful-path test:

```python
    def test_sets_none_for_authenticated_user_without_profile(self):
        user = get_user_model().objects.create_user(username="alex")
        request = RequestFactory().get("/")
        request.user = user
        expected_response = HttpResponse("ok")
        middleware = CurrentHouseholdMiddleware(
            lambda _request: expected_response
        )

        response = middleware(request)

        self.assertIsNone(request.household)
        self.assertIs(response, expected_response)
```

Line by line:

- `def test_sets_none_for_authenticated_user_without_profile(self):` defines a discoverable method whose name states the input state and expected result.
- `user = get_user_model().objects.create_user(username="alex")` creates and saves an authenticated-capable user but deliberately does not create `UserProfile`.
- `request = RequestFactory().get("/")` creates a Django GET request without running a server.
- `request.user = user` imitates the earlier AuthenticationMiddleware result.
- `expected_response = HttpResponse("ok")` creates the exact response the stand-in next callable will return.
- `middleware = CurrentHouseholdMiddleware(` begins construction of the production middleware under test.
- `lambda _request: expected_response` receives the forwarded request and returns the prepared response; `_request` is intentionally unused by this simple stand-in.
- The closing `)` completes construction.
- The blank line separates Arrange from Act.
- `response = middleware(request)` runs the middleware. Internally, the missing reverse profile triggers the narrow exception handler.
- The next blank line separates Act from Assert.
- `self.assertIsNone(request.household)` checks that the actual request value is the singleton `None` safe default.
- `self.assertIs(response, expected_response)` checks that the exact response object continued through the chain.

After reviewing the diff, the learner will run:

```bash
python manage.py test accounts.tests.CurrentHouseholdMiddlewareTests.test_sets_none_for_authenticated_user_without_profile
```

Run from the MoneyMatters project root with `.venv` active. Django creates and destroys an isolated test database. The command does not change normal data, source files, dependencies, or Git history. Expected success output includes `Found 1 test(s)`, one dot, and `OK`; paste any traceback in full.

**Learner-run authenticated-without-profile middleware test:** The learner ran `python manage.py test accounts.tests.CurrentHouseholdMiddlewareTests.test_sets_none_for_authenticated_user_without_profile` and reported that it passed. This proves an authenticated user without a profile leaves `request.household` as `None`, the expected missing-profile condition is handled, and the exact wrapped response is returned. It does not prove anonymous behaviour, settings activation, real middleware ordering, permissions, or queryset filtering.

### Step 6D: Test an anonymous request

#### Recap and connection

Two direct middleware branches now pass: a profiled user receives the correct household, and an authenticated user without a profile receives `None`. The final direct branch is an anonymous visitor. Because no user has logged in, the middleware must keep the safe `None` default without attempting a profile lookup and must still return the next response.

#### Analogy: a visitor badge at the security desk

The request clipboard identifies its holder as a visitor rather than an employee. The security desk does not search the employee assignment directory because the visitor has no authenticated staff identity. It leaves the building assignment blank and forwards the clipboard. This avoids both a crash and an invented assignment.

The analogy stops at access control: `request.household = None` does not itself reject an anonymous API call. Django authentication and later view permissions must still prevent public access to protected financial endpoints.

#### 1. Purpose

Prove that an anonymous Django user receives `request.household = None`, does not enter the authenticated profile-lookup branch, and still receives the wrapped callable's response.

#### 2. Location

The method belongs inside `CurrentHouseholdMiddlewareTests` in `accounts/tests.py`. One new import, `AnonymousUser`, belongs with the existing Django authentication imports at the top of that file.

#### 3. Important execution and data path

The path is `test runner -> RequestFactory creates GET request -> attach AnonymousUser -> middleware establishes None default -> is_authenticated evaluates false -> profile lookup block is skipped -> wrapped callable returns expected response -> assertions inspect None and response identity`.

#### 4. Main business rules

- Anonymous requests receive no household context.
- The middleware must not query a profile for an anonymous visitor.
- It must never assign a default or first household.
- It must continue the response chain.
- Protected views must later require authentication and handle missing household context securely.

#### 5. Common failure cases

- Using `None` as `request.user` would not accurately model Django's real anonymous-user object.
- Entering the profile branch for an anonymous user could cause invalid lookups or errors.
- Assigning a shared default household would expose private data.
- Treating the middleware's `None` value as complete access control would leave protected views unsafe.
- Passing this direct test does not prove global middleware order.

#### 6. What the test should prove

A pass proves `AnonymousUser.is_authenticated` keeps the request household at `None` and the exact next response returns. It does not prove login requirements, session behaviour, global middleware activation, view permissions, or household queryset filtering.

#### 7. AI implementation and learner review

After the learner opens `accounts/tests.py`, the AI will add the authentication import and one method:

```python
from django.contrib.auth.models import AnonymousUser


    def test_sets_none_for_anonymous_user(self):
        request = RequestFactory().get("/")
        request.user = AnonymousUser()
        expected_response = HttpResponse("ok")
        middleware = CurrentHouseholdMiddleware(
            lambda _request: expected_response
        )

        response = middleware(request)

        self.assertIsNone(request.household)
        self.assertIs(response, expected_response)
```

The import will appear near the top of the real file; the method will appear inside `CurrentHouseholdMiddlewareTests`. They are shown together here only to preview both approved edits.

Line by line:

- `from django.contrib.auth.models import AnonymousUser` imports Django's real anonymous-user class rather than inventing a placeholder.
- `def test_sets_none_for_anonymous_user(self):` defines a discoverable focused test and states the expected result.
- `request = RequestFactory().get("/")` creates a Django GET request without a running server.
- `request.user = AnonymousUser()` constructs and attaches the same kind of unauthenticated user object Django normally supplies.
- `expected_response = HttpResponse("ok")` prepares the exact response expected from the next callable.
- `middleware = CurrentHouseholdMiddleware(` starts construction of the production middleware.
- `lambda _request: expected_response` stands in for the next callable and returns the prepared response.
- The closing `)` completes construction.
- The blank line separates Arrange from Act.
- `response = middleware(request)` runs the middleware. The authentication condition is false, so no profile lookup occurs.
- The next blank line separates Act from Assert.
- `self.assertIsNone(request.household)` checks that the safe default remains the singleton `None`.
- `self.assertIs(response, expected_response)` proves the exact wrapped response continued through the middleware.

After reviewing the diff, the learner will run:

```bash
python manage.py test accounts.tests.CurrentHouseholdMiddlewareTests.test_sets_none_for_anonymous_user
```

Run from the project root with `.venv` active. Django creates and destroys an isolated test database even though this method creates no records. The command does not change normal data, source files, dependencies, or Git history. Expected success output includes one test and `OK`; paste any traceback in full.

### How do we know what to import, which topic a pattern belongs to, and why middleware uses requests and responses?

The learner asked how developers know which models or Django objects to import, whether middleware is specifically for APIs, how code involving `get()` and responses is arranged, and whether those ideas belong to Python or Django.

There is no useful single flat list of imports to memorise. Start with the name used by the code, identify who owns it, then locate its definition or official documentation:

- Project-owned names such as `Household`, `UserProfile`, and `CurrentHouseholdMiddleware` are found in the repository and imported from their defining modules.
- Django-owned names such as `RequestFactory`, `HttpResponse`, and `AnonymousUser` are found through Django's official documentation, editor navigation, or installed source.
- The leading dot in `from .models import Household` means the module is inside the current Python package.

The current middleware test combines several source topics:

- **Python:** `def`, class instances, variable assignment, `lambda`, `__init__`, `__call__`, attributes, and return values.
- **HTTP/web:** GET requests, URL paths, requests, responses, and status behaviour.
- **Django:** middleware, `HttpResponse`, authentication objects, `RequestFactory`, `TestCase`, and the ORM.
- **Testing:** Arrange-Act-Assert, controlled inputs, expected outputs, assertion equality, identity, and test limits.
- **Django REST Framework:** not used by this direct middleware test yet; later viewsets and permissions will consume `request.household` for API isolation.

Middleware is part of Django's global request/response processing, so once activated it can run for admin pages, ordinary Django pages, authentication routes, and DRF API endpoints. MoneyMatters primarily needs this custom middleware to prepare trusted household context for later APIs, but the middleware itself does not create an API or enforce queryset filtering.

`RequestFactory().get("/")` constructs an in-memory Django request representing the HTTP operation `GET /`; it does not start a server. This `.get()` is different from `Household.objects.get(...)`, which performs a database query. The object to the left determines the method's meaning.

`RequestFactory` deliberately does not execute middleware, so a direct test manually supplies `request.user`. `AnonymousUser()` accurately represents Django's unauthenticated user object. `HttpResponse("ok")` supplies a real known response, while `lambda _request: expected_response` is a small Python callable standing in for the next middleware or view. It is equivalent to a named function that accepts a request and returns the prepared response.

Official deeper-study references for the installed Django 5.2 line:

- **Learn now:** [Django middleware and the `get_response` contract](https://docs.djangoproject.com/en/5.2/topics/http/middleware/).
- **Learn now:** [Django `RequestFactory` and direct request testing](https://docs.djangoproject.com/en/5.2/topics/testing/advanced/).
- **Explore soon:** [Django request and response objects](https://docs.djangoproject.com/en/5.2/ref/request-response/).
- **Later reference:** HTTP methods and protocol details beyond the GET/response concepts required by the current test.

The learner's final question ended with “and can,” so that incomplete portion remains open for clarification. The anonymous-user test remains documented but unimplemented.

### Publish-check recovery: middleware file overwritten by an empty editor buffer

During the requested GitHub publish workflow, the complete accounts suite failed while importing `CurrentHouseholdMiddleware`. Read-only inspection showed that `accounts/middleware.py` existed but had zero bytes, even though its earlier focused syntax and behaviour checks had passed. This matched the previous pattern where a file created externally while an older empty VS Code buffer was open was later overwritten by that buffer.

The AI stopped before staging, committing, or pushing. After the learner opened the exact file, the AI restored only the previously approved 17-line middleware class. No anonymous-user test or settings registration was added.

The publish validation was then repeated with the project virtual-environment interpreter:

- `python manage.py test accounts` found seven tests and all seven passed.
- `python manage.py check` reported no issues.
- `python -m py_compile accounts/middleware.py` passed with no output.
- `git diff --check` passed; line-ending notices were warnings rather than whitespace errors.

An unrelated zero-byte file named `check`, created earlier when `code manage.py check` treated `check` as a filename, was inspected and deliberately excluded from the publish scope. It was not deleted silently. The intended checkpoint remains the admin registration, five model tests, middleware class, two passing middleware tests, status, and teaching/learning documentation.
