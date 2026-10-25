# Prepbook: standing rules

- **Stack:** Vite + React + TypeScript, React Router, Zustand (`persist`), Zod, MDX, Shiki (build time), FlexSearch, Vitest + React Testing Library. Static site, no backend.
- **Layout:** content in `src/content/<topic>/<subject>/` (`meta.json`, `qa.json`, `cards.json`, `diagram.json`, `notes.mdx`, `case-study.json`); features in `src/features/*`; shared UI in `src/components/`; pages in `src/routes/`; CSS in `src/styles/`; Python in `python-examples/<subject_underscored>/`; tooling in `scripts/`.
- **Content is original and never copied from the source.** "Awesome Low Level Design" is an outline only (`docs/SYLLABUS_COVERAGE.md`): no copied text, examples or solutions. Follow `docs/CONTENT_GUIDE.md`.
- **Python examples must run and pass pytest.** Python 3.12+, type hints, `abc`/`Protocol`, `dataclasses`, stdlib only, `# Expected output:` comment that matches reality.
- **Match `reference/blueprint-prototype.html`.** Use tokens from `src/styles/tokens.css` (`docs/DESIGN_TOKENS.md`); square corners, no gradients, no emoji.
- Text lives in content files, never in components. Validate with `npm run validate:content`.
- Accessibility: real links for navigation, real buttons for actions, visible focus, `prefers-reduced-motion` respected.
- Before finishing: `npm run validate:content`, `npm run validate:coverage`, `npm test`, `.venv\Scripts\python -m pytest`, `npm run build`.
