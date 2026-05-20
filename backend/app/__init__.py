import structlog
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_name="development"):
    app = Flask(__name__)
    app.config.from_object(f"app.config.{config_name.capitalize()}Config")

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config.get("CORS_ORIGINS", "*"))

    # Configura o structlog para logs estruturados em JSON
    structlog.configure(
        processors=[
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer(),
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
    )

    from app.routes.lesson_plans import bp as lesson_plans_bp
    from app.routes.health import bp as health_bp

    app.register_blueprint(lesson_plans_bp, url_prefix="/api/lesson-plans")
    app.register_blueprint(health_bp)

    return app
