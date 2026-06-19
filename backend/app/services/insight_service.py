from typing import TYPE_CHECKING

from app.models.enums import Currency, OperationType
from app.schemas.insight import AVMEstimate, PropertyInsight

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

DISTRICT_BASE_USD_M2 = {
    "Yunusobod": 1250, "Chilonzor": 1150, "Mirzo Ulug'bek": 1350,
    "Yakkasaroy": 1500, "Sergeli": 900, "Olmazor": 1000,
    "Uchtepa": 950, "Bektemir": 850, "Mirobod": 1400, "Shayxontohur": 1100,
}

DISTRICT_QUALITY = {
    "Yunusobod": {"noise": 65, "air": 70, "green": 80, "transport": 75, "school": 85},
    "Chilonzor": {"noise": 60, "air": 60, "green": 65, "transport": 80, "school": 70},
    "Mirzo Ulug'bek": {"noise": 70, "air": 75, "green": 75, "transport": 70, "school": 80},
    "Yakkasaroy": {"noise": 55, "air": 55, "green": 60, "transport": 85, "school": 75},
    "Sergeli": {"noise": 65, "air": 65, "green": 70, "transport": 60, "school": 60},
    "Olmazor": {"noise": 70, "air": 70, "green": 75, "transport": 65, "school": 65},
    "Mirobod": {"noise": 50, "air": 50, "green": 55, "transport": 80, "school": 80},
}

DEFAULT_QUALITY = {"noise": 60, "air": 60, "green": 60, "transport": 65, "school": 65}


def _usd_price(prop) -> float:
    price = float(prop.price)
    if prop.currency == Currency.UZS:
        return price / 12600
    return price


def build_property_insight(prop) -> PropertyInsight:
    area = prop.area_m2 or 1
    base_m2 = DISTRICT_BASE_USD_M2.get(prop.district, 1050)
    premium = 1.0
    if prop.is_verified:
        premium += 0.04
    if prop.property_type.value == "new_building":
        premium += 0.08
    if prop.repair_type and "kapital" in prop.repair_type.lower():
        premium += 0.05
    estimated = round(base_m2 * area * premium, 2)
    price_usd = _usd_price(prop)
    delta = round(((price_usd - estimated) / estimated) * 100, 1) if estimated else 0

    if delta <= -8:
        price_label = "Bozordan arzon"
        tip = "Narx bozordan past. Hujjat va joylashuvni tez tekshirib, ko'rishga yozilish ma'qul."
    elif delta >= 10:
        price_label = "Bozordan yuqori"
        tip = "Savdoda tuman o'rtacha narxi va m² qiymatini asos qilib chegirma so'rang."
    else:
        price_label = "Bozorga mos"
        tip = "Narx bozorga yaqin. Remont, hujjat va kommunal holat bo'yicha savdolashing."

    amenity_score = min(len(prop.amenities or []) * 6, 36)
    mahalla_score = min(100, 52 + amenity_score + (10 if prop.is_verified else 0))
    commute_score = min(100, 55 + (18 if "metro" in (prop.amenities or []) else 0) + (8 if prop.district in {"Yunusobod", "Chilonzor", "Yakkasaroy"} else 0))
    liquidity_score = min(100, 48 + int(prop.views_count / 20) + (12 if prop.operation_type == OperationType.sale else 4))
    trust_score = min(100, 45 + (30 if prop.is_verified else 0) + (10 if prop.images else 0) + (8 if prop.document_status else 0))
    scam_risk = "past" if trust_score >= 75 else "o'rtacha" if trust_score >= 55 else "yuqori"

    q = DISTRICT_QUALITY.get(prop.district, DEFAULT_QUALITY)
    noise_score = q["noise"]
    air_quality_score = q["air"]
    green_zone_score = q["green"]
    transport_score = q["transport"]
    school_rating = q["school"]

    if "metro" in (prop.amenities or []):
        transport_score = min(100, transport_score + 10)
        commute_score = min(100, commute_score + 15)

    family_score = min(100, int((school_rating * 0.35 + green_zone_score * 0.25 + noise_score * 0.15 + mahalla_score * 0.25)))
    solo_score = min(100, int((commute_score * 0.35 + transport_score * 0.25 + liquidity_score * 0.25 + noise_score * 0.15)))
    investor_score = min(100, int((liquidity_score * 0.40 + (100 - abs(delta)) * 0.30 + trust_score * 0.30)))

    mortgage = None
    if prop.operation_type == OperationType.sale and prop.currency == Currency.USD:
        annual_rate = 0.22
        months = 15 * 12
        principal = price_usd * 0.75
        monthly_rate = annual_rate / 12
        mortgage = round(principal * monthly_rate * (1 + monthly_rate) ** months / ((1 + monthly_rate) ** months - 1), 2)

    highlights = []
    if prop.is_verified:
        highlights.append("Tekshirilgan e'lon")
    if "metro" in (prop.amenities or []):
        highlights.append("Metroga yaqin")
    if delta <= -8:
        highlights.append("Narx imkoniyati bor")
    if prop.views_count > 300:
        highlights.append("Talab yuqori")
    if prop.is_urgent:
        highlights.append("Tez sotish")

    return PropertyInsight(
        estimated_market_price=estimated,
        price_delta_percent=delta,
        price_label=price_label,
        mahalla_score=mahalla_score,
        commute_score=commute_score,
        liquidity_score=liquidity_score,
        trust_score=trust_score,
        scam_risk=scam_risk,
        mortgage_monthly_usd=mortgage,
        negotiation_tip=tip,
        highlights=highlights,
        noise_score=noise_score,
        air_quality_score=air_quality_score,
        green_zone_score=green_zone_score,
        transport_score=transport_score,
        school_rating=school_rating,
        family_score=family_score,
        solo_score=solo_score,
        investor_score=investor_score,
    )


def estimate_avm(prop, db: "Session") -> AVMEstimate:
    from app.models.property import Property

    area = prop.area_m2 or 1
    base_m2 = DISTRICT_BASE_USD_M2.get(prop.district, 1050)

    similar = (
        db.query(Property)
        .filter(
            Property.district == prop.district,
            Property.status == "active",
            Property.property_type == prop.property_type,
        )
        .all()
    )

    similar_prices = []
    for s in similar:
        if s.id != prop.id and s.area_m2 and s.area_m2 > 0:
            sp = _usd_price(s)
            similar_prices.append(sp / s.area_m2)

    adjustments = []
    mid = base_m2 * area
    if similar_prices:
        avg_m2 = sum(similar_prices) / len(similar_prices)
        mid = avg_m2 * area
    else:
        similar_prices = [base_m2]

    min_val = mid * 0.9
    max_val = mid * 1.1

    if area < 40:
        adjustments.append("Kichik maydon — m² narxi yuqoriroq")
    elif area > 120:
        adjustments.append("Katta maydon — m² narxi pastroq")

    if prop.floor and prop.total_floors:
        if prop.floor <= 2:
            adjustments.append("Past qavat — qulaylik uchun +3%")
        elif prop.floor == prop.total_floors:
            adjustments.append("Yuqori qavat — shovqin kam, +2%")

    if "metro" in (prop.amenities or []):
        adjustments.append("Metro yaqinligi — +5-8%")
    if prop.is_verified:
        adjustments.append("Tekshirilgan e'lon — +4%")

    if len(similar_prices) > 10:
        confidence = "yuqori"
    elif len(similar_prices) > 5:
        confidence = "o'rtacha"
    else:
        confidence = "past"

    avg_similar = sum(similar_prices) / len(similar_prices) * area if similar_prices else mid

    return AVMEstimate(
        estimated_min=round(min_val, 2),
        estimated_max=round(max_val, 2),
        estimated_mid=round(mid, 2),
        confidence=confidence,
        similar_count=len(similar),
        similar_avg_price=round(avg_similar, 2),
        adjustments=adjustments,
    )
