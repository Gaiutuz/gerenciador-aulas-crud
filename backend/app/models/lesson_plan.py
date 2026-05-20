from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import JSONB
from app import db


class LessonPlan(db.Model):
    __tablename__ = "lesson_plans"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False, index=True)
    objective = db.Column(db.Text, nullable=False)
    summary = db.Column(db.Text, nullable=False)
    planned_date = db.Column(db.Date, nullable=True, index=True)
    discipline = db.Column(db.String(150), nullable=False, index=True)
    contents = db.Column(db.Text, nullable=True)
    support_resources = db.Column(db.Text, nullable=True)
    # JSONB no lugar de JSON: suporta o operador @> de contenção, necessário para filtrar por tags
    tags = db.Column(JSONB, nullable=True, default=list)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "objective": self.objective,
            "summary": self.summary,
            "planned_date": self.planned_date.isoformat() if self.planned_date else None,
            "discipline": self.discipline,
            "contents": self.contents,
            "support_resources": self.support_resources,
            "tags": self.tags or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<PlanoDeAula {self.id}: {self.title}>"
