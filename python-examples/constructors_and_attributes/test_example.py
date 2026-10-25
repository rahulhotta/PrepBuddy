import pytest

from .example import BadPlaylist, Playlist, Track, main


def test_bad_playlist_shares_its_default_list() -> None:
    first, second = BadPlaylist("1"), BadPlaylist("2")
    assert first.songs is second.songs


def test_playlists_get_their_own_lists() -> None:
    first, second = Playlist("1"), Playlist("2")
    first.add("s")
    assert second.songs == []


def test_constructor_copies_caller_list() -> None:
    source = ["a"]
    playlist = Playlist("p", source)
    source.clear()
    assert playlist.songs == ["a"]


@pytest.mark.parametrize("kwargs", [{"name": ""}, {"name": "  "}, {"name": "ok", "max_songs": 0}])
def test_invalid_arguments_are_rejected(kwargs: dict[str, object]) -> None:
    with pytest.raises(ValueError):
        Playlist(**kwargs)  # type: ignore[arg-type]


def test_limit_is_enforced() -> None:
    playlist = Playlist("p", max_songs=1)
    playlist.add("a")
    with pytest.raises(ValueError, match="full"):
        playlist.add("b")


def test_name_is_normalised() -> None:
    assert Playlist("  road trip ").name == "road trip"


def test_dataclass_post_init_validation_and_independent_defaults() -> None:
    with pytest.raises(ValueError):
        Track("t", 0)
    assert Track("a", 1).tags is not Track("b", 1).tags


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
