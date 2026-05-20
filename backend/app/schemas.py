from marshmallow import Schema, fields, validate, EXCLUDE


class LessonPlanSchema(Schema):
    # Campos dump_only são ignorados silenciosamente no load (sem gerar erro de validação)
    class Meta:
        unknown = EXCLUDE  # descarta campos desconhecidos enviados pelo cliente (ex: id, created_at)

    id = fields.Int(dump_only=True)
    title = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=255),
        error_messages={"required": "O título é obrigatório."},
    )
    objective = fields.Str(
        required=True,
        validate=validate.Length(min=10),
        error_messages={"required": "O objetivo é obrigatório."},
    )
    summary = fields.Str(
        required=True,
        validate=validate.Length(min=10),
        error_messages={"required": "A ementa é obrigatória."},
    )
    planned_date = fields.Date(allow_none=True, load_default=None)
    discipline = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=150),
        error_messages={"required": "A disciplina é obrigatória."},
    )
    contents = fields.Str(allow_none=True, load_default=None)
    support_resources = fields.Str(allow_none=True, load_default=None)
    tags = fields.List(fields.Str(), load_default=list)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class SmartAssistSchema(Schema):
    class Meta:
        unknown = EXCLUDE

    title = fields.Str(required=True, validate=validate.Length(min=3))
    discipline = fields.Str(required=True, validate=validate.Length(min=2))
    summary = fields.Str(required=True, validate=validate.Length(min=10))


lesson_plan_schema = LessonPlanSchema()
lesson_plans_schema = LessonPlanSchema(many=True)
smart_assist_schema = SmartAssistSchema()
