import pytest

from .example import AuditedDocument, Document, History, SpellChecker, main

CHECKER = SpellChecker(["a", "b"])


def test_history_undo_on_empty_returns_none() -> None:
    assert History().undo() is None


def test_document_delegates_undo_to_its_history() -> None:
    doc = Document(CHECKER)
    doc.write("a")
    doc.write(" b")
    doc.undo()
    doc.undo()
    doc.undo()
    assert doc.text == ""


def test_each_document_owns_its_own_history() -> None:
    first, second = Document(CHECKER), Document(CHECKER)
    first.write("x")
    second.undo()
    assert first.text == "x"


def test_injected_checker_can_be_swapped() -> None:
    doc = Document(CHECKER)
    doc.write("a c")
    assert doc.typos() == ["c"]
    doc._checker = SpellChecker(["a", "c"])
    assert doc.typos() == []


def test_wrapper_forwards_unknown_attributes_and_records_writes() -> None:
    audited = AuditedDocument(Document(CHECKER))
    audited.write("a")
    audited.write("z")
    audited.undo()
    assert audited.text == "a"
    assert audited.calls == ["write", "write"]
    with pytest.raises(AttributeError):
        audited.missing  # noqa: B018


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
