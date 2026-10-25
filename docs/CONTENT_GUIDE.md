# Content guide

All study content lives in files under `src/content/` and `python-examples/`. Code never contains study text.
`npm run validate:content` checks everything below; fix every error before committing.

## Layout

```
src/content/<topic>/topic.json
src/content/<topic>/<subject>/meta.json        required
src/content/<topic>/<subject>/qa.json          material "qa"
src/content/<topic>/<subject>/cards.json       material "flashcards"
src/content/<topic>/<subject>/diagram.json     material "diagram"
src/content/<topic>/<subject>/notes.mdx        material "explanation"
src/content/<topic>/<subject>/case-study.json  material "case-study"
python-examples/<subject_id_with_underscores>/{__init__.py, example.py, test_example.py}
```

- Topic and subject ids are lowercase kebab-case (`factory-method`). Subject ids are unique across all topics.
- The Python folder is the subject id with `-` replaced by `_` (`factory-method` → `factory_method`) so it is an importable package.
- Every material listed in `meta.json` must have its file, and every file must be listed.

## Schemas

**topic.json**: `{ id, title, blurb, accent: "yellow"|"coral"|"mint"|"lilac", icon: "lld"|"hld"|"ang"|"dsa", order, sections: [{ id, title }] }`. Sections are the syllabus chapters, in display order; the topic page groups subjects under them.

**meta.json**
```json
{
  "id": "strategy",
  "title": "Strategy",
  "tag": "Behavioral pattern",
  "section": "behavioral-patterns",
  "category": "behavioral",
  "order": 809,
  "materials": ["qa", "flashcards", "diagram", "explanation"],
  "example": true,
  "status": "complete"
}
```
- `section`: one of the topic's section ids (the syllabus chapter).
- `order`: chapter number x 100 + item number (`8.9` becomes `809`), so subjects follow the syllabus.
- `category`: `concept | principle | creational | structural | behavioral | case-study`. It drives validation: pattern categories need the nine notes headings, Q&A/card counts and a Python example; `case-study` (the interview problems) needs a Python example.
- `materials`: any of `qa | flashcards | diagram | explanation | case-study`, in tab order.
- `example`: `true` when `python-examples/<subject>/` exists. Required for creational, structural, behavioral and case-study subjects.
- `status`: `placeholder | draft | complete`. `complete` turns on the count checks below.

**qa.json**: `[{ "id": "strategy-qa-01", "question": "...", "answer": "markdown", "difficulty": 1 }]` (difficulty 1–3)

**cards.json**: `[{ "id": "strategy-card-01", "front": "...", "back": "..." }]`

**case-study.json**: `{ "title": "...", "steps": [{ "heading": "...", "body": "..." }] }`

**diagram.json**
```json
{
  "title": "Strategy class diagram",
  "description": "Plain-text description read by screen readers and shown under the figure.",
  "width": 640, "height": 360,
  "nodes": [
    { "id": "ctx", "kind": "class", "x": 20, "y": 20, "width": 200, "name": "Checkout",
      "fields": ["- fee_policy: FeePolicy"], "methods": ["+ total(amount)"] },
    { "id": "fp", "kind": "class", "x": 380, "y": 20, "name": "FeePolicy", "stereotype": "interface",
      "methods": ["+ fee(amount)"] },
    { "id": "user", "kind": "box", "x": 20, "y": 250, "width": 120, "height": 50, "label": ["Client"], "color": 0 }
  ],
  "edges": [
    { "from": "ctx", "to": "fp", "type": "aggregation", "label": "uses" }
  ]
}
```
- Edge types and arrowheads:
  - `inheritance`: solid line, hollow triangle at `to` (the parent)
  - `implements`: dashed line, hollow triangle at `to` (the interface)
  - `association`: solid line, open arrow at `to`
  - `dependency`: dashed line, open arrow at `to`
  - `aggregation`: solid line, hollow diamond at `from` (the whole)
  - `composition`: solid line, filled diamond at `from` (the whole)
  - `flow`: animated dashed line, filled arrow at `to` (for box diagrams)
- Box `color` indexes the fill cycle: 0 yellow, 1 mint, 2 lilac, 3 coral.
- Class node height is computed from its rows; keep nodes inside `width` × `height`.

## Mock interviews

Each topic sheet offers a mock interview using Q&A from its subjects. Adding Q&A automatically makes those questions available; no separate interview question bank is needed. Questions are shuffled once per interview and presented without repeats in sets of up to 10. Answers stay hidden until revealed. After a set, the learner can continue or end the interview. Interview sessions are not saved.

Keep questions self-contained: an interview can show them without surrounding notes or earlier questions. Model answers support Markdown, just like the Q&A tab. Shared interview labels and instructions live in `src/content/mock-interview.json`.

## IDs and study interactions

- Q&A ids: `<subject>-qa-NN`; card ids: `<subject>-card-NN`. Keep published ids stable and append new items with the next number.
- Study progress is not tracked or saved. Q&A answers expand, flashcards flip and support previous/next/shuffle, and case-study steps are a read-only ordered list.
- Syllabus coverage remains a separate authoring check in `docs/SYLLABUS_COVERAGE.md`.

## notes.mdx

Pattern subjects (creational, structural, behavioral) use exactly these `##` headings in this order:

1. Intent
2. Problem
3. Solution
4. Structure
5. When to use
6. Trade-offs
7. Interview pitfalls
8. Related patterns
9. Pythonic note

Other categories may use their own headings but should keep the same tone. The Python example is appended automatically below the notes; do not paste it into the MDX.

Concept and principle subjects use exactly these `##` headings, in order:

1. Overview
2. Key ideas
3. Example
4. Common mistakes
5. Interview angle
6. Related topics

When `status` is `complete` they need 3–6 Q&As, 4–8 flashcards and the `qa`, `flashcards` and `explanation` materials. A diagram, case-study checklist or Python example is added where it helps (Python fundamentals always get a tested example).

## Python examples

- Python 3.12+: type hints everywhere, `abc.ABC` or `typing.Protocol`, `dataclasses` where data is carried.
- `example.py` runs on its own (`python example.py`) and ends with a `main()` guarded by `if __name__ == "__main__":`, followed by an `# Expected output:` comment block that matches the real output exactly.
- `test_example.py` imports with `from .example import ...` and covers the pattern's key behaviour (not just "it runs"). It also checks that `main()` prints the expected output, using the shared `expected_output` fixture from `python-examples/conftest.py`:
  ```python
  def test_main_matches_expected_output(capsys, expected_output):
      main()
      assert capsys.readouterr().out == expected_output
  ```
- No third-party packages.
- Local setup: `py -m venv .venv`, `.venv\Scripts\python -m pip install -r requirements-dev.txt`, then `.venv\Scripts\python -m pytest`.

## Writing rules

- **Original content only.** "Awesome Low Level Design" is used as a syllabus outline (chapter and item names in `docs/SYLLABUS_COVERAGE.md`). Never copy or closely paraphrase its text, code, diagrams or problem solutions; design every example and solution yourself.
- Do not reuse other books' signature examples either (for example the ducks, weather station or coffee shop from *Head First Design Patterns*).
- Use fresh domains: notifications, payments, document editors, ride booking, game inventory, logistics, streaming.
- Write for a learner who is new to the topic. Start each lesson with a plain-language explanation before introducing formal terms.
- Use plain, direct English and short paragraphs. Explain technical terms the first time they appear, and use a small concrete example to show what they mean.
- Break processes into numbered steps. Keep lists focused; explain why a choice matters instead of only naming a principle or pattern.
- Avoid unexplained acronyms, dense sentences, and wording that assumes the learner already understands a related topic.
- Q&A answers are interview answers: lead with the one-sentence answer, then reasoning, then an example. Markdown allowed; raw HTML is not rendered.
- Flashcards: one fact per card. Front is a question under ~12 words; back under ~40 words.
- No emoji.

## Checklist: adding a pattern

1. Add a row (or fill the subject id) in `docs/SYLLABUS_COVERAGE.md`.
2. Create `src/content/low-level-design/<id>/meta.json` with `status: "draft"`.
3. Write `python-examples/<id_underscored>/__init__.py`, `example.py` (with `# Expected output:`), `test_example.py`; run `py -m pytest`.
4. Write `notes.mdx` with all nine headings, including a Pythonic note that says how idiomatic Python changes the pattern and when the classic class version is still the better interview answer.
5. Write 6–8 Q&As: at least one definition, one comparison, one "when not to use it", one scenario.
6. Write 8–10 flashcards.
7. Draw `diagram.json` as a UML class diagram with a real `description`.
8. Set `status: "complete"`, run `npm run validate:content` and `npm run validate:coverage`, then check the pages in `npm run dev`.
9. Update the row status in `docs/SYLLABUS_COVERAGE.md` to `DONE`.
