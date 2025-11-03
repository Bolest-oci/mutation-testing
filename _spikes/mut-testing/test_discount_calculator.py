import pytest
from discount_calculator import calculate_discount


def test_regular_customer():
    assert calculate_discount(100, "regular") == 95.0


def test_vip_customer():
    assert calculate_discount(100, "vip") == 90.0


def test_employee_customer():
    assert calculate_discount(100, "employee") == 80.0


def test_coupon_extra10():
    assert calculate_discount(100, "vip", "EXTRA10") == 80.0


def test_coupon_halfprice():
    assert calculate_discount(100, "regular", "HALFPRICE") == 50.0


def test_negative_price_raises_error():
    with pytest.raises(ValueError):
        calculate_discount(-10, "vip")


def test_unknown_customer_type():
    assert calculate_discount(100, "unknown", "EXTRA10") == 90.0
