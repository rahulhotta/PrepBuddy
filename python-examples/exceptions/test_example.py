import pytest

from .example import (
    InvalidQuantity,
    Inventory,
    InventoryError,
    OutOfStock,
    UnknownSku,
    main,
    parse_quantity,
    place_order,
)


def test_out_of_stock_carries_data_and_is_an_inventory_error() -> None:
    inventory = Inventory({"a": 1})
    with pytest.raises(OutOfStock) as info:
        inventory.reserve("a", 2)
    assert (info.value.sku, info.value.requested, info.value.available) == ("a", 2, 1)
    assert isinstance(info.value, InventoryError)


def test_unknown_sku_hides_the_key_error() -> None:
    with pytest.raises(UnknownSku) as info:
        Inventory({}).reserve("zz", 1)
    assert info.value.__cause__ is None
    assert info.value.__suppress_context__


def test_misuse_is_a_value_error_not_a_domain_error() -> None:
    with pytest.raises(ValueError) as info:
        Inventory({"a": 1}).reserve("a", -1)
    assert not isinstance(info.value, InventoryError)


def test_failed_order_rolls_back_earlier_lines() -> None:
    inventory = Inventory({"a": 5, "b": 0})
    assert place_order(inventory, {"a": 3, "b": 1}).startswith("failed")
    assert inventory.stock == {"a": 5, "b": 0}


def test_successful_order_reserves_everything() -> None:
    inventory = Inventory({"a": 5, "b": 1})
    assert place_order(inventory, {"a": 5, "b": 1}) == "placed"
    assert inventory.stock == {"a": 0, "b": 0}


def test_translation_keeps_the_cause() -> None:
    assert parse_quantity("7") == 7
    with pytest.raises(InvalidQuantity) as info:
        parse_quantity("x")
    assert isinstance(info.value.__cause__, ValueError)


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
