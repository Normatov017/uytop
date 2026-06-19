from decimal import Decimal

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.enums import Currency, OperationType, OwnerType, PricePeriod, PropertyStatus, PropertyType, UserRole
from app.models.image import PropertyImage
from app.models.property import Property
from app.models.user import User


SEED_PROPERTIES = [
    {
        "title": "2 xonali kvartira, Yunusobod",
        "price": Decimal("72000"),
        "district": "Yunusobod",
        "rooms": 2,
        "area_m2": 58,
        "floor": 5,
        "total_floors": 9,
        "property_type": PropertyType.apartment,
        "repair_type": "Yaxshi remont",
        "operation_type": OperationType.sale,
        "latitude": 41.34,
        "longitude": 69.31,
        "views_count": 234,
        "image": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop&auto=format",
        "amenities": ["lift", "parking", "metro", "school", "balcony", "ac"],
    },
    {
        "title": "3 xonali kvartira, Chilonzor",
        "price": Decimal("89000"),
        "district": "Chilonzor",
        "rooms": 3,
        "area_m2": 76,
        "floor": 3,
        "total_floors": 9,
        "property_type": PropertyType.apartment,
        "repair_type": "Kapital remont",
        "operation_type": OperationType.sale,
        "latitude": 41.29,
        "longitude": 69.21,
        "views_count": 512,
        "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop&auto=format",
        "amenities": ["lift", "parking", "balcony", "ac"],
    },
    {
        "title": "Tijoriy maydon, Yakkasaroy",
        "price": Decimal("2500"),
        "district": "Yakkasaroy",
        "rooms": 0,
        "area_m2": 140,
        "floor": 1,
        "total_floors": 5,
        "property_type": PropertyType.commercial,
        "repair_type": "Ofis remont",
        "operation_type": OperationType.rent,
        "price_period": PricePeriod.month,
        "latitude": 41.30,
        "longitude": 69.28,
        "views_count": 178,
        "image": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format",
        "amenities": ["parking", "ac"],
    },
]


def seed() -> None:
    db = SessionLocal()
    try:
        if db.scalar(select(User).where(User.email == "admin@uymap.uz")):
            return

        admin = User(
            full_name="UyMap Admin",
            phone="+998901111111",
            email="admin@uymap.uz",
            role=UserRole.ADMIN,
            hashed_password=get_password_hash("admin12345"),
        )
        owner = User(
            full_name="Alisher Toshmatov",
            phone="+998901234567",
            email="owner@uymap.uz",
            role=UserRole.OWNER,
            hashed_password=get_password_hash("owner12345"),
        )
        db.add_all([admin, owner])
        db.flush()

        for item in SEED_PROPERTIES:
            image = item.pop("image")
            prop = Property(
                **item,
                description="UyMap.uz orqali joylangan tekshirilgan e'lon. Barcha asosiy qulayliklar va aloqa ma'lumotlari mavjud.",
                currency=Currency.USD,
                owner_type=OwnerType.owner,
                status=PropertyStatus.active,
                is_verified=True,
                is_premium=True,
                owner_id=owner.id,
            )
            db.add(prop)
            db.flush()
            db.add(PropertyImage(property_id=prop.id, url=image, is_main=True, sort_order=0))

        db.commit()
        print("Seed data created. Admin: admin@uymap.uz / admin12345")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
