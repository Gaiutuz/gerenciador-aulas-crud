import os
from dotenv import load_dotenv

load_dotenv()

class BaseConfig:
    SECRET_KEY = os.environ.get("SECRET_KEY", "troque-em-producao")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
    OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:postgres@db:5432/lessonplanner"
    )

class ProductionConfig(BaseConfig):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "")

class TestingConfig(BaseConfig):
    TESTING = True
    # Banco em memória para testes automatizados
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
