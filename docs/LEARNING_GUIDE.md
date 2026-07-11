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

## Working agreement

MoneyMatters is a production-minded household finance application, not a simplified tutorial. The implementation should use sound architecture, security, tests, and maintainable code. Explanations will be beginner-accessible without reducing the product's quality.

The learner should type important commands and implement focused pieces of code. AI may explain concepts, review work, provide hints, diagnose errors, and implement work when explicitly requested or when the learner is blocked.

Before a major feature:

1. Review the relevant PRD requirement.
2. Explain the design and trade-offs.
3. Divide the work into small, verifiable steps.
4. Record commands and instructions in this guide.
5. Implement and test one step at a time.
6. Commit a coherent checkpoint.

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
- `docs/LEARNING_GUIDE.md`: commands, explanations, and lessons.
- `docs/STATUS.md`: current milestone, completed work, next action, decisions, and blockers.
- Git commits: exact, recoverable code checkpoints.

At the end of a work session, update `docs/STATUS.md` and commit the coherent work. In a new chat, open the same MoneyMatters workspace and ask the assistant to read the PRD, learning guide, status file, and recent Git history before continuing.

A reusable new-chat prompt is:

```text
Continue the MoneyMatters project. First read docs/PRD.md,
docs/LEARNING_GUIDE.md, docs/STATUS.md, and the recent Git history.
Tell me the current milestone and next step before changing anything.
Keep recording every command and instruction in docs/LEARNING_GUIDE.md.
```

Use the same existing thread when it is convenient, but start a new one at a clean milestone when the conversation becomes unwieldy. Do not repeatedly paste the entire history; point the new chat to the repository documents. Keep steps focused, summarize decisions in files, and commit regularly. This reduces dependence on conversation context while making the project understandable to both you and future collaborators.
