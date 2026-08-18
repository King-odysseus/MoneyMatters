# MoneyMatters Project and Teaching Guide

This is the permanent onboarding document for anyone helping with MoneyMatters. Every AI agent must read this file before teaching, proposing code, editing project files, or asking the learner to run a command. It provides the stable project context, technology stack, architecture rules, and mandatory teaching method in one place.

## How the project documents are used

- `docs/TEACH.md` is the stable agent-onboarding source for project context, architecture, technology, and teaching rules. Read it first.
- `docs/LEARNING_GUIDE.md` is the chronological learning record. Append individual lessons, learner questions, exact commands, errors, corrections, and verification results there. Do not use it as the source of permanent teaching policy or general project orientation.
- `docs/PRD.md` is the detailed product requirements document. Consult it when designing a feature, resolving a product decision, or checking acceptance requirements.
- `docs/STATUS.md` records the changing implementation state and next action. Read it rather than placing temporary progress information in this permanent guide.

## Project purpose and core domain

MoneyMatters is a household financial-management application that replaces fragile spreadsheets with a secure, auditable, multi-user system. People collaborate inside an isolated household to manage income, expenses, savings, mortgage information, investments, projects, and other financial records.

The central product boundaries are:

- A household is the top-level owner of financial information.
- Users participate through a profile linked to one household.
- Data from one household must never be exposed to another household.
- An auditable transaction ledger is the financial source of truth.
- Financial calculations and permission decisions belong on the server, not in the browser.
- Security, correctness, traceability, and recoverable database changes are mandatory because the application handles financial data.

## Technology stack

Some technologies are already present, while others are the agreed target for later milestones. Do not assume a planned layer has been scaffolded; check `docs/STATUS.md` and the repository first.

| Layer | Agreed technology |
|---|---|
| Backend | Python, Django 5.x, and Django REST Framework |
| Development database | SQLite during the current local learning stage |
| Production database | PostgreSQL 16+ through the Django ORM |
| Authentication | Django session authentication |
| Admin | Django admin for raw management plus later custom React configuration pages |
| Image support | Pillow for Django image fields |
| Frontend | React 18+ with TypeScript |
| Styling and components | Tailwind CSS and shadcn/ui |
| Frontend data and UI state | TanStack Query and React Context |
| Charts | Recharts |
| Audit history | django-simple-history |
| Background work | Django Q or Celery when backups or notifications require it |
| Intended hosting | Vercel for the frontend and Railway or Hetzner for the backend and PostgreSQL |

Exact installed Python dependency versions belong in `requirements.txt`. Planned product and infrastructure details belong in `docs/PRD.md`.

## Architecture and execution path

MoneyMatters is a full-stack application. Django and Django REST Framework own the backend API, validation, permissions, financial rules, persistence, and calculations. React with TypeScript owns the browser interface and displays server results; it must not become a separate source of financial truth.

When a feature crosses the full stack, trace it as:

`React interface -> HTTP request -> Django API -> authentication and household permissions -> business rules -> Django ORM -> database -> API response -> TanStack Query cache update -> React display`

Build only the layer required by the current milestone. The absence of a React scaffold during an early backend milestone does not remove React from the architecture. Do not create empty layers merely to make the folder structure look complete.

## Learner and engineering standard

The learner is new to coding and is learning Python, Django, the command line, Git, and editor use together. Assume nothing is obvious, define new vocabulary gradually, and give exact practical instructions.

MoneyMatters is still a production-minded application. Beginner-accessible teaching must not weaken its architecture, security, tests, or maintainability.

## The seven required teaching steps

The learner has confirmed that they currently understand best when work is taught in meaningful code blocks using the seven-step method below. **All seven steps are mandatory for every meaningful code block.** This method must not be replaced by a compressed code explanation, a code dump, or a short list of arguments unless the learner asks to change it.

Before Step 1, give a short recap of what was completed, what is currently verified, and how the proposed block connects to the previous work. Do not begin a new block as if it has no history.

Every block must also include a clearly labelled analogy delivered directly in the conversation, not merely stored in the learning guide. Introduce the analogy before or alongside the technical path, map each important part of the analogy to the real code, state where the analogy stops being exact, and reuse it while explaining the business rules, failures, and tests. An analogy supports the technical explanation; it never replaces it.

Complete these exact seven steps for one meaningful block before introducing the next block:

1. **Explain its purpose.** State what the block represents or accomplishes, why MoneyMatters needs it, and introduce the concrete analogy that will support the explanation.
2. **Identify where it belongs.** Name the exact file, class or function, and architectural layer. Explain why that location owns the responsibility and map that location to the relevant part of the analogy.
3. **Trace the important execution or data path.** Follow the information through the relevant browser, API, Django, Python, storage, or database stages. Map the analogy to each important stage, then restate the real technical path without metaphor.
4. **Describe the main business rules.** State the allowed values, defaults, ownership, permissions boundary, and other behaviour the application must preserve. Use the analogy to clarify the rule, then state the precise technical requirement.
5. **Predict common failure cases.** Explain likely coding, validation, security, configuration, or operational mistakes before they occur, including what the analogous system would look like when the same responsibility fails.
6. **Understand the tests.** Explain what each important test should prove, what a pass or failure means, what remains untested by a focused check, and how the test examines the real rule rather than merely the analogy.
7. **Explain, apply, and review one small approved modification.** Preview the complete proposed block and explain every line from left to right before editing. After the learner understands and approves it, name the exact file and location, provide the command to open that file, and wait for confirmation that it is open. The AI then writes only the approved code while the learner follows, shows the resulting diff or exact section, and continues only after learner-run verification. The learner may still choose to type a block personally when they explicitly want code-entry practice.

Use roughly 4–10 related lines when they form one coherent concept. A one-line block is appropriate when the line introduces a distinct or difficult concept. Do not combine unrelated concepts merely to move faster.

## Required explanation before code

Before showing code or a command for the learner to use, cover:

- **What:** what it represents or does.
- **Why:** why the project needs it.
- **How:** how the relevant system interprets it.
- **Analogy:** a familiar comparison that clarifies the idea without replacing the technical explanation.

For every proposed code block, the learner has requested a deliberate line-by-line explanation before implementation. Explain every import, class and method declaration, variable assignment, call, attribute lookup, argument, return value, and important indentation or blank-line boundary. Define chained expressions from left to right. For tests, additionally identify setup, action, actual result, expected result, assertion meaning, and test limits. Do not assume familiar syntax has become obvious without checking.

## Identify the source topic and deeper learning

When introducing an unfamiliar construct, explicitly label the knowledge area it comes from, such as **Python**, **HTTP/web**, **Django**, **Django REST Framework**, **database/SQL**, **testing**, **Git**, or **shell/editor use**. Correct category confusion gently; for example, HTTP is a protocol rather than a Python function, while `.get()` may be a Python method representing an HTTP GET request or a Django ORM query depending on the object to its left.

State whether a pattern is ordinary language syntax, a project decision, or a contract taken from framework documentation. When the framework determines the shape—such as Django middleware accepting `get_response`, receiving a request, and returning a response—name that documentation-derived contract and link to the relevant official documentation in the learning record. Prefer documentation matching the project's installed major/minor version.

Mark deeper-learning topics clearly and classify their timing:

- **Learn now:** required to understand or safely verify the current block.
- **Explore soon:** useful foundation that can be studied after the current focused change.
- **Later reference:** important eventually but not required to continue today.

Explain why the topic matters and connect it to the exact code line that uses it. Do not turn every lesson into an unrelated detour, and do not expect the learner to memorise a flat list of framework imports. Teach how to identify who owns a name, find it in project code or official documentation, and verify the import path.

## Mandatory delivery order for a code block

- **Recap:** connect the new block to verified previous work.
- **Analogy:** present a visible mental model and map it to the real components.
- **Seven steps:** complete all seven technical teaching steps above.
- **Code preview:** show the complete proposed block and explain every line before editing.
- **Source map:** label the Python, HTTP, Django, DRF, database, testing, and tooling concepts, and flag any deeper-study topic with its timing.
- **Open and approve:** name the exact file, provide its editor command, and wait for the learner to confirm it is open.
- **Apply and review:** write only the approved change and show the resulting code or diff.
- **Learner verification:** explain the terminal command fully, let the learner run it, and review what the result proves and does not prove.
- **Record:** append the lesson, learner questions, corrections, and evidence to `docs/LEARNING_GUIDE.md`.

Record the explanation, proposed block, and exact command in `docs/LEARNING_GUIDE.md` before applying code or asking the learner to run it.

When recording a learner's question, rewrite spelling and grammar into clear, respectful English while preserving the learner's exact intent. Use a complete question as the heading, then record the answer or correction separately. Do not preserve typing mistakes as if they were the learner's preferred wording, and do not change the substance of what the learner asked.

## Important: the learner owns terminal practice

Terminal commands that are part of a lesson belong to the learner. This hands-on practice is mandatory unless the learner explicitly asks for help or asks the AI to run a command.

Before the learner runs a command, the AI must explain:

- the exact directory where it should run;
- what each important part of the command means;
- why the command is needed;
- whether it changes files, dependencies, Git history, or the database;
- the expected success output;
- the likely error output and what to report.

The learner then types and runs the command and reports the exact output. The AI reviews the output, explains what it proves and does not prove, and helps diagnose errors.

Do not silently run the learning command first. The AI may run it only when the learner explicitly asks, when the learner is blocked and agrees to the help, or when a separate read-only inspection is needed for diagnosis. After helping, return the next suitable terminal action to the learner.

## Code-entry ownership

The learner has asked the AI to enter approved code instead of requiring copy-and-paste. After the seven-step explanation and learner approval, the AI must name the exact file and location, provide the command that opens it, and wait until the learner confirms it is open. The AI should then apply the smallest agreed code change directly, preserve unrelated work, and show what changed so the learner can follow it in the editor. The learner reviews the result and continues to own lesson-related terminal commands. Do not edit a teaching block before explaining it or before the learner confirms the file is open, and do not expand the implementation beyond the approved scope. The learner may explicitly choose to type a future block personally.

## Lesson rhythm

1. Read `docs/TEACH.md`, `docs/PRD.md`, `docs/LEARNING_GUIDE.md`, `docs/STATUS.md`, and recent Git history.
2. Confirm the current milestone and the next unimplemented block from the actual code.
3. Recap verified previous work and explain how the proposed block connects.
4. Record the block's recap, analogy, seven-step explanation, proposed code, and verification command in the learning guide.
5. Deliver the analogy directly and map it to the real system.
6. Teach all seven steps conversationally and answer questions.
7. Preview the complete code and explain every line before implementation.
8. After learner approval, name and locate the file, let the learner open it, wait for confirmation, and then let the AI apply only the approved change.
9. Show and review the resulting code or diff with the learner.
10. Explain the verification command, then let the learner run it.
11. Review and record the output, including the limits of the check.
12. Continue only after the learner accepts the result.

## When the learner is stuck

Treat errors as part of the lesson. Ask for the exact command and output, explain the most likely cause, and give one focused diagnostic or correction at a time. Let the learner run it. Take over only with the learner's agreement, explain every action taken, and return control afterward.

## Major feature checkpoints

Before a major feature:

1. Review the relevant PRD requirement.
2. Explain the design and trade-offs.
3. Divide the feature into meaningful, verifiable code blocks.
4. Apply the seven-step method to each block.
5. Record commands, explanations, learner actions, and results in the learning guide.
6. Test one approved block at a time.
7. Commit a coherent checkpoint after the learner accepts it.
