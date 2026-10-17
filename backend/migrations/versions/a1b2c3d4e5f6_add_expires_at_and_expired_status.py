"""add_expires_at_and_expired_status

Revision ID: a1b2c3d4e5f6
Revises: e1b2c3d4e5f6
Create Date: 2026-06-20 15:30:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "e1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("properties", sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True))
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE propertystatus ADD VALUE IF NOT EXISTS 'expired'")


def downgrade() -> None:
    op.drop_column("properties", "expires_at")
