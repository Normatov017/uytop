from pydantic import BaseModel


class PropertyInsight(BaseModel):
    estimated_market_price: float
    price_delta_percent: float
    price_label: str
    mahalla_score: int
    commute_score: int
    liquidity_score: int
    trust_score: int
    scam_risk: str
    mortgage_monthly_usd: float | None
    negotiation_tip: str
    highlights: list[str]

    # Quality of Life scores
    noise_score: int = 70
    air_quality_score: int = 65
    green_zone_score: int = 60
    transport_score: int = 75
    school_rating: int = 70
    family_score: int = 75
    solo_score: int = 65
    investor_score: int = 80


class AVMEstimate(BaseModel):
    estimated_min: float
    estimated_max: float
    estimated_mid: float
    confidence: str
    similar_count: int
    similar_avg_price: float
    adjustments: list[str]
