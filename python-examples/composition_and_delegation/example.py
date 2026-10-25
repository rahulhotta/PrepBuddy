"""Composition and delegation: a document is built from parts and forwards work to them."""

from __future__ import annotations

from collections.abc import Iterable
from typing import Any


class History:
    def __init__(self) -> None:
        self._snapshots: list[str] = []

    def save(self, text: str) -> None:
        self._snapshots.append(text)

    def undo(self) -> str | None:
        return self._snapshots.pop() if self._snapshots else None


class SpellChecker:
    def __init__(self, words: Iterable[str]) -> None:
        self._words = {w.lower() for w in words}

    def unknown(self, text: str) -> list[str]:
        return [w for w in text.lower().split() if w not in self._words]


class Document:
    def __init__(self, checker: SpellChecker) -> None:
        self.text = ""
        self._history = History()  # owned part: created here, lives with the document
        self._checker = checker  # injected part: may be shared and swapped

    def write(self, more: str) -> None:
        self._history.save(self.text)
        self.text += more

    def undo(self) -> None:
        previous = self._history.undo()  # explicit delegation
        if previous is not None:
            self.text = previous

    def typos(self) -> list[str]:
        return self._checker.unknown(self.text)


class AuditedDocument:
    """Wraps a document: records writes, forwards everything else automatically."""

    def __init__(self, inner: Document) -> None:
        self._inner = inner
        self.calls: list[str] = []

    def write(self, more: str) -> None:
        self.calls.append("write")
        self._inner.write(more)

    def __getattr__(self, name: str) -> Any:
        # Only called when normal lookup fails, so write() and calls are not forwarded.
        return getattr(self.__dict__["_inner"], name)


def main() -> None:
    checker = SpellChecker(["hello", "world"])

    doc = Document(checker)
    doc.write("hello ")
    doc.write("wrld")
    print(f"text: {doc.text!r}, typos: {doc.typos()}")
    doc.undo()
    print(f"after undo: {doc.text!r}")

    audited = AuditedDocument(Document(checker))
    audited.write("world")
    print(f"audited text: {audited.text!r}, calls: {audited.calls}, typos: {audited.typos()}")


if __name__ == "__main__":
    main()

# Expected output:
# text: 'hello wrld', typos: ['wrld']
# after undo: 'hello '
# audited text: 'world', calls: ['write'], typos: []
