"""add_is_urgent_price_alert_quality

Revision ID: c7a55b2f1e00
Revises: 1476bce6ecfd
Create Date: 2026-06-19 12:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c7a55b2f1e00"
down_revision: Union[str, None] = "1476bce6ecfd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("properties", sa.Column("is_urgent", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.add_column("properties", sa.Column("urgent_reduction", sa.Float(), nullable=True))
    op.create_index(op.f("ix_properties_is_urgent"), "properties", ["is_urgent"], unique=False)

    op.create_table(
        "price_alerts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("property_id", sa.Integer(), nullable=False),
        sa.Column("target_price", sa.Float(), nullable=True),
        sa.Column("notified", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["property_id"], ["properties.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_price_alerts_id"), "price_alerts", ["id"], unique=False)
    op.create_index(op.f("ix_price_alerts_user_id"), "price_alerts", ["user_id"], unique=False)
    op.create_index(op.f("ix_price_alerts_property_id"), "price_alerts", ["property_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_price_alerts_property_id"), table_name="price_alerts")
    op.drop_index(op.f("ix_price_alerts_user_id"), table_name="price_alerts")
    op.drop_index(op.f("ix_price_alerts_id"), table_name="price_alerts")
    op.drop_table("price_alerts")
    op.drop_index(op.f("ix_properties_is_urgent"), table_name="properties")
    op.drop_column("properties", "urgent_reduction")
    op.drop_column("properties", "is_urgent")
