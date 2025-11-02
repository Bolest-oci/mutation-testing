def calculate_discount(price: float, customer_type: str, coupon_code: str | None = None) -> float:
    """
    Calculates the final price after applying discounts based on customer type and coupon.
    """
    if price < 0:
        raise ValueError("Price cannot be negative")

    discount = 0.0

    if customer_type == "regular":
        discount = 0.05
    elif customer_type == "vip":
        discount = 0.10
    elif customer_type == "employee":
        discount = 0.20

    if coupon_code == "EXTRA10":
        discount += 0.10
    elif coupon_code == "HALFPRICE":
        discount = 0.5

    final_price = price * (1 - discount)
    return round(final_price, 2)
