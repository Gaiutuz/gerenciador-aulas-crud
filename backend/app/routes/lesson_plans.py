from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from sqlalchemy import asc, desc, cast
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
import structlog

from app import db
from app.models.lesson_plan import LessonPlan
from app.schemas import lesson_plan_schema, lesson_plans_schema, smart_assist_schema
from app.services.ai_service import generate_recommendations

bp = Blueprint("lesson_plans", __name__)
logger = structlog.get_logger(__name__)


def erro_response(mensagem, status=400, detalhes=None):
    corpo = {"error": mensagem}
    if detalhes:
        corpo["details"] = detalhes
    return jsonify(corpo), status


# ─── LISTAGEM (com paginação, filtros e ordenação) ────────────────────────────
@bp.get("/")
def listar_planos():
    pagina = request.args.get("page", 1, type=int)
    por_pagina = min(request.args.get("per_page", 10, type=int), 50)
    disciplina = request.args.get("discipline", "").strip()
    tag = request.args.get("tag", "").strip()
    data_inicio = request.args.get("date_from", "").strip()
    data_fim = request.args.get("date_to", "").strip()
    busca = request.args.get("search", "").strip()
    ordenar_por = request.args.get("sort_by", "created_at")
    ordem = request.args.get("order", "desc")

    query = LessonPlan.query

    if disciplina:
        query = query.filter(LessonPlan.discipline.ilike(f"%{disciplina}%"))

    if tag:
        # Operador JSONB @>: verifica se o array de tags contém o valor informado.
        # cast([tag], JSONB) gera um literal JSONB válido para a verificação de contenção.
        query = query.filter(
            LessonPlan.tags.cast(JSONB).contains(cast([tag], JSONB))
        )

    if data_inicio:
        try:
            query = query.filter(
                LessonPlan.planned_date >= datetime.fromisoformat(data_inicio).date()
            )
        except ValueError:
            pass

    if data_fim:
        try:
            query = query.filter(
                LessonPlan.planned_date <= datetime.fromisoformat(data_fim).date()
            )
        except ValueError:
            pass

    if busca:
        query = query.filter(LessonPlan.title.ilike(f"%{busca}%"))

    coluna_ordem = LessonPlan.title if ordenar_por == "title" else LessonPlan.created_at
    fn_ordem = asc if ordem == "asc" else desc
    query = query.order_by(fn_ordem(coluna_ordem))

    paginado = query.paginate(page=pagina, per_page=por_pagina, error_out=False)

    logger.info(
        "Planos de aula listados",
        pagina=pagina,
        por_pagina=por_pagina,
        total=paginado.total,
        filtros={"disciplina": disciplina, "tag": tag, "busca": busca},
    )

    return jsonify({
        "items": lesson_plans_schema.dump(paginado.items),
        "pagination": {
            "page": paginado.page,
            "per_page": paginado.per_page,
            "total": paginado.total,
            "pages": paginado.pages,
            "has_next": paginado.has_next,
            "has_prev": paginado.has_prev,
        },
    })


# ─── BUSCAR UM PLANO ──────────────────────────────────────────────────────────
@bp.get("/<int:plano_id>")
def buscar_plano(plano_id):
    plano = db.get_or_404(LessonPlan, plano_id, description="Plano de aula não encontrado.")
    return jsonify(lesson_plan_schema.dump(plano))


# ─── CRIAR ────────────────────────────────────────────────────────────────────
@bp.post("/")
def criar_plano():
    dados_json = request.get_json(silent=True)
    if not dados_json:
        return erro_response("O corpo da requisição deve ser JSON válido.")

    try:
        dados = lesson_plan_schema.load(dados_json)
    except ValidationError as err:
        return erro_response("Falha na validação.", detalhes=err.messages)

    plano = LessonPlan(**dados)
    db.session.add(plano)
    db.session.commit()

    logger.info("Plano de aula criado", plano_id=plano.id, titulo=plano.title)
    return jsonify(lesson_plan_schema.dump(plano)), 201


# ─── ATUALIZAR ────────────────────────────────────────────────────────────────
@bp.put("/<int:plano_id>")
def atualizar_plano(plano_id):
    plano = db.get_or_404(LessonPlan, plano_id, description="Plano de aula não encontrado.")
    dados_json = request.get_json(silent=True)
    if not dados_json:
        return erro_response("O corpo da requisição deve ser JSON válido.")

    try:
        # partial=True: valida apenas os campos presentes no payload
        # unknown=EXCLUDE (definido no Meta): descarta silenciosamente id, created_at, updated_at
        dados = lesson_plan_schema.load(dados_json, partial=True)
    except ValidationError as err:
        return erro_response("Falha na validação.", detalhes=err.messages)

    for chave, valor in dados.items():
        setattr(plano, chave, valor)

    db.session.commit()
    logger.info("Plano de aula atualizado", plano_id=plano.id)
    return jsonify(lesson_plan_schema.dump(plano))


# ─── EXCLUIR ──────────────────────────────────────────────────────────────────
@bp.delete("/<int:plano_id>")
def excluir_plano(plano_id):
    plano = db.get_or_404(LessonPlan, plano_id, description="Plano de aula não encontrado.")
    db.session.delete(plano)
    db.session.commit()
    logger.info("Plano de aula excluído", plano_id=plano_id)
    return jsonify({"message": "Plano de aula excluído com sucesso."}), 200


# ─── SMART ASSIST ─────────────────────────────────────────────────────────────
@bp.post("/smart-assist")
def smart_assist():
    dados_json = request.get_json(silent=True)
    if not dados_json:
        return erro_response("O corpo da requisição deve ser JSON válido.")

    try:
        dados = smart_assist_schema.load(dados_json)
    except ValidationError as err:
        return erro_response("Falha na validação.", detalhes=err.messages)

    try:
        recomendacoes = generate_recommendations(
            title=dados["title"],
            discipline=dados["discipline"],
            summary=dados["summary"],
        )
        return jsonify(recomendacoes)
    except ValueError as e:
        return erro_response(str(e), status=502)
    except Exception as e:
        logger.error("Erro no Smart Assist", erro=str(e))
        return erro_response("Serviço de IA indisponível. Tente novamente mais tarde.", status=503)


# ─── DISCIPLINAS ──────────────────────────────────────────────────────────────
@bp.get("/meta/disciplines")
def listar_disciplinas():
    linhas = (
        db.session.query(LessonPlan.discipline)
        .distinct()
        .order_by(LessonPlan.discipline)
        .all()
    )
    return jsonify([r[0] for r in linhas])


# ─── TAGS ─────────────────────────────────────────────────────────────────────
@bp.get("/meta/tags")
def listar_tags():
    disciplina = request.args.get("discipline", "").strip()
    query = db.session.query(LessonPlan.tags)
    if disciplina:
        query = query.filter(LessonPlan.discipline == disciplina)
    linhas = query.all()
    conjunto_tags = set()
    for (tags,) in linhas:
        if tags:
            conjunto_tags.update(tags)
    return jsonify(sorted(conjunto_tags))
