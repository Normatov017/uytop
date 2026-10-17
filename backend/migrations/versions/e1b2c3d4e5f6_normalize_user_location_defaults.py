"""normalize_user_location_defaults

Revision ID: e1b2c3d4e5f6
Revises: e0b1c2d3e4f5
Create Date: 2026-06-20
"""
from alembic import op


revision = "e1b2c3d4e5f6"
down_revision = "e0b1c2d3e4f5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("UPDATE users SET region = '' WHERE region IS NULL")
    op.execute("UPDATE users SET district = '' WHERE district IS NULL")
    op.execute("ALTER TABLE users ALTER COLUMN region SET DEFAULT ''")
    op.execute("ALTER TABLE users ALTER COLUMN district SET DEFAULT ''")
    op.execute("ALTER TABLE users ALTER COLUMN region SET NOT NULL")
    op.execute("ALTER TABLE users ALTER COLUMN district SET NOT NULL")


def downgrade() -> None:
    op.execute("ALTER TABLE users ALTER COLUMN district DROP NOT NULL")
    op.execute("ALTER TABLE users ALTER COLUMN region DROP NOT NULL")
