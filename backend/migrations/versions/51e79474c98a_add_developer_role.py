"""add_developer_role

Revision ID: 51e79474c98a
Revises: c69a18479a4f
Create Date: 2026-06-19 20:10:47.127932
"""
from alembic import op


revision = '51e79474c98a'
down_revision = 'c69a18479a4f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE userrole ADD VALUE 'DEVELOPER'")


def downgrade() -> None:
    op.execute("ALTER TYPE userrole RENAME TO userrole_old")
    op.execute("CREATE TYPE userrole AS ENUM('USER', 'OWNER', 'AGENT', 'ADMIN')")
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE userrole USING role::text::userrole")
    op.execute("DROP TYPE userrole_old")
