"""add_user_avatar_documents

Revision ID: d8f6e3c2a1b0
Revises: c7a55b2f1e00
Create Date: 2026-06-19 14:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d8f6e3c2a1b0"
down_revision: Union[str, None] = "c7a55b2f1e00"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("avatar_url", sa.String(500), nullable=True))
    op.add_column("users", sa.Column("documents", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")))


def downgrade() -> None:
    op.drop_column("users", "documents")
    op.drop_column("users", "avatar_url")
