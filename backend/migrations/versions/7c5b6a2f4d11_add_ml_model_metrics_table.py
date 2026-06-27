"""Add ML model metrics table

Revision ID: 7c5b6a2f4d11
Revises: 5ce0d85bb1e9
Create Date: 2026-06-27 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7c5b6a2f4d11'
down_revision = '5ce0d85bb1e9'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'ml_model_metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('model_name', sa.String(length=100), nullable=False),
        sa.Column('metric_name', sa.String(length=100), nullable=False),
        sa.Column('metric_value', sa.Float(), nullable=False),
        sa.Column('sample_count', sa.Integer(), nullable=True),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_ml_model_metrics')),
    )
    op.create_index(op.f('ix_ml_model_metrics_model_name'), 'ml_model_metrics', ['model_name'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_ml_model_metrics_model_name'), table_name='ml_model_metrics')
    op.drop_table('ml_model_metrics')
