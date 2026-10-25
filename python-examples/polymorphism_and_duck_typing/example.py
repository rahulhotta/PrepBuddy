"""Polymorphism and duck typing: anything with write() can receive a report."""

from __future__ import annotations

import io
from collections.abc import Iterable
from typing import Protocol


class SupportsWrite(Protocol):
    def write(self, text: str, /) -> object: ...


class ConsoleSink:
    def write(self, text: str) -> None:
        print(f"[console] {text}", end="")


class MemorySink:
    def __init__(self) -> None:
        self.lines: list[str] = []

    def write(self, text: str) -> None:
        self.lines.append(text.rstrip("\n"))

    def __len__(self) -> int:
        return len(self.lines)


def publish(lines: Iterable[str], sink: SupportsWrite) -> int:
    """Never checks the sink's type: it only needs write()."""
    count = 0
    for line in lines:
        sink.write(f"{line}\n")
        count += 1
    return count


def main() -> None:
    report = ["revenue up", "costs flat"]

    publish(report, ConsoleSink())

    memory = MemorySink()
    publish(report, memory)
    print(f"memory sink holds {len(memory)} lines")

    buffer = io.StringIO()  # standard library class, no shared base with ours
    publish(report, buffer)
    print(f"StringIO got {buffer.getvalue()!r}")


if __name__ == "__main__":
    main()

# Expected output:
# [console] revenue up
# [console] costs flat
# memory sink holds 2 lines
# StringIO got 'revenue up\ncosts flat\n'
