# Task: Build "Prepbook", an interview-prep study app (React + Vite), starting with Low Level Design taught in Python

Work in PLAN MODE first. Do not write code or create files until I approve the plan. In the plan, list your assumptions and questions, then break the work into phases.

## 0. Attached reference and project docs

I have attached `prepbook-blueprint.html`, a working prototype of the final look and behaviour. It is the visual source of truth.
After I approve the plan, as the first implementation step:

1. Create `reference/blueprint-prototype.html` as an exact copy of the attached file. If you cannot copy it exactly, stop and ask me to add it manually. Never rewrite it from memory.
2. Create a `docs/` folder with:

- `docs/PROJECT_BRIEF.md`: this prompt, saved as I wrote it
- `docs/DESIGN_TOKENS.md`: colours, fonts, spacing and component rules extracted from the prototype
- `docs/CONTENT_GUIDE.md`: the content model, writing rules and the checklist for adding a new pattern
- `docs/SYLLABUS_COVERAGE.md`: a checklist of every syllabus item (section 7) with a status column
3. Create `.github/copilot-instructions.md` with short, standing rules: stack, folder layout, "content is original and never copied from the book", "Python examples must run and pass pytest", and "match `reference/blueprint-prototype.html`".

## 1. Goal

A static single-page app for interview preparation. Navigation is Topic → Subject → Materials.
Materials per subject: Q&A, Flashcards, Diagram, Explanation, Case study. Only show the tabs a subject has.
Phase 1 covers one topic, "Low Level Design" (OOP principles and design patterns), with all code examples in Python. The structure must scale to many topics and thousands of Q&As.

## 2. Tech stack

- Vite + React + TypeScript, React Router (`/`, `/:topic`, `/:topic/:subject`, `/:topic/:subject/:material`)
- State: Zustand with `persist` (localStorage) for progress: mastered cards, understood Q&A, covered case-study steps
- Content as files, not code: MDX for notes, JSON for Q&A, cards, diagrams and case studies
- Lazy-load each topic's content with dynamic `import()`. The home page needs only a small index.
- Search: Fuse.js or FlexSearch, with the index built at build time and loaded on first search
- Validate all content with Zod: `npm run validate:content`, run in CI and before build
- Long lists: paginate or virtualize
- Tests: Vitest + React Testing Library for the progress store, content loader and flashcard component
- No backend. Deployable as static files.

## 3. Folder structure

```
src/
  content/<topic>/<subject>/{meta.json, notes.mdx, qa.json, cards.json, diagram.json, case-study.json}
  content/index.ts
  features/{topics, subjects, qa, flashcards, diagram, case-study, search, progress}
  components/  routes/  styles/
python-examples/<subject>/{example.py, test_example.py}
scripts/{validate-content.ts, validate-coverage.ts}
reference/  docs/  .github/
```

## 4. Visual design: "Blueprint in colour" (match the prototype)

Drafting-sheet look: blue grid paper, thin white outlines, square corners, no gradients, no emoji.

- Tokens: bg `#0a3b7f`, panel `rgba(6,36,84,.5)`, line `#e8f0ff`, text `#f2f7ff`, muted `#c4d6f5`, on-accent `#0b2f66`
- Topic accents: yellow `#ffd23f`, coral `#ff8f70`, mint `#5eead4`, lilac `#c4a7ff`. Low Level Design is yellow.
- Background: 32px grid from two 1px `rgba(255,255,255,.1)` linear-gradients; the app sits inside a 2px outlined frame
- Fonts (Google Fonts): Barlow Condensed (headings, uppercase), Space Mono (labels, buttons), Barlow (body)
- Home: headline with "build systems" highlighted in yellow, a dashed yellow "Question of the day" note, a grid of topic sheets
- Sheet card: 1.5px outline, 6px accent top border, overhanging accent tag ("SHEET 01"), line-art icon, subject list with accent bullets, 10-segment progress ticks
- Subject page: breadcrumb (`INDEX / LOW LEVEL DESIGN / OBSERVER`), rectangular tabs (selected = accent fill), panel with 6px accent top border
- Flashcards: 3D flip, front QUESTION, back accent-filled ANSWER; buttons Previous, Again, Got it, Next, Shuffle
- Q&A: expandable items with a Q/A badge and "Mark understood"; case study: numbered steps marked COVERED on select
- Respect `prefers-reduced-motion`; real buttons and links, visible focus rings, AA contrast, keyboard operable

## 5. Diagram renderer (important for LLD)

Build a small SVG renderer driven by `diagram.json`, with no heavy dependencies:

- UML-style class nodes (name, fields, methods, optional `<<interface>>`)
- Relationships: inheritance, implements (dashed, hollow arrowhead), association, aggregation, composition, dependency
- Plain box nodes with labelled arrows for flows, filled with accent colours
- Animated dashed edges for direction (off for reduced motion); horizontal scroll on narrow screens; `aria-label` plus a text description for every diagram

## 6. Content model and Python examples (validate with Zod)

- `meta.json`: `{ id, title, tag, category: "principle"|"creational"|"structural"|"behavioral"|"compound"|"real-world"|"case-study", order, materials }`
- `qa.json`: `[{ id, question, answer (markdown), difficulty: 1-3 }]`; `cards.json`: `[{ id, front, back }]`
- `diagram.json`: nodes, edges, optional title; `case-study.json`: `{ title, steps: [{ heading, body }] }`
- `notes.mdx` sections: Intent, Problem, Solution, Structure, When to use, Trade-offs, Interview pitfalls, Related patterns, **Pythonic note**
- Code is Python 3.12+: type hints, `abc.ABC` or `typing.Protocol`, `dataclasses`. Every example lives in `python-examples/<subject>/example.py` with a pytest file `test_example.py`. The app imports the real file (Vite `?raw`) so the code shown is the code that runs. Include expected output as a comment.
- The Pythonic note says how idiomatic Python changes the pattern (for example first-class functions for Strategy and Command, modules for Singleton, generators for Iterator, `functools.wraps` decorators versus the Decorator pattern). It also says when the classic class-based version is still the better answer in an interview.
- CI runs `npm run validate:content`, `npm test`, `pytest` and `npm run build`.

## 7. Syllabus (use "Head First Design Patterns" by Freeman & Robson only as the outline)

Do NOT reproduce or closely paraphrase its text, jokes, dialogues, exercises or running examples. Use fresh examples from other domains (notifications, payments, document editors, ride booking, game inventory).

1. Principles: encapsulate what varies, favour composition over inheritance, program to an interface, loose coupling, open/closed, dependency inversion, single responsibility, least knowledge, Hollywood principle
2. Patterns: Strategy, Observer, Decorator, Simple Factory idiom, Factory Method, Abstract Factory, Singleton, Command, Adapter, Facade, Template Method, Iterator, Composite, State, Proxy (remote, virtual and protection variants)
3. Compound patterns: patterns working together, MVC, and how the web variant of MVC differs
4. Patterns in the real world: what a pattern is, pattern categories, how to use patterns in a design, when not to use them, anti-patterns
5. Additional patterns: Bridge, Builder, Chain of Responsibility, Flyweight, Interpreter, Mediator, Memento, Prototype, Visitor
6. Comparison subjects: Strategy vs State, Adapter vs Facade vs Decorator vs Proxy, Factory Method vs Abstract Factory
7. Classic LLD problems as case studies: Parking Lot, Elevator, Library Management, Vending Machine, Ride Booking, Logger, LRU Cache
I will paste the book's table of contents into `docs/SYLLABUS_COVERAGE.md`. Add any chapter or section it lists that is missing above, and make `npm run validate:coverage` fail if a syllabus item has no subject.
Per pattern, produce 6-8 interview-style Q&As (definition, comparison, "when not to use it", scenario), 8-10 flashcards, a class diagram, the notes file, and a runnable Python example with tests.
Add a "Sources" footer: "Syllabus inspired by Head First Design Patterns, Freeman & Robson."

## 8. Phasing

- Phase 0: create the reference and docs files (section 0)
- Phase 1: scaffold, design tokens, routing, content loader, Zustand progress store, Zod validation, and all five material views working on placeholder content
- Phase 2: fully author Strategy, Observer and Singleton end to end (content, diagram, Python example and tests) as the quality bar I review
- Phase 3: author the rest in batches of 3-4, validating after each batch
- Phase 4: search, Question of the day, progress ticks everywhere, accessibility pass, static deploy

## 9. Definition of done

`npm run dev`, `npm run build`, `npm run validate:content`, `npm run validate:coverage`, `npm test` and `pytest` all pass. Every subject loads lazily. Progress persists across reloads. No console errors. Lighthouse accessibility is 95 or higher.

i have added the design file re reference/prepbook-blueprint.html

---

## Amendment (2026-10-25): source outline changed

The syllabus source is now **Awesome Low Level Design** instead of *Head First Design Patterns*. Section 7 above is superseded by `docs/SYLLABUS_COVERAGE.md`, and the Sources footer reads "Syllabus inspired by Awesome Low Level Design." All other rules (original content, Python examples with tests, per-pattern Q&A and card counts) still apply.
