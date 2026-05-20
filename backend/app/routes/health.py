from flask import Blueprint, jsonify
from sqlalchemy import text
from app import db

bp = Blueprint("health", __name__)


@bp.get("/health")
def verificar_saude():
    status = {"status": "ok", "database": "ok"}
    codigo_http = 200

    try:
        db.session.execute(text("SELECT 1"))
    except Exception as e:
        status["database"] = f"erro: {str(e)}"
        status["status"] = "degradado"
        codigo_http = 503

    return jsonify(status), codigo_http
