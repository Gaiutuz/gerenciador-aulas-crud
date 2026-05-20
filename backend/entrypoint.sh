#!/bin/sh
set -e

echo "Aguardando banco de dados..."
until python -c "
import psycopg2, os, sys
try:
    psycopg2.connect(os.environ['DATABASE_URL'])
    sys.exit(0)
except Exception as e:
    print('  Banco ainda não está pronto:', e)
    sys.exit(1)
"; do
  sleep 2
done

echo "Banco disponível. Aplicando schema..."
python -c "
from app import create_app, db
from sqlalchemy import text
import os

app = create_app(os.environ.get('FLASK_ENV', 'development'))
with app.app_context():
    # Cria as tabelas caso ainda não existam
    db.create_all()

    # Migra a coluna tags de json -> jsonb se necessário (operação idempotente)
    resultado = db.session.execute(text(
        \"\"\"
        SELECT data_type
        FROM information_schema.columns
        WHERE table_name = 'lesson_plans' AND column_name = 'tags'
        \"\"\"
    )).fetchone()

    if resultado and resultado[0] == 'json':
        print('Migrando coluna tags: json -> jsonb...')
        db.session.execute(text(
            'ALTER TABLE lesson_plans ALTER COLUMN tags TYPE jsonb USING tags::jsonb'
        ))
        db.session.commit()
        print('Coluna tags migrada para jsonb com sucesso.')
    else:
        print('Coluna tags já é jsonb ou não existe. Nada a fazer.')

    print('Schema pronto.')
"

if [ "${FLASK_ENV}" = "development" ]; then
  echo "Modo desenvolvimento — iniciando Flask debug server..."
  exec python run.py
else
  echo "Modo produção — iniciando Gunicorn..."
  exec gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 wsgi:app
fi
