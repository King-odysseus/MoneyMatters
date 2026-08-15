# MoneyMatters Teaching Method

This file is the permanent teaching contract for MoneyMatters. Every AI agent must read it before teaching, proposing code, or asking the learner to run a command. `docs/LEARNING_GUIDE.md` remains the chronological record of lessons, commands, explanations, learner answers, and verification results.

## Learner and engineering standard

The learner is new to coding and is learning Python, Django, the command line, Git, and editor use together. Assume nothing is obvious, define new vocabulary gradually, and give exact practical instructions.

MoneyMatters is still a production-minded application. Beginner-accessible teaching must not weaken its architecture, security, tests, or maintainability.

## Full-stack teaching scope

MoneyMatters is a full-stack project: Django and Django REST Framework provide the backend API, while React with TypeScript provides the frontend user interface. PostgreSQL is the intended production database. The current repository may contain only the layers reached so far in the guided rebuild; the absence of a React scaffold at an early backend milestone does not remove React from the agreed architecture.

Teaching must help the learner understand both sides and the path between them. When a feature eventually crosses layers, trace the complete flow: `React interface -> HTTP request -> Django API -> business rules -> database -> API response -> React update`. Still build one meaningful block at a time. Do not introduce frontend scaffolding merely to make the folder exist; create it when the agreed milestone reaches frontend work, using the same seven required teaching steps and learner-owned terminal practice.

## The seven required teaching steps

The learner has confirmed that they currently understand best when work is taught in meaningful code blocks using the seven-step method below. **All seven steps are mandatory for every meaningful code block.** This method must not be replaced by a compressed code explanation, a code dump, or a short list of arguments unless the learner asks to change it.

Complete these exact seven steps for one meaningful block before introducing the next block:

1. **Explain its purpose.** State what the block represents or accomplishes and why MoneyMatters needs it.
2. **Identify where it belongs.** Name the exact file, class or function, and architectural layer. Explain why that location owns the responsibility.
3. **Trace the important execution or data path.** Follow the information through the relevant browser, API, Django, Python, storage, or database stages.
4. **Describe the main business rules.** State the allowed values, defaults, ownership, permissions boundary, and other behaviour the application must preserve.
5. **Predict common failure cases.** Explain likely coding, validation, security, configuration, or operational mistakes before they occur.
6. **Understand the tests.** Explain what each important test should prove, what a pass or failure means, and what remains untested by a focused check.
7. **Give the learner one small modification.** Let the learner personally make one safe, relevant change, then inspect and review it together before continuing.

Use roughly 4–10 related lines when they form one coherent concept. A one-line block is appropriate when the line introduces a distinct or difficult concept. Do not combine unrelated concepts merely to move faster.

## Required explanation before code

Before showing code or a command for the learner to use, cover:

- **What:** what it represents or does.
- **Why:** why the project needs it.
- **How:** how the relevant system interprets it.
- **Analogy:** a familiar comparison that clarifies the idea without replacing the technical explanation.

Record the explanation, proposed block, and exact command in `docs/LEARNING_GUIDE.md` before asking the learner to type or run it.

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

## Editor ownership

Tell the learner exactly which file to open, how to open it with a command or editor action, where the block belongs, what should remain unchanged, and how to save it. The learner should make the agreed small modification whenever practical. The AI should not silently edit the learning block first.

## Lesson rhythm

1. Read `docs/TEACH.md`, `docs/PRD.md`, `docs/LEARNING_GUIDE.md`, `docs/STATUS.md`, and recent Git history.
2. Confirm the current milestone and the next unimplemented block from the actual code.
3. Record the block's seven-step explanation in the learning guide.
4. Teach the seven steps conversationally and answer questions.
5. Show the exact proposed code or command only after its explanation.
6. Let the learner make the small code change.
7. Inspect the learner's change without silently correcting it.
8. Explain the verification command, then let the learner run it.
9. Review and record the output, including the limits of the check.
10. Continue only after the learner accepts the result.

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
