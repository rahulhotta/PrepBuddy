"""Constructors: build objects that are valid from the moment they exist."""

from __future__ import annotations

from dataclasses import dataclass, field


class BadPlaylist:
    def __init__(self, name: str, songs: list[str] = []) -> None:  # deliberate bug: shared default
        self.name = name
        self.songs = songs


class Playlist:
    def __init__(self, name: str, songs: list[str] | None = None, *, max_songs: int = 100) -> None:
        if not name.strip():
            raise ValueError("name must not be empty")
        if max_songs < 1:
            raise ValueError("max_songs must be at least 1")
        self.name = name.strip()
        self.songs = list(songs) if songs is not None else []  # defensive copy
        self.max_songs = max_songs

    def add(self, song: str) -> None:
        if len(self.songs) >= self.max_songs:
            raise ValueError("playlist is full")
        self.songs.append(song)


@dataclass
class Track:
    title: str
    seconds: int
    tags: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        if self.seconds <= 0:
            raise ValueError("seconds must be positive")


def main() -> None:
    a, b = BadPlaylist("a"), BadPlaylist("b")
    a.songs.append("intro")
    print(f"bad: b.songs={b.songs}")

    c, d = Playlist("c"), Playlist("d")
    c.add("intro")
    print(f"good: d.songs={d.songs}")

    source = ["x"]
    copied = Playlist("copy", source)
    source.append("y")
    print(f"defensive copy: {copied.songs}")

    try:
        Playlist("   ")
    except ValueError as exc:
        print(f"rejected: {exc}")

    print(Track("Overture", 95))


if __name__ == "__main__":
    main()

# Expected output:
# bad: b.songs=['intro']
# good: d.songs=[]
# defensive copy: ['x']
# rejected: name must not be empty
# Track(title='Overture', seconds=95, tags=[])
