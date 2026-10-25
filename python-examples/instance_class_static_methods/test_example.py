import pytest

from .example import LabTemperature, Temperature, main


@pytest.fixture(autouse=True)
def reset_counter() -> None:
    Temperature.created = 0


def test_instance_method_uses_object_state() -> None:
    assert Temperature(100).to_fahrenheit() == 212


def test_class_method_builds_the_calling_class() -> None:
    assert type(Temperature.from_fahrenheit(50)) is Temperature
    lab = LabTemperature.from_fahrenheit(50)
    assert type(lab) is LabTemperature
    assert lab.celsius == 10


def test_static_method_needs_no_instance() -> None:
    assert Temperature.is_physical(-273.15)
    assert not Temperature.is_physical(-273.16)


def test_constructor_uses_static_rule() -> None:
    with pytest.raises(ValueError, match="absolute zero"):
        Temperature(-500)


def test_class_attribute_counts_instances_across_subclasses() -> None:
    Temperature(1)
    LabTemperature(2)
    assert Temperature.created == 2


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
