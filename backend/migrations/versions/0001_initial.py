"""Migração inicial — cria a tabela lesson_plans

Revision ID: 0001_initial
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.create_table(
        'lesson_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('objective', sa.Text(), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('planned_date', sa.Date(), nullable=True),
        sa.Column('discipline', sa.String(length=150), nullable=False),
        sa.Column('contents', sa.Text(), nullable=True),
        sa.Column('support_resources', sa.Text(), nullable=True),
        sa.Column('tags', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_lesson_plans_title'), 'lesson_plans', ['title'], unique=False)
    op.create_index(op.f('ix_lesson_plans_discipline'), 'lesson_plans', ['discipline'], unique=False)
    op.create_index(op.f('ix_lesson_plans_planned_date'), 'lesson_plans', ['planned_date'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_lesson_plans_planned_date'), table_name='lesson_plans')
    op.drop_index(op.f('ix_lesson_plans_discipline'), table_name='lesson_plans')
    op.drop_index(op.f('ix_lesson_plans_title'), table_name='lesson_plans')
    op.drop_table('lesson_plans')
