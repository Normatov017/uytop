import enum


class UserRole(str, enum.Enum):
    USER = "USER"
    OWNER = "OWNER"
    AGENT = "AGENT"
    ADMIN = "ADMIN"
    DEVELOPER = "DEVELOPER"


class OperationType(str, enum.Enum):
    sale = "sale"
    rent = "rent"
    daily_rent = "daily_rent"


class PropertyType(str, enum.Enum):
    apartment = "apartment"
    house = "house"
    land = "land"
    commercial = "commercial"
    new_building = "new_building"


class Currency(str, enum.Enum):
    USD = "USD"
    UZS = "UZS"


class PricePeriod(str, enum.Enum):
    month = "month"
    day = "day"


class OwnerType(str, enum.Enum):
    owner = "owner"
    agent = "agent"
    developer = "developer"


class PropertyStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    rejected = "rejected"
    sold = "sold"
    rented = "rented"
