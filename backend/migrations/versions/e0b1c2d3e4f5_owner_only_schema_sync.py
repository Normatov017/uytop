"""owner_only_schema_sync

Revision ID: e0b1c2d3e4f5
Revises: c852d76459ed
Create Date: 2026-06-20
"""
from alembic import op


revision = "e0b1c2d3e4f5"
down_revision = "c852d76459ed"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram VARCHAR(100) NOT NULL DEFAULT ''")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS documents JSON NOT NULL DEFAULT '[]'::json")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS region VARCHAR(100) NOT NULL DEFAULT ''")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100) NOT NULL DEFAULT ''")

    op.execute("ALTER TABLE properties ADD COLUMN IF NOT EXISTS metro_station VARCHAR(120)")
    op.execute("ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN NOT NULL DEFAULT false")
    op.execute("ALTER TABLE properties ADD COLUMN IF NOT EXISTS urgent_reduction DOUBLE PRECISION")
    op.execute("ALTER TABLE properties ADD COLUMN IF NOT EXISTS auto_decrease_enabled BOOLEAN NOT NULL DEFAULT false")
    op.execute("ALTER TABLE properties ADD COLUMN IF NOT EXISTS auto_decrease_rate DOUBLE PRECISION")
    op.execute("ALTER TABLE properties ADD COLUMN IF NOT EXISTS virtual_tour_url VARCHAR(500)")

    op.execute("CREATE INDEX IF NOT EXISTS ix_properties_metro_station ON properties (metro_station)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_properties_is_urgent ON properties (is_urgent)")


def downgrade() -> None:
    pass
