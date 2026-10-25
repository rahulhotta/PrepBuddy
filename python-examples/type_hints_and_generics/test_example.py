import pytest

from .example import Product, Repository, User, cheapest, double, first, main, swap


def test_repository_stores_and_returns_entities_by_id() -> None:
    repo = Repository[User]()
    repo.add(User("1", "a"))
    repo.add(User("1", "b"))
    assert repo.get("1") == User("1", "b")
    assert repo.get("missing") is None
    assert repo.all() == [User("1", "b")]


def test_repositories_are_independent() -> None:
    users, products = Repository[User](), Repository[Product]()
    users.add(User("x", "a"))
    assert products.all() == []


def test_generic_helpers() -> None:
    assert first((3, 4)) == 3
    assert first("") is None
    assert swap((1, "a")) == ("a", 1)
    assert cheapest([]) is None
    assert cheapest([Product("a", 2), Product("b", 1)]) == Product("b", 1)


def test_hints_are_not_runtime_checks() -> None:
    assert double("x") == "xx"  # type: ignore[arg-type]
    assert Repository.__type_params__[0].__name__ == "T"


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
