"""add_user_region_district

Revision ID: c852d76459ed
Revises: d9f0956bc056
Create Date: 2026-06-19 22:59:35.379186
"""
from alembic import op
import sqlalchemy as sa


revision = 'c852d76459ed'
down_revision = 'd9f0956bc056'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('region', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('district', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'district')
    op.drop_column('users', 'region')
