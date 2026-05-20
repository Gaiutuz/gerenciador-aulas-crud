import time
import json
import structlog
import httpx
from openai import OpenAI
from flask import current_app

logger = structlog.get_logger(__name__)

SYSTEM_PROMPT = """Você é um Assistente Pedagógico especializado em currículo e didática.
Sua função é analisar o tema de uma aula e sugerir conteúdos complementares relevantes,
tópicos relacionados e tags organizacionais para auxiliar docentes no planejamento pedagógico.

Sempre responda EXCLUSIVAMENTE em JSON válido, sem texto adicional, sem markdown, sem blocos de código.
O JSON deve seguir exatamente este schema:
{
  "contents": "string com os conteúdos complementares sugeridos (mínimo 3 tópicos detalhados)",
  "support_resources": "string com recursos de apoio recomendados (livros, sites, ferramentas, vídeos)",
  "tags": ["tag1", "tag2", "tag3"]
}
"""


def _criar_cliente(api_key: str) -> OpenAI:
    """
    Cria o cliente OpenAI com um httpx.Client explícito sem o argumento
    'proxies', que foi removido no httpx>=0.28 e causa o erro:
      Client.__init__() got an unexpected keyword argument 'proxies'
    """
    http_client = httpx.Client()
    return OpenAI(api_key=api_key, http_client=http_client)


def generate_recommendations(title: str, discipline: str, summary: str) -> dict:
    cliente = _criar_cliente(current_app.config["OPENAI_API_KEY"])
    modelo = current_app.config["OPENAI_MODEL"]

    prompt_usuario = (
        f"Disciplina: {discipline}\n"
        f"Título da Aula: {title}\n"
        f"Ementa/Resumo: {summary}\n\n"
        "Com base nessas informações, gere sugestões pedagógicas completas seguindo o schema JSON solicitado."
    )

    inicio = time.time()
    try:
        resposta = cliente.chat.completions.create(
            model=modelo,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt_usuario},
            ],
            temperature=0.7,
            max_tokens=1000,
            response_format={"type": "json_object"},
        )

        latencia = round(time.time() - inicio, 2)
        uso = resposta.usage
        conteudo_bruto = resposta.choices[0].message.content

        logger.info(
            "Requisição à IA concluída",
            titulo=title,
            disciplina=discipline,
            modelo=modelo,
            tokens_totais=uso.total_tokens if uso else "N/A",
            tokens_prompt=uso.prompt_tokens if uso else "N/A",
            tokens_resposta=uso.completion_tokens if uso else "N/A",
            latencia_segundos=latencia,
        )

        dados = json.loads(conteudo_bruto)

        return {
            "contents": dados.get("contents", ""),
            "support_resources": dados.get("support_resources", ""),
            "tags": dados.get("tags", [])[:5],
        }

    except json.JSONDecodeError as e:
        latencia = round(time.time() - inicio, 2)
        logger.error("Erro ao parsear JSON da resposta da IA", erro=str(e), latencia_segundos=latencia)
        raise ValueError("A IA retornou uma resposta JSON inválida.") from e

    except Exception as e:
        latencia = round(time.time() - inicio, 2)
        logger.error("Falha na requisição à IA", erro=str(e), latencia_segundos=latencia)
        raise
