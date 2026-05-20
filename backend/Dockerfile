FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=5 \
  CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["sh", "entrypoint.sh"]
