import pytest

from .example import MemoryStore, ReadOnlyConfig, Store, is_logged_in, main, remember_login


def test_memory_store_round_trip() -> None:
    store = MemoryStore()
    assert not is_logged_in(store, "x")
    remember_login(store, "x")
    assert is_logged_in(store, "x")


def test_read_only_source_is_enough_for_readers() -> None:
    assert is_logged_in(ReadOnlyConfig({"login:z": "yes"}), "z")
    assert not is_logged_in(ReadOnlyConfig({}), "z")


def test_any_object_with_the_methods_is_a_store() -> None:
    class DictBacked:
        def __init__(self) -> None:
            self.d: dict[str, str] = {}

        def get(self, key: str) -> str | None:
            return self.d.get(key)

        def put(self, key: str, value: str) -> None:
            self.d[key] = value

    assert isinstance(DictBacked(), Store)
    assert isinstance(MemoryStore(), Store)
    assert not isinstance(ReadOnlyConfig({}), Store)


def test_config_is_copied() -> None:
    source = {"login:a": "yes"}
    config = ReadOnlyConfig(source)
    source.clear()
    assert is_logged_in(config, "a")


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
