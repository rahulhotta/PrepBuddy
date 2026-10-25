import threading
from collections.abc import Iterator

import pytest

from .example import FeatureFlags, Settings, UploadService, get_settings, main


@pytest.fixture(autouse=True)
def fresh_singletons() -> Iterator[None]:
    FeatureFlags.reset_for_tests()
    get_settings.cache_clear()
    yield
    FeatureFlags.reset_for_tests()
    get_settings.cache_clear()


def test_every_construction_returns_the_same_instance() -> None:
    assert FeatureFlags() is FeatureFlags()


def test_state_is_shared_and_not_reset_by_later_calls() -> None:
    FeatureFlags().enable("beta")
    assert FeatureFlags().is_enabled("beta")
    assert not FeatureFlags().is_enabled("other")


def test_reset_gives_a_fresh_instance_for_test_isolation() -> None:
    first = FeatureFlags()
    first.enable("beta")
    FeatureFlags.reset_for_tests()
    assert FeatureFlags() is not first
    assert not FeatureFlags().is_enabled("beta")


def test_concurrent_first_use_creates_exactly_one_instance() -> None:
    start = threading.Barrier(16)
    ids: list[int] = []
    ids_lock = threading.Lock()

    def worker() -> None:
        start.wait()
        instance = FeatureFlags()
        with ids_lock:
            ids.append(id(instance))

    threads = [threading.Thread(target=worker) for _ in range(16)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert len(ids) == 16
    assert len(set(ids)) == 1


def test_cached_factory_builds_once(capsys: pytest.CaptureFixture[str]) -> None:
    assert get_settings() is get_settings()
    assert capsys.readouterr().out == "loading settings\n"


def test_injected_settings_make_the_service_easy_to_test() -> None:
    assert UploadService(Settings("x", max_upload_mb=5)).accepts(5)
    assert not UploadService(Settings("x", max_upload_mb=5)).accepts(6)


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
