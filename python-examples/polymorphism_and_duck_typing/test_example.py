import io

import pytest

from .example import ConsoleSink, MemorySink, publish, main


def test_publish_works_with_any_object_that_has_write() -> None:
    class CountingSink:
        calls = 0

        def write(self, text: str) -> None:
            self.calls += 1

    sink = CountingSink()
    assert publish(["a", "b", "c"], sink) == 3
    assert sink.calls == 3


def test_memory_sink_supports_len() -> None:
    sink = MemorySink()
    publish(["x"], sink)
    assert len(sink) == 1
    assert sink.lines == ["x"]


def test_standard_library_object_is_a_valid_sink() -> None:
    buffer = io.StringIO()
    publish(["one"], buffer)
    assert buffer.getvalue() == "one\n"


def test_console_sink_prints(capsys: pytest.CaptureFixture[str]) -> None:
    publish(["hi"], ConsoleSink())
    assert capsys.readouterr().out == "[console] hi\n"


def test_object_without_write_fails_at_call_time() -> None:
    with pytest.raises(AttributeError):
        publish(["a"], object())  # type: ignore[arg-type]


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
