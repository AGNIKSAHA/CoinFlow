"""add quantity and total_cost to redemptions

Revision ID: 2959e1fa128e
Revises: '5b8aef07c482'
Create Date: 2026-08-23 18:35:05.062215

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import sqlmodel

revision: str = '2959e1fa128e'
down_revision: Union[str, None] = '5b8aef07c482'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('redemptions', sa.Column('quantity', sa.Integer(), server_default='1', nullable=False))
    op.add_column('redemptions', sa.Column('total_cost', sa.Integer(), server_default='0', nullable=False))
    op.execute("UPDATE redemptions SET total_cost = coin_cost * quantity WHERE total_cost = 0;")

def downgrade() -> None:
    op.drop_column('redemptions', 'total_cost')
    op.drop_column('redemptions', 'quantity')
