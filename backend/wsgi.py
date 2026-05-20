import os
from app import create_app

# Ponto de entrada para o Gunicorn em produção
app = create_app(os.environ.get("FLASK_ENV", "production"))
